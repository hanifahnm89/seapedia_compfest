'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useApi } from '@/hooks/use-api'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { OrderStatusBadge } from '@/components/ui/badge'
import { formatRupiah, formatDate, ORDER_STATUS_LABEL, DELIVERY_METHOD_LABEL } from '@/lib/utils'
import { Order } from '@/types'
import { ArrowLeft, CheckCircle, Clock } from 'lucide-react'

const STATUS_ORDER = ['SEDANG_DIKEMAS', 'MENUNGGU_PENGIRIM', 'SEDANG_DIKIRIM', 'PESANAN_SELESAI']

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { get } = useApi()
  const [order, setOrder] = useState<Order | null>(null)

  useEffect(() => {
    get<any>(`/api/orders/${id}`).then(d => setOrder(d.order)).catch(() => {})
  }, [id])

  if (!order) return <div className="py-10 text-center text-slate-400">Memuat pesanan...</div>

  const currentStatusIdx = STATUS_ORDER.indexOf(order.status)

  return (
    <div className="py-6 flex flex-col gap-5">
      <Link href="/buyer/orders" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-teal-600 transition-colors">
        <ArrowLeft size={14} /> Kembali
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Pesanan #{order.id.slice(-6).toUpperCase()}</h1>
          <p className="text-sm text-slate-400">{formatDate(order.createdAt)}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* Status timeline */}
      <Card>
        <CardHeader><p className="font-semibold text-slate-900">Status Pengiriman</p></CardHeader>
        <CardBody>
          {order.status === 'DIKEMBALIKAN' ? (
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-sm">✕</div>
              <div>
                <p className="font-semibold">Pesanan Dikembalikan</p>
                <p className="text-xs text-slate-400">Saldo telah dikembalikan ke dompetmu</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {STATUS_ORDER.map((s, i) => {
                const done = i <= currentStatusIdx
                const history = order.statusHistory?.find(h => h.status === s)
                return (
                  <div key={s} className="flex items-start gap-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${done ? 'bg-teal-500' : 'bg-slate-100'}`}>
                      {done ? <CheckCircle size={14} className="text-white" /> : <Clock size={12} className="text-slate-300" />}
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${done ? 'text-slate-900' : 'text-slate-400'}`}>{ORDER_STATUS_LABEL[s as keyof typeof ORDER_STATUS_LABEL]}</p>
                      {history && <p className="text-xs text-slate-400">{formatDate(history.createdAt)}</p>}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Items */}
      <Card>
        <CardHeader><p className="font-semibold text-slate-900">Item Pesanan — {order.store?.name}</p></CardHeader>
        {order.items.map((item, i) => (
          <div key={item.id} className={`flex items-center gap-4 px-6 py-4 ${i > 0 ? 'border-t border-slate-50' : ''}`}>
            <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center text-xl shrink-0">🛍️</div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-900">{item.name}</p>
              <p className="text-xs text-slate-400">{item.quantity} × {formatRupiah(item.price)}</p>
            </div>
            <p className="font-semibold text-sm">{formatRupiah(item.price * item.quantity)}</p>
          </div>
        ))}
      </Card>

      {/* Payment summary */}
      <Card>
        <CardHeader><p className="font-semibold text-slate-900">Rincian Pembayaran</p></CardHeader>
        <CardBody className="flex flex-col gap-2.5">
          <div className="flex justify-between text-sm text-slate-600"><span>Metode Pengiriman</span><span>{DELIVERY_METHOD_LABEL[order.deliveryMethod]}</span></div>
          <div className="flex justify-between text-sm text-slate-600"><span>Subtotal</span><span>{formatRupiah(order.subtotal)}</span></div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-sm text-emerald-600">
              <span>Diskon {order.discountCode && `(${order.discountCode})`}</span>
              <span>−{formatRupiah(order.discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm text-slate-600"><span>Ongkir</span><span>{formatRupiah(order.deliveryFee)}</span></div>
          <div className="flex justify-between text-sm text-slate-600"><span>PPN 12%</span><span>{formatRupiah(order.tax)}</span></div>
          <div className="flex justify-between font-bold text-base border-t border-slate-100 pt-2">
            <span>Total</span><span className="text-teal-600">{formatRupiah(order.total)}</span>
          </div>
        </CardBody>
      </Card>

      {/* Address */}
      {order.address && (
        <Card>
          <CardHeader><p className="font-semibold text-slate-900">Alamat Pengiriman</p></CardHeader>
          <CardBody>
            <p className="text-sm font-medium text-slate-900">{order.address.label}</p>
            <p className="text-sm text-slate-500">{order.address.street}, {order.address.city}, {order.address.province} {order.address.zipCode}</p>
          </CardBody>
        </Card>
      )}
    </div>
  )
}