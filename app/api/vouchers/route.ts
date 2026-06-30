import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireRole, ok, err } from '@/lib/api-server'
import { Role } from '@prisma/client'

export async function GET(req: NextRequest) {
  const { ctx, error } = await requireRole(req, Role.ADMIN)
  if (error) return error
  const vouchers = await prisma.voucher.findMany({ orderBy: { createdAt: 'desc' } })
  return ok({ vouchers })
}

const schema = z.object({
  code: z.string().min(3).max(30).toUpperCase(),
  description: z.string().optional(),
  discountType: z.enum(['PERCENTAGE', 'FIXED']),
  discountValue: z.number().positive(),
  minPurchase: z.number().min(0).default(0),
  maxDiscount: z.number().positive().optional(),
  expiresAt: z.string().datetime(),
  usageLimit: z.number().int().positive(),
})

export async function POST(req: NextRequest) {
  const { ctx, error } = await requireRole(req, Role.ADMIN)
  if (error) return error

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return err(parsed.error.issues[0].message)

  const existing = await prisma.voucher.findUnique({ where: { code: parsed.data.code } })
  if (existing) return err('Kode voucher sudah digunakan')

  const voucher = await prisma.voucher.create({ data: { ...parsed.data, expiresAt: new Date(parsed.data.expiresAt) } })
  return ok({ voucher }, 201)
}