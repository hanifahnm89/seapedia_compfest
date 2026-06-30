import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole, ok, err } from '@/lib/api-server'
import { Role } from '@prisma/client'

export async function GET(req: NextRequest) {
  const { ctx, error } = await requireRole(req, Role.SELLER)
  if (error) return error
  const store = await prisma.store.findUnique({ where: { sellerId: ctx!.user.id } })
  if (!store) return err('Toko tidak ditemukan', 404)
  const orders = await prisma.order.findMany({
    where: { storeId: store.id },
    include: {
      items: true,
      buyer: { include: { user: { select: { name: true } } } },
      statusHistory: { orderBy: { createdAt: 'desc' } },
      address: true,
    },
    orderBy: { createdAt: 'desc' },
  })
  return ok({ orders })
}