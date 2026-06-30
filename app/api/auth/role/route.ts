import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAuth, ok, err } from '@/lib/api-server'
import { signToken } from '@/lib/jwt'
import { Role } from '@prisma/client'

export async function POST(req: NextRequest) {
  const { ctx, error } = await requireAuth(req)
  if (error) return error

  const body = await req.json()
  const parsed = z.object({ role: z.nativeEnum(Role) }).safeParse(body)
  if (!parsed.success) return err('Role tidak valid')

  const { role } = parsed.data
  if (!ctx!.user.roles.includes(role)) return err('Kamu tidak memiliki role ini', 403)

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  const newToken = signToken({ userId: ctx!.user.id, sessionId: ctx!.session.id, activeRole: role })

  await prisma.session.update({
    where: { id: ctx!.session.id },
    data: { activeRole: role, token: newToken, expiresAt },
  })

  const res = NextResponse.json({ success: true, data: { token: newToken, activeRole: role } })
  res.cookies.set('seapedia_token', newToken, { httpOnly: true, expires: expiresAt, path: '/' })
  return res
}