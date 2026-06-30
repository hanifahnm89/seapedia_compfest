import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { verifyPassword } from '@/lib/auth'
import { signToken } from '@/lib/jwt'
import { err } from '@/lib/api-server'
import { Role } from '@prisma/client'

const schema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
  activeRole: z.nativeEnum(Role).optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return err(parsed.error.issues[0].message)

    const { username, password, activeRole } = parsed.data

    const user = await prisma.user.findFirst({
      where: { OR: [{ username }, { email: username }] },
    })
    if (!user) return err('Username atau password salah', 401)

    const valid = await verifyPassword(password, user.password)
    if (!valid) return err('Username atau password salah', 401)

    const role: Role = activeRole && user.roles.includes(activeRole) ? activeRole : user.roles[0]
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    // Create placeholder session, then update with real token
    const session = await prisma.session.create({
      data: { userId: user.id, activeRole: role, token: `temp_${Date.now()}`, expiresAt },
    })
    const token = signToken({ userId: user.id, sessionId: session.id, activeRole: role })
    await prisma.session.update({ where: { id: session.id }, data: { token } })

    const requireRoleSelection = user.roles.filter(r => r !== Role.ADMIN).length > 1 && !activeRole

    const res = NextResponse.json({
      success: true,
      data: {
        token,
        user: { id: user.id, username: user.username, email: user.email, name: user.name, roles: user.roles },
        activeRole: role,
        requireRoleSelection,
      },
    })
    res.cookies.set('seapedia_token', token, { httpOnly: true, expires: expiresAt, path: '/' })
    return res
  } catch (e) {
    console.error(e)
    return err('Login gagal', 500)
  }
}