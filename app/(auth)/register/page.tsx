'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useAuth } from '../../../features/auth/use-auth'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Card, CardBody } from '../../../components/ui/card'
import { Role } from '../../../types'

const ROLES: { value: Role; label: string; icon: string; desc: string }[] = [
  { value: 'BUYER', label: 'Buyer', icon: '🛍️', desc: 'Belanja produk dari berbagai toko' },
  { value: 'SELLER', label: 'Seller', icon: '🏪', desc: 'Buka toko dan jual produk' },
  { value: 'DRIVER', label: 'Driver', icon: '🚚', desc: 'Ambil job pengiriman' },
]

export default function RegisterPage() {
  const { register, login } = useAuth()
  const router = useRouter()
  const [form, setForm] = useState({ username: '', email: '', password: '', name: '', phone: '' })
  const [selectedRoles, setSelectedRoles] = useState<Role[]>(['BUYER'])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function toggleRole(role: Role) {
    setSelectedRoles(prev =>
      prev.includes(role) ? (prev.length > 1 ? prev.filter(r => r !== role) : prev) : [...prev, role]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (selectedRoles.length === 0) { setError('Pilih minimal satu peran'); return }
    setError('')
    setLoading(true)
    try {
      await register({ ...form, roles: selectedRoles })
      await login(form.username, form.password)
      router.push(selectedRoles.includes('BUYER') ? '/buyer' : selectedRoles.includes('SELLER') ? '/seller' : '/driver')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Registrasi gagal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md">
        <CardBody className="py-8">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <span className="text-white text-xl font-bold">S</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Daftar ke SEAPEDIA</h1>
            <p className="text-slate-500 text-sm mt-1">Buat akun dan mulai perjalananmu</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input label="Nama Lengkap" placeholder="Nama kamu" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
            <Input label="Username" placeholder="username_kamu" value={form.username} onChange={e => setForm(p => ({ ...p, username: e.target.value }))} required />
            <Input label="Email" type="email" placeholder="email@kamu.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
            <Input label="Password" type="password" placeholder="Minimal 8 karakter" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
            <Input label="No. HP (opsional)" placeholder="08xxxxxxxxxx" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />

            <div>
              <p className="text-sm font-medium text-slate-700 mb-2">Daftar sebagai <span className="text-slate-400">(bisa lebih dari satu)</span></p>
              <div className="grid grid-cols-3 gap-2">
                {ROLES.map(({ value, label, icon, desc }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => toggleRole(value)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-center ${selectedRoles.includes(value) ? 'border-teal-500 bg-teal-50' : 'border-slate-200 hover:border-slate-300'}`}
                  >
                    <span className="text-2xl">{icon}</span>
                    <span className="text-xs font-semibold text-slate-700">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {error && <div className="text-sm text-red-500 bg-red-50 px-3.5 py-2.5 rounded-xl">{error}</div>}
            <Button type="submit" loading={loading} size="lg" className="mt-1">Buat Akun</Button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Sudah punya akun?{' '}
            <Link href="/login" className="text-teal-600 font-medium hover:underline">Masuk di sini</Link>
          </p>
        </CardBody>
      </Card>
    </div>
  )
}