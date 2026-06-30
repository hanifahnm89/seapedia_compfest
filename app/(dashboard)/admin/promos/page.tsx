'use client'

import { useEffect, useState } from 'react'
import { useApi } from '@/hooks/use-api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatRupiah, formatDate } from '@/lib/utils'
import { Plus } from 'lucide-react'

export default function AdminPromosPage() {
  const { get, post } = useApi()
  const [promos, setPromos] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [form, setForm] = useState({
    code: '', description: '', discountType: 'PERCENTAGE', discountValue: '', minPurchase: '0', maxDiscount: '', expiresAt: ''
  })

  async function load() {
    get<any>('/api/promos').then(d => setPromos(d.promos || [])).catch(() => {})
  }
  useEffect(() => { load() }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMsg('')
    try {
      await post('/api/promos', {
        ...form,
        discountValue: Number(form.discountValue),
        minPurchase: Number(form.minPurchase),
        maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : undefined,
        expiresAt: new Date(form.expiresAt).toISOString(),
      })
      setMsg('Promo berhasil dibuat!')
      setShowForm(false)
      setForm({ code: '', description: '', discountType: 'PERCENTAGE', discountValue: '', minPurchase: '0', maxDiscount: '', expiresAt: '' })
      load()
      setTimeout(() => setMsg(''), 3000)
    } catch (e: any) { setMsg(e.message) }
    finally { setLoading(false) }
  }

  return (
    <div className="py-6 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Promo ({promos.length})</h1>
        <Button size="sm" onClick={() => setShowForm(!showForm)}><Plus size={14} /> Buat Promo</Button>
      </div>

      {msg && <div className={`text-sm p-3 rounded-xl ${msg.includes('berhasil') ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>{msg}</div>}

      {showForm && (
        <Card>
          <CardHeader><p className="font-semibold text-slate-900">Promo Baru</p></CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Kode Promo" placeholder="PROMO20" value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))} required />
              <Input label="Deskripsi" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">Tipe Diskon</label>
                <select value={form.discountType} onChange={e => setForm(p => ({ ...p, discountType: e.target.value }))}
                  className="rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-teal-500 focus:outline-none">
                  <option value="PERCENTAGE">Persentase (%)</option>
                  <option value="FIXED">Nominal Tetap (Rp)</option>
                </select>
              </div>
              <Input label={form.discountType === 'PERCENTAGE' ? 'Nilai (%)' : 'Nilai (Rp)'} type="number" value={form.discountValue} onChange={e => setForm(p => ({ ...p, discountValue: e.target.value }))} required />
              <Input label="Minimum Pembelian (Rp)" type="number" value={form.minPurchase} onChange={e => setForm(p => ({ ...p, minPurchase: e.target.value }))} />
              <Input label="Maks. Diskon (opsional)" type="number" value={form.maxDiscount} onChange={e => setForm(p => ({ ...p, maxDiscount: e.target.value }))} />
              <Input label="Berlaku Hingga" type="datetime-local" value={form.expiresAt} onChange={e => setForm(p => ({ ...p, expiresAt: e.target.value }))} required className="sm:col-span-2" />
              <div className="flex gap-3 sm:col-span-2">
                <Button type="submit" loading={loading}>Buat Promo</Button>
                <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Batal</Button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      <div className="flex flex-col gap-3">
        {promos.map(p => (
          <Card key={p.id}>
            <CardBody>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-slate-900 font-mono">{p.code}</span>
                    <Badge variant={p.isActive && new Date() < new Date(p.expiresAt) ? 'success' : 'danger'}>
                      {p.isActive && new Date() < new Date(p.expiresAt) ? 'Aktif' : 'Tidak Aktif'}
                    </Badge>
                    <Badge variant="info">PROMO</Badge>
                  </div>
                  <p className="text-sm text-slate-500">{p.description}</p>
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-500">
                    <span>Diskon: {p.discountType === 'PERCENTAGE' ? `${p.discountValue}%` : formatRupiah(p.discountValue)}</span>
                    {p.minPurchase > 0 && <span>Min. beli: {formatRupiah(p.minPurchase)}</span>}
                    {p.maxDiscount && <span>Maks: {formatRupiah(p.maxDiscount)}</span>}
                  </div>
                </div>
                <div className="text-right text-xs text-slate-400">
                  <p>Berlaku s/d</p>
                  <p className="font-medium text-slate-600">{formatDate(p.expiresAt)}</p>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  )
}