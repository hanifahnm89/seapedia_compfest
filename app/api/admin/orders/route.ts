import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole, ok } from '@/lib/api-server'
import { Role } from '@prisma/client'

export async function GET(req: NextRequest) {
  const { ctx, error } = await requireRole(req, Role.ADMIN)
  if (error) return error

  const orders = await prisma.order.findMany({
    include: {
      store: { select: { name: true } },
      buyer: { include: { user: { select: { name: true } } } },
      items: true,
      deliveryJob: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })
  return ok({ orders })
}