'use client'

import { useEffect, useState } from 'react'
import { useApi } from '@/hooks/use-api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatRupiah, formatDate } from '@/lib/utils'
import { Plus } from 'lucide-react'

export default function AdminVouchersPage() {
  const { get, post } = useApi()
  const [vouchers, setVouchers] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [form, setForm] = useState({
    code: '', description: '', discountType: 'PERCENTAGE', discountValue: '', minPurchase: '0', maxDiscount: '', expiresAt: '', usageLimit: '100'
  })

  async function load() {
    get<any>('/api/vouchers').then(d => setVouchers(d.vouchers || [])).catch(() => {})
  }
  useEffect(() => { load() }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMsg('')
    try {
      await post('/api/vouchers', {
        ...form,
        discountValue: Number(form.discountValue),
        minPurchase: Number(form.minPurchase),
        maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : undefined,
        usageLimit: Number(form.usageLimit),
        expiresAt: new Date(form.expiresAt).toISOString(),
      })
      setMsg('Voucher berhasil dibuat!')
      setShowForm(false)
      setForm({ code: '', description: '', discountType: 'PERCENTAGE', discountValue: '', minPurchase: '0', maxDiscount: '', expiresAt: '', usageLimit: '100' })
      load()
      setTimeout(() => setMsg(''), 3000)
    } catch (e: any) { setMsg(e.message) }
    finally { setLoading(false) }
  }

  return (
    <div className="py-6 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Voucher ({vouchers.length})</h1>
        <Button size="sm" onClick={() => setShowForm(!showForm)}><Plus size={14} /> Buat Voucher</Button>
      </div>

      {msg && <div className={`text-sm p-3 rounded-xl ${msg.includes('berhasil') ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>{msg}</div>}

      {showForm && (
        <Card>
          <CardHeader><p className="font-semibold text-slate-900">Voucher Baru</p></CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Kode Voucher" placeholder="HEMAT10" value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))} required />
              <Input label="Deskripsi" placeholder="Diskon 10%" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
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
              <Input label="Maks. Diskon (Rp, opsional)" type="number" value={form.maxDiscount} onChange={e => setForm(p => ({ ...p, maxDiscount: e.target.value }))} />
              <Input label="Batas Penggunaan" type="number" value={form.usageLimit} onChange={e => setForm(p => ({ ...p, usageLimit: e.target.value }))} required />
              <Input label="Berlaku Hingga" type="datetime-local" value={form.expiresAt} onChange={e => setForm(p => ({ ...p, expiresAt: e.target.value }))} required />
              <div className="flex gap-3 sm:col-span-2">
                <Button type="submit" loading={loading}>Buat Voucher</Button>
                <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Batal</Button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      <div className="flex flex-col gap-3">
        {vouchers.map(v => (
          <Card key={v.id}>
            <CardBody>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-slate-900 font-mono">{v.code}</span>
                    <Badge variant={v.isActive && new Date() < new Date(v.expiresAt) ? 'success' : 'danger'}>
                      {v.isActive && new Date() < new Date(v.expiresAt) ? 'Aktif' : 'Tidak Aktif'}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-500">{v.description}</p>
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-500">
                    <span>Diskon: {v.discountType === 'PERCENTAGE' ? `${v.discountValue}%` : formatRupiah(v.discountValue)}</span>
                    {v.minPurchase > 0 && <span>Min. beli: {formatRupiah(v.minPurchase)}</span>}
                    {v.maxDiscount && <span>Maks: {formatRupiah(v.maxDiscount)}</span>}
                    <span>Pakai: {v.usageCount}/{v.usageLimit}</span>
                  </div>
                </div>
                <div className="text-right text-xs text-slate-400">
                  <p>Berlaku s/d</p>
                  <p className="font-medium text-slate-600">{formatDate(v.expiresAt)}</p>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  )
}