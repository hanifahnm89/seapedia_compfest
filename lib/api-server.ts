import { NextRequest, NextResponse } from 'next/server'
import { Role } from '@prisma/client'
import { getTokenFromRequest } from './auth'
import { verifyToken } from './jwt'
import { prisma } from './prisma'

export function ok(data: unknown, status = 200) {
  return NextResponse.json({ success: true, data }, { status })
}

export function err(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status })
}

export async function getAuthContext(req: NextRequest) {
  const token = getTokenFromRequest(req)
  if (!token) return null

  const payload = verifyToken(token)
  if (!payload) return null

  const session = await prisma.session.findUnique({
    where: { token, expiresAt: { gt: new Date() } },
    include: { user: true },
  })
  if (!session) return null

  return { user: session.user, session, activeRole: session.activeRole }
}

export async function requireAuth(req: NextRequest) {
  const ctx = await getAuthContext(req)
  if (!ctx) return { ctx: null, error: err('Unauthorized', 401) }
  return { ctx, error: null }
}

export async function requireRole(req: NextRequest, role: Role) {
  const { ctx, error } = await requireAuth(req)
  if (error) return { ctx: null, error }
  if (ctx!.activeRole !== role) return { ctx: null, error: err(`Requires ${role} role`, 403) }
  return { ctx: ctx!, error: null }
}