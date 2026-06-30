'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useAuth } from '@/features/auth/use-auth'
import { useApi } from '@/hooks/use-api'
import { Card, CardBody } from '@/components/ui/card'
import { formatRupiah } from '@/lib/utils'

export default function DriverHomePage() {
  const { user } = useAuth()
  const { get } = useApi()
  const [earnings, setEarnings] = useState<any>(null)
  const [availableJobs, setAvailableJobs] = useState(0)
  const [activeJob, setActiveJob] = useState<any>(null)

  useEffect(() => {
    get<any>('/api/delivery/earnings').then(d => setEarnings(d)).catch(() => {})
    get<any>('/api/delivery/jobs').then(d => setAvailableJobs(d.jobs?.length || 0)).catch(() => {})
    get<any>('/api/delivery/jobs?mine=true').then(d => {
      const active = d.jobs?.find((j: any) => j.status === 'TAKEN')
      setActiveJob(active || null)
    }).catch(() => {})
  }, [])

  return (
    <div className="py-6">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Halo, {user?.name?.split(' ')[0]} 🚚</h1>

      {activeJob && (
        <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 mb-6">
          <p className="text-teal-700 font-semibold text-sm mb-1">⚡ Job Aktif</p>
          <p className="text-sm text-teal-600">Order #{activeJob.orderId?.slice(-6).toUpperCase()} — {activeJob.order?.store?.name}</p>
          <Link href={`/driver/my-jobs`} className="text-xs text-teal-600 font-semibold underline mt-1 inline-block">Lihat detail →</Link>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardBody>
            <p className="text-xs text-slate-500 mb-1">Total Penghasilan</p>
            <p className="text-xl font-bold text-teal-600">{formatRupiah(earnings?.balance || 0)}</p>
            <Link href="/driver/earnings" className="text-xs text-teal-500 hover:underline">Lihat detail →</Link>
          </CardBody>
        </Card>
        <Link href="/driver/jobs">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardBody>
              <p className="text-xs text-slate-500 mb-1">Job Tersedia</p>
              <p className="text-xl font-bold text-amber-600">{availableJobs}</p>
              <p className="text-xs text-teal-500">Cari job →</p>
            </CardBody>
          </Card>
        </Link>
        <Card>
          <CardBody>
            <p className="text-xs text-slate-500 mb-1">Job Selesai</p>
            <p className="text-xl font-bold text-slate-700">{earnings?.earnings?.length || 0}</p>
            <Link href="/driver/my-jobs" className="text-xs text-teal-500 hover:underline">Riwayat →</Link>
          </CardBody>
        </Card>
      </div>

      <div className="bg-slate-50 rounded-2xl p-4 text-sm text-slate-600">
        <p className="font-semibold text-slate-900 mb-2">💡 Cara Kerja Driver</p>
        <ol className="list-decimal list-inside space-y-1 text-xs">
          <li>Seller memproses pesanan → status berubah ke <strong>Menunggu Pengirim</strong></li>
          <li>Driver cari job yang tersedia di halaman <Link href="/driver/jobs" className="text-teal-600 underline">Cari Job</Link></li>
          <li>Ambil job → status berubah ke <strong>Sedang Dikirim</strong></li>
          <li>Konfirmasi selesai → status <strong>Pesanan Selesai</strong> & kamu dapat penghasilan 80% dari ongkir</li>
        </ol>
      </div>
    </div>
  )
}