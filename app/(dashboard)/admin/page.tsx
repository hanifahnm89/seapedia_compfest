'use client'

import { useEffect, useState } from 'react'
import { useApi } from '@/hooks/use-api'
import { Button } from '@/components/ui/button'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { OrderStatusBadge } from '@/components/ui/badge'
import { formatRupiah, formatDate } from '@/lib/utils'

function StatCard({ label, value, icon, color = 'text-slate-900' }: { label: string; value: number | string; icon: string; color?: string }) {
  return (
    <Card>
      <CardBody>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 mb-1">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
          <span className="text-3xl">{icon}</span>
        </div>
      </CardBody>
    </Card>
  )
}

export default function AdminDashboardPage() {
  const { get, post } = useApi()
  const [data, setData] = useState<any>(null)
  const [simulating, setSimulating] = useState(false)
  const [simResult, setSimResult] = useState<any>(null)

  async function load() {
    get<any>('/api/admin/dashboard').then(setData).catch(() => {})
  }
  useEffect(() => { load() }, [])

  async function simulateDay() {
    setSimulating(true)
    setSimResult(null)
    try {
      const d = await post<any>('/api/admin/simulate-day', {})
      setSimResult(d)
      load()
    } catch (e: any) { setSimResult({ error: e.message }) }
    finally { setSimulating(false) }
  }

  const stats = data?.stats

  return (
    <div className="py-6 flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
        <Button onClick={simulateDay} loading={simulating} variant="outline" size="sm">
          ⏩ Simulasi Hari Berikutnya
        </Button>
      </div>

      {simResult && (
        <div className={`text-sm p-4 rounded-xl ${simResult.error ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'}`}>
          {simResult.error ? simResult.error : (
            <div>
              <p className="font-semibold">Simulasi selesai: {simResult.results?.length || 0} order diproses</p>
              {simResult.results?.map((r: any) => (
                <p key={r.orderId} className="text-xs mt-1">• Order #{r.orderId?.slice(-6)} — refund {formatRupiah(r.refundedAmount)}</p>
              ))}
              {simResult.results?.length === 0 && <p className="text-xs mt-1">Tidak ada order overdue saat ini.</p>}
            </div>
          )}
        </div>
      )}

      {/* Stats grid */}
      {stats && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total Users" value={stats.users} icon="👥" color="text-blue-600" />
            <StatCard label="Total Toko" value={stats.stores} icon="🏪" color="text-indigo-600" />
            <StatCard label="Total Produk" value={stats.products} icon="📦" color="text-teal-600" />
            <StatCard label="Total Pesanan" value={stats.orders} icon="🧾" color="text-slate-900" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Voucher" value={stats.vouchers} icon="🎟️" />
            <StatCard label="Promo" value={stats.promos} icon="🏷️" />
            <StatCard label="Delivery Jobs" value={stats.deliveryJobs} icon="🚚" />
            <StatCard label="Order Overdue" value={stats.overdueOrders} icon="⚠️" color={stats.overdueOrders > 0 ? 'text-red-600' : 'text-slate-900'} />
          </div>
        </>
      )}

      {/* Order status breakdown */}
      {stats?.ordersByStatus && (
        <Card>
          <CardHeader><p className="font-semibold text-slate-900">Status Pesanan</p></CardHeader>
          <CardBody>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {Object.entries(stats.ordersByStatus).map(([status, count]) => (
                <div key={status} className="text-center p-3 bg-slate-50 rounded-xl">
                  <p className="text-xl font-bold text-slate-900">{count as number}</p>
                  <OrderStatusBadge status={status as any} />
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Overdue orders */}
      {data?.overdueOrders?.length > 0 && (
        <Card>
          <CardHeader><p className="font-semibold text-red-600">⚠️ Pesanan Overdue</p></CardHeader>
          <div className="divide-y divide-slate-50">
            {data.overdueOrders.map((o: any) => (
              <div key={o.id} className="flex items-center justify-between px-6 py-3.5">
                <div>
                  <p className="text-sm font-medium text-slate-900">#{o.id?.slice(-6).toUpperCase()} — {o.store?.name}</p>
                  <p className="text-xs text-slate-400">Pembeli: {o.buyer?.user?.name} | {formatDate(o.createdAt)}</p>
                  <p className="text-xs text-red-500">Batas: {o.overdueAt ? formatDate(o.overdueAt) : '—'}</p>
                </div>
                <div className="text-right">
                  <OrderStatusBadge status={o.status} />
                  <p className="text-sm font-bold text-slate-700 mt-1">{formatRupiah(o.total)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recent orders */}
      <Card>
        <CardHeader><p className="font-semibold text-slate-900">Pesanan Terbaru</p></CardHeader>
        <div className="divide-y divide-slate-50">
          {data?.recentOrders?.map((o: any) => (
            <div key={o.id} className="flex items-center justify-between px-6 py-3.5">
              <div>
                <p className="text-sm font-medium text-slate-900">#{o.id?.slice(-6).toUpperCase()} — {o.store?.name}</p>
                <p className="text-xs text-slate-400">{o.buyer?.user?.name} | {formatDate(o.createdAt)}</p>
              </div>
              <div className="text-right">
                <OrderStatusBadge status={o.status} />
                <p className="text-sm font-bold text-teal-600 mt-1">{formatRupiah(o.total)}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}