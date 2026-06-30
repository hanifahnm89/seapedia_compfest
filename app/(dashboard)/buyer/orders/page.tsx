'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useApi } from '@/hooks/use-api'
import { Card, CardBody } from '@/components/ui/card'
import { OrderStatusBadge, EmptyState } from '@/components/ui/badge'
import { formatRupiah, formatDate } from '@/lib/utils'
import { Order } from '@/types'

export default function OrdersPage() {
  const { get } = useApi()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    get<any>('/api/orders').then(d => { setOrders(d.orders || []); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="py-10 text-center text-slate-400">Memuat pesanan...</div>

  return (
    <div className="py-6 flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-slate-900">Pesanan Saya</h1>
      {orders.length === 0 ? (
        <EmptyState icon="📦" title="Belum ada pesanan" description="Yuk mulai belanja di SEAPEDIA!" />
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map(o => (
            <Link key={o.id} href={`/buyer/orders/${o.id}`}>
              <Card className="hover:shadow-md transition-shadow">
                <CardBody>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900 text-sm">{o.store?.name}</p>
                      <p className="text-xs text-slate-400 mb-2">{formatDate(o.createdAt)}</p>
                      <div className="flex flex-wrap gap-1">
                        {o.items.slice(0, 2).map(i => (
                          <span key={i.id} className="text-xs bg-slate-50 text-slate-600 px-2 py-0.5 rounded-full">{i.name} ×{i.quantity}</span>
                        ))}
                        {o.items.length > 2 && <span className="text-xs text-slate-400">+{o.items.length - 2} lainnya</span>}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <OrderStatusBadge status={o.status} />
                      <p className="text-sm font-bold text-teal-600 mt-2">{formatRupiah(o.total)}</p>
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