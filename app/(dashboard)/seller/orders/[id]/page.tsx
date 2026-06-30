'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useApi } from '@/hooks/use-api'
import { Button } from '@/components/ui/button'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { OrderStatusBadge } from '@/components/ui/badge'
import { formatRupiah, formatDate, ORDER_STATUS_LABEL, DELIVERY_METHOD_LABEL } from '@/lib/utils'
import { ArrowLeft, CheckCircle, Clock } from 'lucide-react'

const STATUS_ORDER = ['SEDANG_DIKEMAS', 'MENUNGGU_PENGIRIM', 'SEDANG_DIKIRIM', 'PESANAN_SELESAI']

export default function SellerOrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { get, post } = useApi()
  const [order, setOrder] = useState<any>(null)
  const [processing, setProcessing] = useState(false)
  const [msg, setMsg] = useState('')

  async function load() {
    get<any>(`/api/orders/${id}`).then(d => setOrder(d.order)).catch(() => {})
  }
  useEffect(() => { load() }, [id])

  async function handleProcess() {
    setProcessing(true)
    try {
      await post(`/api/orders/${id}/process`, {})
      setMsg('Pesanan berhasil diproses! Driver akan segera mengambil.')
      load()
    } catch (e: any) { setMsg(e.message) }
    finally { setProcessing(false) }
  }

  if (!order) return <div className="py-10 text-center text-slate-400">Memuat...</div>

  const currentStatusIdx = STATUS_ORDER.indexOf(order.status)

  return (
    <div className="py-6 flex flex-col gap-5">
      <Link href="/seller/orders" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-teal-600 transition-colors">
        <ArrowLeft size={14} /> Kembali ke Pesanan
      </Link>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Pesanan #{order.id.slice(-6).toUpperCase()}</h1>
          <p className="text-sm text-slate-400">{formatDate(order.createdAt)}</p>
        </div>
        <div className="flex items-center gap-3">
          <OrderStatusBadge status={order.status} />
          {order.status === 'SEDANG_DIKEMAS' && (
            <Button onClick={handleProcess} loading={processing} size="sm">
              ✅ Proses Pesanan
            </Button>
          )}
        </div>
      </div>

      {msg && <div className={`text-sm p-3 rounded-xl ${msg.includes('berhasil') ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>{msg}</div>}

      {order.status === 'SEDANG_DIKEMAS' && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-700">
          ⚡ <strong>Tindakan diperlukan:</strong> Proses pesanan ini agar driver bisa mengambilnya.
        </div>
      )}

      {/* Timeline */}
      <Card>
        <CardHeader><p className="font-semibold text-slate-900">Riwayat Status</p></CardHeader>
        <CardBody>
          {order.status === 'DIKEMBALIKAN' ? (
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center text-sm">✕</div>
              <p className="font-semibold text-sm">Pesanan Dikembalikan</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {STATUS_ORDER.map((s, i) => {
                const done = i <= currentStatusIdx
                const history = order.statusHistory?.find((h: any) => h.status === s)
                return (
                  <div key={s} className="flex items-start gap-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${done ? 'bg-teal-500' : 'bg-slate-100'}`}>
                      {done ? <CheckCircle size={14} className="text-white" /> : <Clock size={12} className="text-slate-300" />}
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${done ? 'text-slate-900' : 'text-slate-400'}`}>{ORDER_STATUS_LABEL[s as keyof typeof ORDER_STATUS_LABEL]}</p>
                      {history && <p className="text-xs text-slate-400">{formatDate(history.createdAt)}{history.note && ` — ${history.note}`}</p>}
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
        <CardHeader><p className="font-semibold text-slate-900">Item Pesanan</p></CardHeader>
        {order.items?.map((item: any, i: number) => (
          <div key={item.id} className={`flex items-center gap-4 px-6 py-3.5 ${i > 0 ? 'border-t border-slate-50' : ''}`}>
            <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center text-lg shrink-0">🛍️</div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-900">{item.name}</p>
              <p className="text-xs text-slate-400">{item.quantity} × {formatRupiah(item.price)}</p>
            </div>
            <p className="font-semibold text-sm">{formatRupiah(item.price * item.quantity)}</p>
          </div>
        ))}
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader><p className="font-semibold text-slate-900">Ringkasan Pembayaran</p></CardHeader>
        <CardBody className="flex flex-col gap-2.5">
          <div className="flex justify-between text-sm text-slate-600"><span>Subtotal</span><span>{formatRupiah(order.subtotal)}</span></div>
          {order.discountAmount > 0 && <div className="flex justify-between text-sm text-emerald-600"><span>Diskon</span><span>−{formatRupiah(order.discountAmount)}</span></div>}
          <div className="flex justify-between text-sm text-slate-600"><span>Ongkir ({DELIVERY_METHOD_LABEL[order.deliveryMethod as keyof typeof DELIVERY_METHOD_LABEL]})</span><span>{formatRupiah(order.deliveryFee)}</span></div>
          <div className="flex justify-between text-sm text-slate-600"><span>PPN 12%</span><span>{formatRupiah(order.tax)}</span></div>
          <div className="flex justify-between font-bold text-base border-t border-slate-100 pt-2">
            <span>Total</span><span className="text-teal-600">{formatRupiah(order.total)}</span>
          </div>
        </CardBody>
      </Card>

      {/* Buyer address */}
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