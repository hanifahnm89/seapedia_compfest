import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole, ok, err } from '@/lib/api-server'
import { Role } from '@prisma/client'

type Params = { params: Promise<{ id: string }> }

export async function DELETE(req: NextRequest, { params }: Params) {
  const { id } = await params
  const { ctx, error } = await requireRole(req, Role.BUYER)
  if (error) return error
  const buyer = await prisma.buyerProfile.findUnique({ where: { userId: ctx!.user.id } })
  if (!buyer) return err('Profil buyer tidak ditemukan', 404)
  const address = await prisma.address.findFirst({ where: { id, buyerId: buyer.id } })
  if (!address) return err('Alamat tidak ditemukan', 404)
  await prisma.address.delete({ where: { id } })
  return ok({ message: 'Alamat dihapus' })
}