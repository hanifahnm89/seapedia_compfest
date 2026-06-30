'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useApi } from '@/hooks/use-api'
import { Card, CardBody } from '@/components/ui/card'
import { OrderStatusBadge } from '@/components/ui/badge'
import { formatRupiah, formatDate } from '@/lib/utils'

export default function SellerHomePage() {
  const { get } = useApi()
  const [store, setStore] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])

  useEffect(() => {
    get<any>('/api/stores').catch(() => {})
    get<any>('/api/seller/store').then(d => setStore(d.store)).catch(() => {})
    get<any>('/api/seller/orders').then(d => setOrders(d.orders || [])).catch(() => {})
    get<any>('/api/products?limit=5').then(d => setProducts(d.products || [])).catch(() => {})
  }, [])

  const income = orders.filter((o: any) => o.status === 'PESANAN_SELESAI').reduce((s: number, o: any) => s + o.total, 0)
  const pendingOrders = orders.filter((o: any) => o.status === 'SEDANG_DIKEMAS').length

  return (
    <div className="py-6">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">
        {store ? `Toko: ${store.name}` : 'Dashboard Seller'}
      </h1>

      {!store && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 text-sm text-amber-700">
          ⚠️ Kamu belum membuat toko. <Link href="/seller/store" className="font-semibold underline">Buat toko sekarang</Link>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <Card><CardBody>
          <p className="text-xs text-slate-500 mb-1">Total Pendapatan</p>
          <p className="text-xl font-bold text-teal-600">{formatRupiah(income)}</p>
          <p className="text-xs text-slate-400">dari pesanan selesai</p>
        </CardBody></Card>
        <Card><CardBody>
          <p className="text-xs text-slate-500 mb-1">Perlu Diproses</p>
          <p className="text-xl font-bold text-amber-600">{pendingOrders}</p>
          <Link href="/seller/orders" className="text-xs text-teal-500 hover:underline">Lihat pesanan →</Link>
        </CardBody></Card>
        <Card><CardBody>
          <p className="text-xs text-slate-500 mb-1">Total Produk</p>
          <p className="text-xl font-bold text-slate-700">{products.length}</p>
          <Link href="/seller/products" className="text-xs text-teal-500 hover:underline">Kelola produk →</Link>
        </CardBody></Card>
      </div>

      <h2 className="font-semibold text-slate-900 mb-3">Pesanan Terbaru</h2>
      {orders.length === 0 ? (
        <Card><CardBody className="text-center py-8 text-slate-400">Belum ada pesanan masuk</CardBody></Card>
      ) : (
        <div className="flex flex-col gap-2">
          {orders.slice(0, 5).map((o: any) => (
            <Link key={o.id} href={`/seller/orders/${o.id}`}>
              <Card className="hover:shadow-md transition-shadow">
                <CardBody>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-900">#{o.id.slice(-6).toUpperCase()}</p>
                      <p className="text-xs text-slate-400">{formatDate(o.createdAt)} · {o.items?.length} item</p>
                    </div>
                    <div className="text-right">
                      <OrderStatusBadge status={o.status} />
                      <p className="text-sm font-bold text-teal-600 mt-1">{formatRupiah(o.total)}</p>
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