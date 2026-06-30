'use client'

import { useEffect, useState } from 'react'
import { useApi } from '@/hooks/use-api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardBody } from '@/components/ui/card'
import { Address } from '@/types'
import { Plus, MapPin, Trash2 } from 'lucide-react'

export default function AddressesPage() {
  const { get, post, del } = useApi()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [form, setForm] = useState({ label: '', street: '', city: '', province: '', zipCode: '', isDefault: false })
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  async function load() {
    const d = await get<any>('/api/buyer/addresses').catch(() => ({ addresses: [] }))
    setAddresses(d.addresses || [])
  }
  useEffect(() => { load() }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await post('/api/buyer/addresses', form)
      setForm({ label: '', street: '', city: '', province: '', zipCode: '', isDefault: false })
      setShowForm(false)
      setMsg('Alamat berhasil ditambahkan!')
      load()
      setTimeout(() => setMsg(''), 3000)
    } catch (e: any) { setMsg(e.message) }
    finally { setLoading(false) }
  }

  async function handleDelete(id: string) {
    if (!confirm('Hapus alamat ini?')) return
    await del(`/api/buyer/addresses/${id}`).catch(() => {})
    load()
  }

  return (
    <div className="py-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Alamat Pengiriman</h1>
        <Button onClick={() => setShowForm(!showForm)} size="sm">
          <Plus size={14} /> Tambah Alamat
        </Button>
      </div>

      {msg && <div className={`text-sm p-3 rounded-xl ${msg.includes('berhasil') ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>{msg}</div>}

      {showForm && (
        <Card>
          <CardBody>
            <h2 className="font-semibold text-slate-900 mb-4">Alamat Baru</h2>
            <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Label (mis. Rumah, Kantor)" placeholder="Rumah" value={form.label} onChange={e => setForm(p => ({ ...p, label: e.target.value }))} required />
              <Input label="Jalan / Alamat Lengkap" placeholder="Jl. Contoh No. 1" value={form.street} onChange={e => setForm(p => ({ ...p, street: e.target.value }))} required />
              <Input label="Kota" placeholder="Malang" value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} required />
              <Input label="Provinsi" placeholder="Jawa Timur" value={form.province} onChange={e => setForm(p => ({ ...p, province: e.target.value }))} required />
              <Input label="Kode Pos" placeholder="65141" value={form.zipCode} onChange={e => setForm(p => ({ ...p, zipCode: e.target.value }))} required />
              <div className="flex items-center gap-2 sm:col-span-2">
                <input type="checkbox" id="isDefault" checked={form.isDefault} onChange={e => setForm(p => ({ ...p, isDefault: e.target.checked }))} />
                <label htmlFor="isDefault" className="text-sm text-slate-600">Jadikan alamat utama</label>
              </div>
              <div className="flex gap-3 sm:col-span-2">
                <Button type="submit" loading={loading}>Simpan</Button>
                <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Batal</Button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      {addresses.length === 0 ? (
        <Card><CardBody className="text-center py-8 text-slate-400">Belum ada alamat tersimpan</CardBody></Card>
      ) : (
        <div className="flex flex-col gap-3">
          {addresses.map(a => (
            <Card key={a.id} className={a.isDefault ? 'border-teal-300' : ''}>
              <CardBody>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <MapPin size={16} className="text-teal-500 mt-0.5 shrink-0" />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-900 text-sm">{a.label}</p>
                        {a.isDefault && <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-medium">Utama</span>}
                      </div>
                      <p className="text-sm text-slate-600">{a.street}</p>
                      <p className="text-sm text-slate-500">{a.city}, {a.province} {a.zipCode}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(a.id)} className="text-red-400 hover:text-red-600 transition-colors p-1">
                    <Trash2 size={14} />
                  </button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}