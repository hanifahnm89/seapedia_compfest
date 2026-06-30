import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole, ok, err } from '@/lib/api-server'
import { Role } from '@prisma/client'

export async function GET(req: NextRequest) {
  const { ctx, error } = await requireRole(req, Role.DRIVER)
  if (error) return error

  const driver = await prisma.driverProfile.findUnique({ where: { userId: ctx!.user.id } })
  if (!driver) return err('Profil driver tidak ditemukan', 404)

  const earnings = await prisma.driverEarning.findMany({
    where: { driverId: driver.id },
    include: { job: { include: { order: { select: { id: true, store: { select: { name: true } } } } } } },
    orderBy: { createdAt: 'desc' },
  })

  const total = earnings.reduce((sum, e) => sum + e.amount, 0)

  return ok({ balance: driver.balance, earnings, total })
}