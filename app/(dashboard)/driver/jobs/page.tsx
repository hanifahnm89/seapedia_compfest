'use client'

import { useEffect, useState } from 'react'
import { useApi } from '@/hooks/use-api'
import { Button } from '@/components/ui/button'
import { Card, CardBody } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/badge'
import { formatRupiah, formatDate, DELIVERY_METHOD_LABEL } from '@/lib/utils'
import { MapPin, Package, Truck } from 'lucide-react'

export default function DriverJobsPage() {
  const { get, post } = useApi()
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [taking, setTaking] = useState<string | null>(null)
  const [msg, setMsg] = useState('')

  async function load() {
    setLoading(true)
    get<any>('/api/delivery/jobs').then(d => { setJobs(d.jobs || []); setLoading(false) }).catch(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  async function takeJob(jobId: string) {
    setTaking(jobId)
    setMsg('')
    try {
      await post(`/api/delivery/jobs/${jobId}/take`, {})
      setMsg('Job berhasil diambil! Segera antar pesanan.')
      load()
    } catch (e: any) { setMsg(e.message) }
    finally { setTaking(null) }
  }

  if (loading) return <div className="py-10 text-center text-slate-400">Mencari job tersedia...</div>

  return (
    <div className="py-6 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Job Tersedia</h1>
        <button onClick={load} className="text-sm text-teal-600 hover:underline">Refresh</button>
      </div>

      {msg && <div className={`text-sm p-3 rounded-xl ${msg.includes('berhasil') ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>{msg}</div>}

      {jobs.length === 0 ? (
        <EmptyState icon="🔍" title="Tidak ada job tersedia" description="Belum ada pesanan yang siap diantar saat ini." />
      ) : (
        <div className="flex flex-col gap-4">
          {jobs.map((job: any) => (
            <Card key={job.id} className="hover:shadow-md transition-shadow">
              <CardBody>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <p className="font-bold text-slate-900">#{job.orderId?.slice(-6).toUpperCase()}</p>
                    <p className="text-xs text-slate-400">{formatDate(job.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-teal-600">{formatRupiah(job.fee * 0.8)}</p>
                    <p className="text-xs text-slate-400">Penghasilanmu (80%)</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="flex items-start gap-2 text-sm">
                    <Package size={14} className="text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-slate-400">Toko</p>
                      <p className="font-medium text-slate-700">{job.order?.store?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <Truck size={14} className="text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-slate-400">Metode</p>
                      <p className="font-medium text-slate-700">{DELIVERY_METHOD_LABEL[job.order?.deliveryMethod as keyof typeof DELIVERY_METHOD_LABEL]}</p>
                    </div>
                  </div>
                  {job.order?.address && (
                    <div className="flex items-start gap-2 text-sm col-span-2">
                      <MapPin size={14} className="text-slate-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-slate-400">Tujuan</p>
                        <p className="font-medium text-slate-700">{job.order.address.street}, {job.order.address.city}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <p className="text-xs text-slate-400 mb-1.5">Item:</p>
                  <div className="flex flex-wrap gap-1">
                    {job.order?.items?.map((i: any) => (
                      <span key={i.id} className="text-xs bg-slate-50 text-slate-600 px-2 py-0.5 rounded-full">{i.name} ×{i.quantity}</span>
                    ))}
                  </div>
                </div>

                <Button size="sm" loading={taking === job.id} onClick={() => takeJob(job.id)} className="w-full">
                  🚀 Ambil Job Ini
                </Button>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}