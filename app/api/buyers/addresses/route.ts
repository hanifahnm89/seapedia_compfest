import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireRole, ok, err } from '@/lib/api-server'
import { Role } from '@prisma/client'

export async function GET(req: NextRequest) {
  const { ctx, error } = await requireRole(req, Role.BUYER)
  if (error) return error
  const buyer = await prisma.buyerProfile.findUnique({ where: { userId: ctx!.user.id } })
  if (!buyer) return err('Profil buyer tidak ditemukan', 404)
  const addresses = await prisma.address.findMany({ where: { buyerId: buyer.id }, orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }] })
  return ok({ addresses })
}

const schema = z.object({
  label: z.string().min(1),
  street: z.string().min(5),
  city: z.string().min(2),
  province: z.string().min(2),
  zipCode: z.string().min(5),
  isDefault: z.boolean().default(false),
})

export async function POST(req: NextRequest) {
  const { ctx, error } = await requireRole(req, Role.BUYER)
  if (error) return error
  const buyer = await prisma.buyerProfile.findUnique({ where: { userId: ctx!.user.id } })
  if (!buyer) return err('Profil buyer tidak ditemukan', 404)
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return err(parsed.error.issues[0].message)
  if (parsed.data.isDefault) {
    await prisma.address.updateMany({ where: { buyerId: buyer.id }, data: { isDefault: false } })
  }
  const address = await prisma.address.create({ data: { ...parsed.data, buyerId: buyer.id } })
  return ok({ address }, 201)
}