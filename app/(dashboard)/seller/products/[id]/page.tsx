'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useApi } from '@/hooks/use-api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardBody } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>()
  const { get, put } = useApi()
  const router = useRouter()
  const [form, setForm] = useState({ name: '', description: '', price: '', stock: '', imageUrl: '', isActive: true })
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    get<any>(`/api/products/${id}`).then(d => {
      const p = d.product
      setForm({ name: p.name, description: p.description || '', price: String(p.price), stock: String(p.stock), imageUrl: p.imageUrl || '', isActive: p.isActive })
    }).finally(() => setFetching(false))
  }, [id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await put(`/api/products/${id}`, { ...form, price: Number(form.price), stock: Number(form.stock) })
      router.push('/seller/products')
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  if (fetching) return <div className="py-10 text-center text-slate-400">Memuat produk...</div>

  return (
    <div className="py-6 flex flex-col gap-6">
      <Link href="/seller/products" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-teal-600 transition-colors">
        <ArrowLeft size={14} /> Kembali ke Produk
      </Link>
      <h1 className="text-2xl font-bold text-slate-900">Edit Produk</h1>
      <Card className="max-w-lg">
        <CardBody>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input label="Nama Produk" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700">Deskripsi</label>
              <textarea rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm resize-none focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Harga (Rp)" type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} required min="0" />
              <Input label="Stok" type="number" value={form.stock} onChange={e => setForm(p => ({ ...p, stock: e.target.value }))} required min="0" />
            </div>
            <Input label="URL Gambar (opsional)" value={form.imageUrl} onChange={e => setForm(p => ({ ...p, imageUrl: e.target.value }))} />
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input type="checkbox" checked={form.isActive} onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))} />
              Produk aktif (tampil di katalog)
            </label>
            {error && <div className="text-sm text-red-500 bg-red-50 px-3.5 py-2.5 rounded-xl">{error}</div>}
            <div className="flex gap-3">
              <Button type="submit" loading={loading}>Simpan Perubahan</Button>
              <Link href="/seller/products"><Button type="button" variant="secondary">Batal</Button></Link>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}