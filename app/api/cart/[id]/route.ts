import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireRole, ok, err } from '@/lib/api-server'
import { Role } from '@prisma/client'

type Params = { params: Promise<{ id: string }> }

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params
  const { ctx, error } = await requireRole(req, Role.BUYER)
  if (error) return error

  const buyer = await prisma.buyerProfile.findUnique({ where: { userId: ctx!.user.id } })
  if (!buyer) return err('Profil buyer tidak ditemukan', 404)

  const body = await req.json()
  const parsed = z.object({ quantity: z.number().int().positive() }).safeParse(body)
  if (!parsed.success) return err(parsed.error.issues[0].message)

  const item = await prisma.cartItem.findUnique({ where: { id }, include: { cart: true, product: true } })
  if (!item || item.cart.buyerId !== buyer.id) return err('Item tidak ditemukan', 404)
  if (item.product.stock < parsed.data.quantity) return err('Stok tidak mencukupi')

  const updated = await prisma.cartItem.update({ where: { id }, data: { quantity: parsed.data.quantity } })
  return ok({ item: updated })
}

export async function DELETE(_: NextRequest, { params }: Params) {
  const { id } = await params
  const { ctx, error } = await requireRole(_ as NextRequest, Role.BUYER)
  if (error) return error

  const buyer = await prisma.buyerProfile.findUnique({ where: { userId: ctx!.user.id } })
  if (!buyer) return err('Profil buyer tidak ditemukan', 404)

  const item = await prisma.cartItem.findUnique({ where: { id }, include: { cart: true } })
  if (!item || item.cart.buyerId !== buyer.id) return err('Item tidak ditemukan', 404)

  await prisma.cartItem.delete({ where: { id } })

  // If cart is now empty, clear storeId
  const remaining = await prisma.cartItem.count({ where: { cartId: item.cartId } })
  if (remaining === 0) {
    await prisma.cart.update({ where: { id: item.cartId }, data: { storeId: null } })
  }

  return ok({ message: 'Item dihapus dari keranjang' })
}