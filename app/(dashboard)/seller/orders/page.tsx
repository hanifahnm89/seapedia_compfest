'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useApi } from '@/hooks/use-api'
import { Card, CardBody } from '@/components/ui/card'
import { OrderStatusBadge, EmptyState } from '@/components/ui/badge'
import { formatRupiah, formatDate } from '@/lib/utils'

export default function SellerOrdersPage() {
  const { get } = useApi()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')

  useEffect(() => {
    get<any>('/api/seller/orders').then(d => { setOrders(d.orders || []); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const statuses = ['ALL', 'SEDANG_DIKEMAS', 'MENUNGGU_PENGIRIM', 'SEDANG_DIKIRIM', 'PESANAN_SELESAI', 'DIKEMBALIKAN']
  const filtered = filter === 'ALL' ? orders : orders.filter(o => o.status === filter)

  const statusLabels: Record<string, string> = {
    ALL: 'Semua', SEDANG_DIKEMAS: 'Dikemas', MENUNGGU_PENGIRIM: 'Menunggu Driver',
    SEDANG_DIKIRIM: 'Dikirim', PESANAN_SELESAI: 'Selesai', DIKEMBALIKAN: 'Dikembalikan',
  }

  if (loading) return <div className="py-10 text-center text-slate-400">Memuat pesanan...</div>

  return (
    <div className="py-6 flex flex-col gap-5">
      <h1 className="text-2xl font-bold text-slate-900">Pesanan Masuk</h1>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {statuses.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`shrink-0 px-3 py-1.5 text-xs font-medium rounded-full transition-all ${filter === s ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            {statusLabels[s]}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="🧾" title="Tidak ada pesanan" />
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((o: any) => (
            <Link key={o.id} href={`/seller/orders/${o.id}`}>
              <Card className="hover:shadow-md transition-shadow">
                <CardBody>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">#{o.id.slice(-6).toUpperCase()}</p>
                      <p className="text-xs text-slate-400 mb-1">{formatDate(o.createdAt)}</p>
                      <p className="text-xs text-slate-500">Pembeli: {o.buyer?.user?.name}</p>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {o.items?.slice(0, 2).map((i: any) => (
                          <span key={i.id} className="text-xs bg-slate-50 text-slate-600 px-2 py-0.5 rounded-full">{i.name} ×{i.quantity}</span>
                        ))}
                        {o.items?.length > 2 && <span className="text-xs text-slate-400">+{o.items.length - 2} lainnya</span>}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <OrderStatusBadge status={o.status} />
                      <p className="text-sm font-bold text-teal-600 mt-2">{formatRupiah(o.total)}</p>
                      {o.status === 'SEDANG_DIKEMAS' && (
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full mt-1 inline-block">⚡ Perlu diproses</span>
                      )}
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}