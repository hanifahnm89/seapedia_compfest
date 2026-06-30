import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireRole, ok, err } from '@/lib/api-server'
import { Role } from '@prisma/client'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const limit = Math.min(50, parseInt(searchParams.get('limit') || '20'))

  const [stores, total] = await Promise.all([
    prisma.store.findMany({
      include: { _count: { select: { products: true } }, seller: { select: { name: true } } },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.store.count(),
  ])
  return ok({ stores, total, page, limit, pages: Math.ceil(total / limit) })
}

const storeSchema = z.object({
  name: z.string().min(2, 'Nama toko minimal 2 karakter').max(100),
  description: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
})

export async function POST(req: NextRequest) {
  const { ctx, error } = await requireRole(req, Role.SELLER)
  if (error) return error

  const existing = await prisma.store.findUnique({ where: { sellerId: ctx!.user.id } })
  if (existing) return err('Kamu sudah memiliki toko', 400)

  const body = await req.json()
  const parsed = storeSchema.safeParse(body)
  if (!parsed.success) return err(parsed.error.issues[0].message)

  const nameTaken = await prisma.store.findUnique({ where: { name: parsed.data.name } })
  if (nameTaken) return err('Nama toko sudah digunakan')

  const store = await prisma.store.create({
    data: { ...parsed.data, sellerId: ctx!.user.id },
  })
  return ok({ store }, 201)
}

export async function PUT(req: NextRequest) {
  const { ctx, error } = await requireRole(req, Role.SELLER)
  if (error) return error

  const store = await prisma.store.findUnique({ where: { sellerId: ctx!.user.id } })
  if (!store) return err('Toko tidak ditemukan', 404)

  const body = await req.json()
  const parsed = storeSchema.partial().safeParse(body)
  if (!parsed.success) return err(parsed.error.issues[0].message)

  if (parsed.data.name && parsed.data.name !== store.name) {
    const nameTaken = await prisma.store.findUnique({ where: { name: parsed.data.name } })
    if (nameTaken) return err('Nama toko sudah digunakan')
  }

  const updated = await prisma.store.update({ where: { id: store.id }, data: parsed.data })
  return ok({ store: updated })
}