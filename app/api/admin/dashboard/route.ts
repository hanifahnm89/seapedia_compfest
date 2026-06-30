import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole, ok, err } from '@/lib/api-server'
import { Role } from '@prisma/client'

export async function GET(req: NextRequest) {
  const { ctx, error } = await requireRole(req, Role.ADMIN)
  if (error) return error

  const [
    totalUsers, totalStores, totalProducts,
    totalOrders, ordersByStatus,
    totalVouchers, totalPromos,
    totalJobs, jobsByStatus,
    overdueOrders,
    recentOrders,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.store.count(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.order.count(),
    prisma.order.groupBy({ by: ['status'], _count: true }),
    prisma.voucher.count(),
    prisma.promo.count(),
    prisma.deliveryJob.count(),
    prisma.deliveryJob.groupBy({ by: ['status'], _count: true }),
    prisma.order.findMany({
      where: { isOverdue: true },
      include: { store: { select: { name: true } }, buyer: { include: { user: { select: { name: true } } } } },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    prisma.order.findMany({
      include: { store: { select: { name: true } }, buyer: { include: { user: { select: { name: true } } } } },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
  ])

  return ok({
    stats: {
      users: totalUsers,
      stores: totalStores,
      products: totalProducts,
      orders: totalOrders,
      ordersByStatus: ordersByStatus.reduce((acc, s) => ({ ...acc, [s.status]: s._count }), {}),
      vouchers: totalVouchers,
      promos: totalPromos,
      deliveryJobs: totalJobs,
      jobsByStatus: jobsByStatus.reduce((acc, s) => ({ ...acc, [s.status]: s._count }), {}),
      overdueOrders: overdueOrders.length,
    },
    overdueOrders,
    recentOrders,
  })
}