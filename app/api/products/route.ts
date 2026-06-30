import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '../../../lib/prisma'
import { requireRole, ok, err } from '../../../lib/api-server'
import { Role } from '@prisma/client'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const limit = Math.min(50, parseInt(searchParams.get('limit') || '20'))
  const search = searchParams.get('search') || ''
  const storeId = searchParams.get('storeId') || ''

  const where = {
    isActive: true,
    ...(search && { name: { contains: search, mode: 'insensitive' as const } }),
    ...(storeId && { storeId }),
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { store: { select: { id: true, name: true } } },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.product.count({ where }),
  ])

  return ok({ products, total, page, limit, pages: Math.ceil(total / limit) })
}

const productSchema = z.object({
  name: z.string().min(1, 'Nama produk wajib diisi').max(200),
  description: z.string().optional(),
  price: z.number().positive('Harga harus lebih dari 0'),
  stock: z.number().int().min(0, 'Stok tidak boleh negatif'),
  imageUrl: z.string().url().optional().or(z.literal('')),
})

export async function POST(req: NextRequest) {
  const { ctx, error } = await requireRole(req, Role.SELLER)
  if (error) return error

  const store = await prisma.store.findUnique({ where: { sellerId: ctx!.user.id } })
  if (!store) return err('Buat toko terlebih dahulu', 400)

  const body = await req.json()
  const parsed = productSchema.safeParse(body)
  if (!parsed.success) return err(parsed.error.issues[0].message)

  const product = await prisma.product.create({
    data: { ...parsed.data, storeId: store.id },
    include: { store: { select: { id: true, name: true } } },
  })

  return ok({ product }, 201)
}