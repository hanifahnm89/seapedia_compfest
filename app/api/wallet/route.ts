import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole, ok, err } from '@/lib/api-server'
import { Role } from '@prisma/client'

export async function GET(req: NextRequest) {
  const { ctx, error } = await requireRole(req, Role.BUYER)
  if (error) return error

  const buyer = await prisma.buyerProfile.findUnique({
    where: { userId: ctx!.user.id },
    include: { walletHistory: { orderBy: { createdAt: 'desc' }, take: 30 } },
  })
  if (!buyer) return err('Profil buyer tidak ditemukan', 404)

  return ok({ balance: buyer.balance, history: buyer.walletHistory })
}