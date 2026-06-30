import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const token = getTokenFromRequest(req)
  if (token) await prisma.session.deleteMany({ where: { token } }).catch(() => {})
  const res = NextResponse.json({ success: true, data: { message: 'Berhasil logout' } })
  res.cookies.delete('seapedia_token')
  return res
}