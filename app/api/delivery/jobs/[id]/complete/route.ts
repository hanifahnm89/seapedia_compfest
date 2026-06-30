import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole, ok, err } from '@/lib/api-server'
import { Role } from '@prisma/client'

type Params = { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params
  const { ctx, error } = await requireRole(req, Role.DRIVER)
  if (error) return error

  const driver = await prisma.driverProfile.findUnique({ where: { userId: ctx!.user.id } })
  if (!driver) return err('Profil driver tidak ditemukan', 404)

  const job = await prisma.deliveryJob.findUnique({ where: { id } })
  if (!job || job.driverId !== driver.id) return err('Job tidak ditemukan', 404)
  if (job.status !== 'TAKEN') return err('Job tidak dalam status aktif')

  // Driver earns 80% of delivery fee
  const earningAmount = parseFloat((job.fee * 0.8).toFixed(2))

  await prisma.$transaction([
    prisma.deliveryJob.update({
      where: { id },
      data: { status: 'COMPLETED', completedAt: new Date() },
    }),
    prisma.order.update({ where: { id: job.orderId }, data: { status: 'PESANAN_SELESAI' } }),
    prisma.orderStatusHistory.create({
      data: { orderId: job.orderId, status: 'PESANAN_SELESAI', note: 'Pesanan telah diterima' },
    }),
    prisma.driverEarning.create({
      data: { driverId: driver.id, jobId: job.id, amount: earningAmount },
    }),
    prisma.driverProfile.update({
      where: { id: driver.id },
      data: { balance: { increment: earningAmount } },
    }),
  ])

  return ok({ message: 'Pengiriman selesai', earningAmount })
}