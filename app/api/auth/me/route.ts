import { NextRequest } from 'next/server'
import { requireAuth, ok } from '@/lib/api-server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { ctx, error } = await requireAuth(req)
  if (error) return error

  const { user, session } = ctx!

  // Fetch financial summaries
  const buyer = user.roles.includes('BUYER')
    ? await prisma.buyerProfile.findUnique({ where: { userId: user.id }, select: { balance: true } })
    : null
  const driver = user.roles.includes('DRIVER')
    ? await prisma.driverProfile.findUnique({ where: { userId: user.id }, select: { balance: true } })
    : null
  const store = user.roles.includes('SELLER')
    ? await prisma.store.findUnique({ where: { sellerId: user.id }, select: { id: true, name: true } })
    : null

  return ok({
    id: user.id,
    username: user.username,
    email: user.email,
    name: user.name,
    phone: user.phone,
    roles: user.roles,
    activeRole: session.activeRole,
    buyerBalance: buyer?.balance ?? null,
    driverBalance: driver?.balance ?? null,
    store: store ?? null,
  })
}