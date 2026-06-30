import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getAuthContext, ok, err } from '@/lib/api-server'
import { sanitizeText } from '@/lib/utils'

export async function GET() {
  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
  })
  return ok({ reviews })
}

const schema = z.object({
  name: z.string().min(1, 'Nama wajib diisi').max(100),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(5, 'Komentar minimal 5 karakter').max(1000),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return err(parsed.error.issues[0].message)

  // XSS sanitize
  const name = sanitizeText(parsed.data.name)
  const comment = sanitizeText(parsed.data.comment)

  const ctx = await getAuthContext(req)

  const review = await prisma.review.create({
    data: { name, rating: parsed.data.rating, comment, userId: ctx?.user.id || null },
  })
  return ok({ review }, 201)
}