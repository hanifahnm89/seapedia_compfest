'use client'

import { useEffect, useState } from 'react'
import { useApi } from '@/hooks/use-api'
import { Card, CardBody } from '@/components/ui/card'
import { formatRupiah, formatDate } from '@/lib/utils'

export default function DriverEarningsPage() {
  const { get } = useApi()
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    get<any>('/api/delivery/earnings').then(setData).catch(() => {})
  }, [])

  return (
    <div className="py-6 flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-slate-900">Penghasilan</h1>

      <Card className="bg-gradient-to-br from-amber-500 to-orange-600 text-white border-0">
        <CardBody className="py-8">
          <p className="text-amber-100 text-sm mb-2">Total Saldo Driver</p>
          <p className="text-4xl font-bold">{formatRupiah(data?.balance || 0)}</p>
          <p className="text-amber-200 text-xs mt-2">80% dari setiap ongkir pengiriman</p>
        </CardBody>
      </Card>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm">
        <p className="font-semibold text-amber-800 mb-1">💡 Aturan Penghasilan Driver</p>
        <p className="text-amber-700 text-xs">Driver mendapat <strong>80% dari ongkos kirim</strong> setiap pesanan yang berhasil diantar. Instant: Rp 20.000 | Next Day: Rp 12.000 | Regular: Rp 7.200</p>
      </div>

      <div>
        <h2 className="font-semibold text-slate-900 mb-3">Riwayat Penghasilan</h2>
        {!data?.earnings?.length ? (
          <Card><CardBody className="text-center py-8 text-slate-400">Belum ada penghasilan</CardBody></Card>
        ) : (
          <div className="flex flex-col gap-2">
            {data.earnings.map((e: any) => (
              <Card key={e.id}>
                <CardBody>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-900">Order #{e.job?.order?.id?.slice(-6).toUpperCase()}</p>
                      <p className="text-xs text-slate-500">{e.job?.order?.store?.name}</p>
                      <p className="text-xs text-slate-400">{formatDate(e.createdAt)}</p>
                    </div>
                    <p className="text-sm font-bold text-emerald-600">+{formatRupiah(e.amount)}</p>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}