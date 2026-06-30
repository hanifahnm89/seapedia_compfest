import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole, ok, err } from '@/lib/api-server'
import { Role } from '@prisma/client'

export async function POST(req: NextRequest) {
  const { ctx, error } = await requireRole(req, Role.ADMIN)
  if (error) return error

  // Find all active orders past their overdue deadline
  const now = new Date()
  const overdueOrders = await prisma.order.findMany({
    where: {
      overdueAt: { lte: now },
      isOverdue: false,
      status: { in: ['SEDANG_DIKEMAS', 'MENUNGGU_PENGIRIM', 'SEDANG_DIKIRIM'] },
    },
    include: {
      items: true,
      buyer: true,
      deliveryJob: true,
    },
  })

  const results: any[] = []
  for (const order of overdueOrders) {
    await prisma.$transaction(async (tx) => {
      // Mark as overdue and returned
      await tx.order.update({
        where: { id: order.id },
        data: { status: 'DIKEMBALIKAN', isOverdue: true },
      })
      await tx.orderStatusHistory.create({
        data: { orderId: order.id, status: 'DIKEMBALIKAN', note: 'Auto-return: order melewati batas waktu pengiriman' },
      })

      // Refund to buyer wallet
      await tx.buyerProfile.update({
        where: { id: order.buyerId },
        data: { balance: { increment: order.total } },
      })
      await tx.walletTransaction.create({
        data: {
          buyerId: order.buyerId,
          amount: order.total,
          type: 'REFUND',
          description: `Refund order ${order.id} - melewati batas waktu`,
        },
      })

      // Restore stock
      for (const item of order.items) {
        await tx.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } })
      }

      // Cancel delivery job if any
      if (order.deliveryJob && order.deliveryJob.status !== 'COMPLETED') {
        await tx.deliveryJob.update({ where: { id: order.deliveryJob.id }, data: { status: 'COMPLETED' } })
      }

      results.push({ orderId: order.id, refundedAmount: order.total })
    })
  }

  return ok({ message: `${results.length} order diproses sebagai overdue`, results })
}