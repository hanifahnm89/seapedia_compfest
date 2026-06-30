import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole, ok } from '@/lib/api-server'
import { Role } from '@prisma/client'

export async function GET(req: NextRequest) {
  const { ctx, error } = await requireRole(req, Role.ADMIN)
  if (error) return error

  const users = await prisma.user.findMany({
    select: { id: true, username: true, email: true, name: true, roles: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  })
  return ok({ users })
}