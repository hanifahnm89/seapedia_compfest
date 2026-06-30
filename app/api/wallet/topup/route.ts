import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireRole, ok, err } from '@/lib/api-server'
import { Role } from '@prisma/client'

const schema = z.object({
  amount: z.number().positive().min(10000, 'Minimal top-up Rp 10.000').max(10000000, 'Maksimal top-up Rp 10.000.000'),
})

export async function POST(req: NextRequest) {
  const { ctx, error } = await requireRole(req, Role.BUYER)
  if (error) return error

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return err(parsed.error.issues[0].message)

  const buyer = await prisma.buyerProfile.findUnique({ where: { userId: ctx!.user.id } })
  if (!buyer) return err('Profil buyer tidak ditemukan', 404)

  const [updatedBuyer, tx] = await prisma.$transaction([
    prisma.buyerProfile.update({
      where: { id: buyer.id },
      data: { balance: { increment: parsed.data.amount } },
    }),
    prisma.walletTransaction.create({
      data: {
        buyerId: buyer.id,
        amount: parsed.data.amount,
        type: 'TOPUP',
        description: `Top-up saldo Rp ${parsed.data.amount.toLocaleString('id-ID')}`,
      },
    }),
  ])

  return ok({ balance: updatedBuyer.balance, transaction: tx })
}