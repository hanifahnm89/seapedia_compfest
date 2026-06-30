'use client'

import { useEffect, useState } from 'react'
import { useApi } from '@/hooks/use-api'
import { Button } from '@/components/ui/button'
import { Card, CardBody } from '@/components/ui/card'
import { Badge, EmptyState } from '@/components/ui/badge'
import { formatRupiah, formatDate } from '@/lib/utils'
import { CheckCircle } from 'lucide-react'

export default function MyJobsPage() {
  const { get, post } = useApi()
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState<string | null>(null)
  const [msg, setMsg] = useState('')

  async function load() {
    get<any>('/api/delivery/jobs?mine=true').then(d => { setJobs(d.jobs || []); setLoading(false) }).catch(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  async function completeJob(jobId: string) {
    setCompleting(jobId)
    setMsg('')
    try {
      const d = await post<any>(`/api/delivery/jobs/${jobId}/complete`, {})
      setMsg(`Pengiriman selesai! Kamu mendapat ${formatRupiah(d.earningAmount)}.`)
      load()
    } catch (e: any) { setMsg(e.message) }
    finally { setCompleting(null) }
  }

  const activeJobs = jobs.filter(j => j.status === 'TAKEN')
  const doneJobs = jobs.filter(j => j.status === 'COMPLETED')

  if (loading) return <div className="py-10 text-center text-slate-400">Memuat job...</div>

  return (
    <div className="py-6 flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-slate-900">Job Saya</h1>

      {msg && <div className={`text-sm p-3 rounded-xl ${msg.includes('selesai') || msg.includes('mendapat') ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>{msg}</div>}

      {/* Active job */}
      {activeJobs.length > 0 && (
        <div>
          <h2 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" /> Job Aktif
          </h2>
          {activeJobs.map((job: any) => (
            <Card key={job.id} className="border-teal-200 bg-teal-50/30">
              <CardBody>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-bold text-slate-900">#{job.orderId?.slice(-6).toUpperCase()}</p>
                    <p className="text-xs text-slate-500">{job.order?.store?.name}</p>
                    <p className="text-xs text-slate-400">Diambil: {job.takenAt ? formatDate(job.takenAt) : '—'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-teal-600">{formatRupiah(job.fee * 0.8)}</p>
                    <p className="text-xs text-slate-400">Penghasilanmu</p>
                  </div>
                </div>
                {job.order?.address && (
                  <p className="text-sm text-slate-600 mb-3">📍 {job.order.address.street}, {job.order.address.city}</p>
                )}
                <Button
                  loading={completing === job.id}
                  onClick={() => completeJob(job.id)}
                  className="w-full flex items-center gap-2"
                >
                  <CheckCircle size={15} /> Konfirmasi Selesai Dikirim
                </Button>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* History */}
      <div>
        <h2 className="font-semibold text-slate-900 mb-3">Riwayat Job ({doneJobs.length})</h2>
        {doneJobs.length === 0 ? (
          <EmptyState icon="📋" title="Belum ada riwayat job" />
        ) : (
          <div className="flex flex-col gap-3">
            {doneJobs.map((job: any) => (
              <Card key={job.id}>
                <CardBody>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">#{job.orderId?.slice(-6).toUpperCase()}</p>
                      <p className="text-xs text-slate-500">{job.order?.store?.name}</p>
                      <p className="text-xs text-slate-400">Selesai: {job.completedAt ? formatDate(job.completedAt) : '—'}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="success">Selesai</Badge>
                      <p className="text-sm font-bold text-teal-600 mt-1">{formatRupiah(job.fee * 0.8)}</p>
                    </div>
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