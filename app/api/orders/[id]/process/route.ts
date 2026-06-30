import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole, ok, err } from '@/lib/api-server'
import { Role } from '@prisma/client'

type Params = { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params
  const { ctx, error } = await requireRole(req, Role.SELLER)
  if (error) return error

  const store = await prisma.store.findUnique({ where: { sellerId: ctx!.user.id } })
  if (!store) return err('Toko tidak ditemukan', 404)

  const order = await prisma.order.findUnique({ where: { id } })
  if (!order || order.storeId !== store.id) return err('Order tidak ditemukan', 404)
  if (order.status !== 'SEDANG_DIKEMAS') return err('Order tidak dalam status Sedang Dikemas')

  const [updatedOrder] = await prisma.$transaction([
    prisma.order.update({
      where: { id },
      data: { status: 'MENUNGGU_PENGIRIM' },
    }),
    prisma.orderStatusHistory.create({
      data: { orderId: id, status: 'MENUNGGU_PENGIRIM', note: 'Order diproses oleh seller, menunggu driver' },
    }),
    prisma.deliveryJob.create({
      data: { orderId: id, fee: order.deliveryFee, status: 'AVAILABLE' },
    }),
  ])

  return ok({ order: updatedOrder })
}