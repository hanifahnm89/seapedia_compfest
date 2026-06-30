import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ok, err } from '@/lib/api-server'

type Params = { params: Promise<{ id: string }> }

export async function GET(_: NextRequest, { params }: Params) {
  const { id } = await params
  const store = await prisma.store.findUnique({
    where: { id },
    include: {
      seller: { select: { name: true, username: true } },
      products: { where: { isActive: true }, orderBy: { createdAt: 'desc' } },
      _count: { select: { products: true, orders: true } },
    },
  })
  if (!store) return err('Toko tidak ditemukan', 404)
  return ok({ store })
}