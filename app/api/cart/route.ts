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

  const cart = await prisma.cart.findUnique({
    where: { buyerId: buyer.id },
    include: {
      items: {
        include: { product: { include: { store: { select: { id: true, name: true } } } } },
      },
    },
  })
  return ok({ cart })
}

const addSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive('Jumlah harus lebih dari 0'),
})

export async function POST(req: NextRequest) {
  const { ctx, error } = await requireRole(req, Role.BUYER)
  if (error) return error

  const body = await req.json()
  const parsed = addSchema.safeParse(body)
  if (!parsed.success) return err(parsed.error.issues[0].message)

  const buyer = await prisma.buyerProfile.findUnique({ where: { userId: ctx!.user.id } })
  if (!buyer) return err('Profil buyer tidak ditemukan', 404)

  const product = await prisma.product.findUnique({
    where: { id: parsed.data.productId, isActive: true },
    include: { store: true },
  })
  if (!product) return err('Produk tidak ditemukan', 404)
  if (product.stock < parsed.data.quantity) return err('Stok tidak mencukupi')

  let cart = await prisma.cart.findUnique({ where: { buyerId: buyer.id }, include: { items: true } })
  if (!cart) {
    cart = await prisma.cart.create({ data: { buyerId: buyer.id }, include: { items: true } })
  }

  // Single-store checkout rule
  if (cart.storeId && cart.storeId !== product.storeId && cart.items.length > 0) {
    return err(
      'Keranjang sudah berisi produk dari toko lain. Kosongkan keranjang terlebih dahulu.',
      409
    )
  }

  // Update storeId if cart is empty
  if (!cart.storeId || cart.items.length === 0) {
    await prisma.cart.update({ where: { id: cart.id }, data: { storeId: product.storeId } })
  }

  // Check if item already in cart
  const existing = cart.items.find(i => i.productId === parsed.data.productId)
  if (existing) {
    const newQty = existing.quantity + parsed.data.quantity
    if (product.stock < newQty) return err('Stok tidak mencukupi')
    await prisma.cartItem.update({ where: { id: existing.id }, data: { quantity: newQty } })
  } else {
    await prisma.cartItem.create({
      data: { cartId: cart.id, productId: parsed.data.productId, quantity: parsed.data.quantity },
    })
  }

  const updated = await prisma.cart.findUnique({
    where: { id: cart.id },
    include: { items: { include: { product: { include: { store: { select: { id: true, name: true } } } } } } },
  })
  return ok({ cart: updated })
}

export async function DELETE(req: NextRequest) {
  const { ctx, error } = await requireRole(req, Role.BUYER)
  if (error) return error

  const buyer = await prisma.buyerProfile.findUnique({ where: { userId: ctx!.user.id } })
  if (!buyer) return err('Profil buyer tidak ditemukan', 404)

  const cart = await prisma.cart.findUnique({ where: { buyerId: buyer.id } })
  if (!cart) return err('Keranjang tidak ditemukan', 404)

  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } })
  await prisma.cart.update({ where: { id: cart.id }, data: { storeId: null } })

  return ok({ message: 'Keranjang dikosongkan' })
}