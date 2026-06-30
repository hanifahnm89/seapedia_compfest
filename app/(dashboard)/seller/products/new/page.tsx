'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useApi } from '@/hooks/use-api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewProductPage() {
  const { post } = useApi()
  const router = useRouter()
  const [form, setForm] = useState({ name: '', description: '', price: '', stock: '', imageUrl: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await post('/api/products', { ...form, price: Number(form.price), stock: Number(form.stock) })
      router.push('/seller/products')
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <div className="py-6 flex flex-col gap-6">
      <Link href="/seller/products" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-teal-600 transition-colors">
        <ArrowLeft size={14} /> Kembali ke Produk
      </Link>
      <h1 className="text-2xl font-bold text-slate-900">Tambah Produk Baru</h1>
      <Card className="max-w-lg">
        <CardBody>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input label="Nama Produk" placeholder="Nama produk" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700">Deskripsi</label>
              <textarea rows={3} placeholder="Deskripsi produk..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm resize-none focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Harga (Rp)" type="number" placeholder="50000" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} required min="0" />
              <Input label="Stok" type="number" placeholder="100" value={form.stock} onChange={e => setForm(p => ({ ...p, stock: e.target.value }))} required min="0" />
            </div>
            <Input label="URL Gambar (opsional)" placeholder="https://..." value={form.imageUrl} onChange={e => setForm(p => ({ ...p, imageUrl: e.target.value }))} />
            {error && <div className="text-sm text-red-500 bg-red-50 px-3.5 py-2.5 rounded-xl">{error}</div>}
            <div className="flex gap-3">
              <Button type="submit" loading={loading}>Simpan Produk</Button>
              <Link href="/seller/products"><Button type="button" variant="secondary">Batal</Button></Link>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}