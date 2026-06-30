import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireRole, ok, err } from '@/lib/api-server'
import { Role } from '@prisma/client'

export async function POST(req: NextRequest) {
  const { ctx, error } = await requireRole(req, Role.BUYER)
  if (error) return error

  const body = await req.json()
  const parsed = z.object({ code: z.string(), subtotal: z.number() }).safeParse(body)
  if (!parsed.success) return err(parsed.error.issues[0].message)

  const { code, subtotal } = parsed.data
  const voucher = await prisma.voucher.findUnique({ where: { code } })

  if (!voucher || !voucher.isActive) return err('Voucher tidak valid atau tidak aktif')
  if (new Date() > voucher.expiresAt) return err('Voucher sudah kadaluarsa')
  if (voucher.usageCount >= voucher.usageLimit) return err('Voucher sudah habis digunakan')
  if (subtotal < voucher.minPurchase) return err(`Minimum pembelian Rp ${voucher.minPurchase.toLocaleString('id-ID')}`)

  let discountAmount = 0
  if (voucher.discountType === 'PERCENTAGE') {
    discountAmount = subtotal * (voucher.discountValue / 100)
    if (voucher.maxDiscount) discountAmount = Math.min(discountAmount, voucher.maxDiscount)
  } else {
    discountAmount = voucher.discountValue
  }

  return ok({ voucher, discountAmount, type: 'VOUCHER' })
}