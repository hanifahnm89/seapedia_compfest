import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole, ok, err } from '@/lib/api-server'
import { Role } from '@prisma/client'

// GET available jobs for drivers
export async function GET(req: NextRequest) {
  const { ctx, error } = await requireRole(req, Role.DRIVER)
  if (error) return error

  const driver = await prisma.driverProfile.findUnique({ where: { userId: ctx!.user.id } })
  if (!driver) return err('Profil driver tidak ditemukan', 404)

  const { searchParams } = new URL(req.url)
  const mine = searchParams.get('mine') === 'true'

  if (mine) {
    const jobs = await prisma.deliveryJob.findMany({
      where: { driverId: driver.id },
      include: {
        order: {
          include: {
            items: true,
            store: { select: { id: true, name: true } },
            address: true,
            buyer: { include: { user: { select: { name: true } } } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    return ok({ jobs })
  }

  const jobs = await prisma.deliveryJob.findMany({
    where: { status: 'AVAILABLE' },
    include: {
      order: {
        include: {
          items: true,
          store: { select: { id: true, name: true } },
          address: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  })
  return ok({ jobs })
}