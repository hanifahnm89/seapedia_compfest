import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireRole, ok, err } from '@/lib/api-server'
import { Role } from '@prisma/client'

type Params = { params: Promise<{ id: string }> }

export async function GET(_: NextRequest, { params }: Params) {
  const { id } = await params
  const product = await prisma.product.findUnique({
    where: { id },
    include: { store: { select: { id: true, name: true, description: true, seller: { select: { name: true } } } } },
  })
  if (!product || !product.isActive) return err('Produk tidak ditemukan', 404)
  return ok({ product })
}

const updateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  stock: z.number().int().min(0).optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  isActive: z.boolean().optional(),
})

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params
  const { ctx, error } = await requireRole(req, Role.SELLER)
  if (error) return error

  const store = await prisma.store.findUnique({ where: { sellerId: ctx!.user.id } })
  if (!store) return err('Toko tidak ditemukan', 404)

  const product = await prisma.product.findUnique({ where: { id } })
  if (!product || product.storeId !== store.id) return err('Produk tidak ditemukan atau bukan milik kamu', 404)

  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return err(parsed.error.issues[0].message)

  const updated = await prisma.product.update({ where: { id }, data: parsed.data })
  return ok({ product: updated })
}

export async function DELETE(_: NextRequest, { params }: Params) {
  const { id } = await params
  const { ctx, error } = await requireRole(_ as NextRequest, Role.SELLER)
  if (error) return error

  const store = await prisma.store.findUnique({ where: { sellerId: ctx!.user.id } })
  if (!store) return err('Toko tidak ditemukan', 404)

  const product = await prisma.product.findUnique({ where: { id } })
  if (!product || product.storeId !== store.id) return err('Produk tidak ditemukan atau bukan milik kamu', 404)

  await prisma.product.update({ where: { id }, data: { isActive: false } })
  return ok({ message: 'Produk dihapus' })
}