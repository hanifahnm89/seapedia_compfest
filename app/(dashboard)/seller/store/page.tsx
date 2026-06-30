'use client'

import { useEffect, useState } from 'react'
import { useApi } from '@/hooks/use-api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardBody, CardHeader } from '@/components/ui/card'

export default function SellerStorePage() {
  const { get, post, put } = useApi()
  const [store, setStore] = useState<any>(null)
  const [form, setForm] = useState({ name: '', description: '' })
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [isNew, setIsNew] = useState(false)

  useEffect(() => {
    get<any>('/api/seller/store')
      .then(d => { setStore(d.store); setForm({ name: d.store.name, description: d.store.description || '' }) })
      .catch(() => setIsNew(true))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMsg('')
    try {
      if (isNew) {
        const d = await post<any>('/api/stores', form)
        setStore(d.store)
        setIsNew(false)
        setMsg('Toko berhasil dibuat!')
      } else {
        const d = await put<any>('/api/stores', form)
        setStore(d.store)
        setMsg('Toko berhasil diperbarui!')
      }
      setTimeout(() => setMsg(''), 3000)
    } catch (e: any) { setMsg(e.message) }
    finally { setLoading(false) }
  }

  return (
    <div className="py-6 flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-slate-900">{isNew ? 'Buat Toko' : 'Pengaturan Toko'}</h1>

      {store && (
        <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-0">
          <CardBody>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-3xl">🏪</div>
              <div>
                <p className="font-bold text-xl">{store.name}</p>
                <p className="text-blue-100 text-sm">{store.description || 'Toko SEAPEDIA'}</p>
                <p className="text-xs text-blue-200 mt-1">{store._count?.products || 0} produk · {store._count?.orders || 0} pesanan</p>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader><p className="font-semibold text-slate-900">{isNew ? 'Informasi Toko Baru' : 'Edit Informasi Toko'}</p></CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Nama Toko"
              placeholder="Nama toko yang unik"
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              required
              helperText="Nama toko harus unik di seluruh SEAPEDIA"
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700">Deskripsi (opsional)</label>
              <textarea
                rows={3}
                placeholder="Ceritakan tentang tokomu..."
                value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm resize-none focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
            {msg && <div className={`text-sm p-3 rounded-xl ${msg.includes('berhasil') ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>{msg}</div>}
            <Button type="submit" loading={loading}>{isNew ? 'Buat Toko' : 'Simpan Perubahan'}</Button>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}