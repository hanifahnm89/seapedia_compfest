import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireRole, ok, err } from '@/lib/api-server'
import { deliveryFeeByMethod, calculateCheckout } from '@/lib/utils'
import { Role, DeliveryMethod } from '@prisma/client'

export async function GET(req: NextRequest) {
  const { ctx, error } = await requireRole(req, Role.BUYER)
  if (error) return error

  const buyer = await prisma.buyerProfile.findUnique({ where: { userId: ctx!.user.id } })
  if (!buyer) return err('Profil buyer tidak ditemukan', 404)

  const orders = await prisma.order.findMany({
    where: { buyerId: buyer.id },
    include: {
      items: true,
      store: { select: { id: true, name: true } },
      statusHistory: { orderBy: { createdAt: 'desc' } },
      deliveryJob: true,
    },
    orderBy: { createdAt: 'desc' },
  })
  return ok({ orders })
}

const checkoutSchema = z.object({
  addressId: z.string(),
  deliveryMethod: z.nativeEnum(DeliveryMethod),
  discountCode: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const { ctx, error } = await requireRole(req, Role.BUYER)
  if (error) return error

  const body = await req.json()
  const parsed = checkoutSchema.safeParse(body)
  if (!parsed.success) return err(parsed.error.issues[0].message)

  const buyer = await prisma.buyerProfile.findUnique({
    where: { userId: ctx!.user.id },
    include: { cart: { include: { items: { include: { product: true } } } } },
  })
  if (!buyer) return err('Profil buyer tidak ditemukan', 404)
  if (!buyer.cart || buyer.cart.items.length === 0) return err('Keranjang kosong')

  const address = await prisma.address.findFirst({
    where: { id: parsed.data.addressId, buyerId: buyer.id },
  })
  if (!address) return err('Alamat tidak ditemukan', 404)

  const store = await prisma.store.findUnique({ where: { id: buyer.cart.storeId! } })
  if (!store) return err('Toko tidak ditemukan', 404)

  // Validate stock
  for (const item of buyer.cart.items) {
    if (item.product.stock < item.quantity) {
      return err(`Stok produk "${item.product.name}" tidak mencukupi`)
    }
  }

  const subtotal = buyer.cart.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0)
  const deliveryFee = deliveryFeeByMethod(parsed.data.deliveryMethod)

  // Validate discount
  let discountAmount = 0
  let voucherId: string | null = null
  let promoId: string | null = null

  if (parsed.data.discountCode) {
    const voucher = await prisma.voucher.findUnique({ where: { code: parsed.data.discountCode } })
    const promo = await prisma.promo.findUnique({ where: { code: parsed.data.discountCode } })

    if (voucher && voucher.isActive && new Date() <= voucher.expiresAt && voucher.usageCount < voucher.usageLimit && subtotal >= voucher.minPurchase) {
      discountAmount = voucher.discountType === 'PERCENTAGE'
        ? Math.min(subtotal * (voucher.discountValue / 100), voucher.maxDiscount || Infinity)
        : voucher.discountValue
      voucherId = voucher.id
    } else if (promo && promo.isActive && new Date() <= promo.expiresAt && subtotal >= promo.minPurchase) {
      discountAmount = promo.discountType === 'PERCENTAGE'
        ? Math.min(subtotal * (promo.discountValue / 100), promo.maxDiscount || Infinity)
        : promo.discountValue
      promoId = promo.id
    } else {
      return err('Kode diskon tidak valid atau tidak bisa digunakan')
    }
  }

  const { tax, total } = calculateCheckout(subtotal, discountAmount, deliveryFee)

  if (buyer.balance < total) return err('Saldo tidak mencukupi')

  // Compute overdue deadline
  const now = new Date()
  const overdueAt = new Date(now)
  switch (parsed.data.deliveryMethod) {
    case 'INSTANT': overdueAt.setHours(overdueAt.getHours() + 3); break
    case 'NEXT_DAY': overdueAt.setDate(overdueAt.getDate() + 1); break
    case 'REGULAR': overdueAt.setDate(overdueAt.getDate() + 3); break
  }

  // Transaction
  const order = await prisma.$transaction(async (tx) => {
    // Deduct balance
    await tx.buyerProfile.update({ where: { id: buyer.id }, data: { balance: { decrement: total } } })
    await tx.walletTransaction.create({
      data: { buyerId: buyer.id, amount: -total, type: 'PAYMENT', description: `Pembayaran order dari ${store.name}` },
    })

    // Reduce stock
    for (const item of buyer.cart!.items) {
      await tx.product.update({ where: { id: item.productId }, data: { stock: { decrement: item.quantity } } })
    }

    // Increment voucher usage
    if (voucherId) await tx.voucher.update({ where: { id: voucherId }, data: { usageCount: { increment: 1 } } })

    // Create order
    const order = await tx.order.create({
      data: {
        buyerId: buyer.id,
        storeId: store.id,
        addressId: address.id,
        status: 'SEDANG_DIKEMAS',
        deliveryMethod: parsed.data.deliveryMethod,
        subtotal,
        discountAmount,
        deliveryFee,
        tax,
        total,
        voucherId,
        promoId,
        discountCode: parsed.data.discountCode,
        overdueAt,
        items: {
          create: buyer.cart!.items.map(i => ({
            productId: i.productId,
            name: i.product.name,
            price: i.product.price,
            quantity: i.quantity,
          })),
        },
        statusHistory: {
          create: { status: 'SEDANG_DIKEMAS', note: 'Order berhasil dibuat' },
        },
      },
      include: { items: true, statusHistory: true, store: { select: { id: true, name: true } } },
    })

    // Clear cart
    await tx.cartItem.deleteMany({ where: { cartId: buyer.cart!.id } })
    await tx.cart.update({ where: { id: buyer.cart!.id }, data: { storeId: null } })

    return order
  })

  return ok({ order }, 201)
}