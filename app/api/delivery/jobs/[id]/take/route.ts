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
  if (!job) return err('Job tidak ditemukan', 404)
  if (job.status !== 'AVAILABLE') return err('Job sudah diambil driver lain')

  // Check if driver already has an active job
  const activeJob = await prisma.deliveryJob.findFirst({ where: { driverId: driver.id, status: 'TAKEN' } })
  if (activeJob) return err('Selesaikan job aktif terlebih dahulu')

  const [updatedJob] = await prisma.$transaction([
    prisma.deliveryJob.update({
      where: { id },
      data: { driverId: driver.id, status: 'TAKEN', takenAt: new Date() },
    }),
    prisma.order.update({ where: { id: job.orderId }, data: { status: 'SEDANG_DIKIRIM' } }),
    prisma.orderStatusHistory.create({
      data: { orderId: job.orderId, status: 'SEDANG_DIKIRIM', note: `Diambil oleh driver` },
    }),
  ])

  return ok({ job: updatedJob })
}