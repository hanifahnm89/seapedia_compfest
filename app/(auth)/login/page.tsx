'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useAuth } from '@/features/auth/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardBody } from '@/components/ui/card'
import { Role } from '@/types'

const ROLE_DASHBOARD: Record<Role, string> = {
  BUYER: '/buyer', SELLER: '/seller', DRIVER: '/driver', ADMIN: '/admin',
}

export default function LoginPage() {
  const { login } = useAuth()
  const router = useRouter()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [roles, setRoles] = useState<Role[]>([])
  const [tempData, setTempData] = useState<{ username: string; password: string } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await login(form.username, form.password)
      if (result.requireRoleSelection) {
        setRoles(result.user.roles.filter((r: Role) => r !== 'ADMIN'))
        setTempData({ username: form.username, password: form.password })
      } else {
        router.push(ROLE_DASHBOARD[result.activeRole as Role] || '/')
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Login gagal')
    } finally {
      setLoading(false)
    }
  }

  async function handleRoleSelect(role: Role) {
    if (!tempData) return
    setLoading(true)
    try {
      await login(tempData.username, tempData.password, role)
      router.push(ROLE_DASHBOARD[role])
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Login gagal')
    } finally {
      setLoading(false)
    }
  }

  if (roles.length > 0) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <Card className="w-full max-w-sm">
          <CardBody className="py-8 text-center">
            <div className="text-4xl mb-4">👤</div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Pilih Peran</h2>
            <p className="text-sm text-slate-500 mb-6">Akun kamu punya beberapa peran. Gunakan sebagai?</p>
            <div className="flex flex-col gap-3">
              {roles.map(role => {
                const icons: Record<string, string> = { BUYER: '🛍️', SELLER: '🏪', DRIVER: '🚚' }
                const labels: Record<string, string> = { BUYER: 'Buyer — Belanja produk', SELLER: 'Seller — Kelola toko', DRIVER: 'Driver — Antar pesanan' }
                return (
                  <button
                    key={role}
                    onClick={() => handleRoleSelect(role)}
                    disabled={loading}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border-2 border-slate-200 hover:border-teal-500 hover:bg-teal-50 transition-all text-left font-medium text-slate-700 disabled:opacity-50"
                  >
                    <span className="text-2xl">{icons[role]}</span>
                    <span className="text-sm">{labels[role]}</span>
                  </button>
                )
              })}
            </div>
          </CardBody>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardBody className="py-8">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <span className="text-white text-xl font-bold">S</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Masuk ke SEAPEDIA</h1>
            <p className="text-slate-500 text-sm mt-1">Selamat datang kembali!</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Username atau Email"
              placeholder="username / email@kamu.com"
              value={form.username}
              onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
              autoComplete="username"
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="Masukkan password"
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              autoComplete="current-password"
              required
            />
            {error && <div className="text-sm text-red-500 bg-red-50 px-3.5 py-2.5 rounded-xl">{error}</div>}
            <Button type="submit" loading={loading} size="lg" className="mt-1">Masuk</Button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Belum punya akun?{' '}
            <Link href="/register" className="text-teal-600 font-medium hover:underline">Daftar sekarang</Link>
          </p>
        </CardBody>
      </Card>
    </div>
  )
}