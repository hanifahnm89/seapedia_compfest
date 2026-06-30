import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { ok, err } from '@/lib/api-server'
import { Role } from '@prisma/client'

const schema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/, 'Username hanya boleh huruf, angka, dan underscore'),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
  name: z.string().min(2).max(100),
  phone: z.string().optional(),
  roles: z.array(z.nativeEnum(Role)).min(1).default([Role.BUYER]),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return err(parsed.error.issues[0].message)

    const { username, email, password, name, phone, roles } = parsed.data
    if (roles.includes(Role.ADMIN)) return err('Tidak bisa registrasi sebagai Admin', 403)

    const existing = await prisma.user.findFirst({ where: { OR: [{ username }, { email }] } })
    if (existing) return err('Username atau email sudah digunakan')

    const hashed = await hashPassword(password)
    const user = await prisma.user.create({
      data: { username, email, password: hashed, name, phone, roles },
      select: { id: true, username: true, email: true, name: true, roles: true, createdAt: true },
    })

    if (roles.includes(Role.BUYER)) {
      const buyer = await prisma.buyerProfile.create({ data: { userId: user.id } })
      await prisma.cart.create({ data: { buyerId: buyer.id } })
    }
    if (roles.includes(Role.DRIVER)) {
      await prisma.driverProfile.create({ data: { userId: user.id } })
    }

    return ok({ user }, 201)
  } catch (e) {
    console.error(e)
    return err('Registrasi gagal', 500)
  }
}