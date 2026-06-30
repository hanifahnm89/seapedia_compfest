'use client'

import { useEffect, useState } from 'react'
import { useApi } from '@/hooks/use-api'
import { Card } from '@/components/ui/card'
import { OrderStatusBadge } from '@/components/ui/badge'
import { formatRupiah, formatDate } from '@/lib/utils'

export default function AdminOrdersPage() {
  const { get } = useApi()
  const [orders, setOrders] = useState<any[]>([])
  const [filter, setFilter] = useState('ALL')

  useEffect(() => {
    get<any>('/api/admin/orders').then(d => setOrders(d.orders || [])).catch(() => {})
  }, [])

  const statuses = ['ALL', 'SEDANG_DIKEMAS', 'MENUNGGU_PENGIRIM', 'SEDANG_DIKIRIM', 'PESANAN_SELESAI', 'DIKEMBALIKAN']
  const filtered = filter === 'ALL' ? orders : orders.filter(o => o.status === filter)
  const labels: Record<string, string> = { ALL: 'Semua', SEDANG_DIKEMAS: 'Dikemas', MENUNGGU_PENGIRIM: 'Menunggu Driver', SEDANG_DIKIRIM: 'Dikirim', PESANAN_SELESAI: 'Selesai', DIKEMBALIKAN: 'Dikembalikan' }

  return (
    <div className="py-6 flex flex-col gap-5">
      <h1 className="text-2xl font-bold text-slate-900">Semua Pesanan ({orders.length})</h1>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {statuses.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`shrink-0 px-3 py-1.5 text-xs font-medium rounded-full transition-all ${filter === s ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            {labels[s]}
          </button>
        ))}
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-6 py-3 text-xs text-slate-500 font-medium">ID</th>
                <th className="text-left px-6 py-3 text-xs text-slate-500 font-medium">Toko</th>
                <th className="text-left px-6 py-3 text-xs text-slate-500 font-medium">Pembeli</th>
                <th className="text-left px-6 py-3 text-xs text-slate-500 font-medium">Total</th>
                <th className="text-left px-6 py-3 text-xs text-slate-500 font-medium">Status</th>
                <th className="text-left px-6 py-3 text-xs text-slate-500 font-medium">Tanggal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(o => (
                <tr key={o.id} className="hover:bg-slate-50">
                  <td className="px-6 py-3 font-mono text-xs text-slate-500">#{o.id?.slice(-6).toUpperCase()}</td>
                  <td className="px-6 py-3 font-medium text-slate-900">{o.store?.name}</td>
                  <td className="px-6 py-3 text-slate-600">{o.buyer?.user?.name}</td>
                  <td className="px-6 py-3 font-semibold text-teal-600">{formatRupiah(o.total)}</td>
                  <td className="px-6 py-3"><OrderStatusBadge status={o.status} /></td>
                  <td className="px-6 py-3 text-slate-400 text-xs">{formatDate(o.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}