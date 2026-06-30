'use client'

import { useEffect, useState } from 'react'
import { useApi } from '@/hooks/use-api'
import { Button } from '@/components/ui/button'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { formatRupiah, formatDate } from '@/lib/utils'
import { WalletTransaction } from '@/types'

const TOPUP_AMOUNTS = [50000, 100000, 200000, 500000, 1000000]

export default function WalletPage() {
  const { get, post } = useApi()
  const [balance, setBalance] = useState(0)
  const [history, setHistory] = useState<WalletTransaction[]>([])
  const [customAmount, setCustomAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  async function loadWallet() {
    const d = await get<any>('/api/wallet')
    setBalance(d.balance)
    setHistory(d.history)
  }

  useEffect(() => { loadWallet() }, [])

  async function handleTopup(amount: number) {
    setLoading(true)
    setMsg('')
    try {
      const d = await post<any>('/api/wallet/topup', { amount })
      setBalance(d.balance)
      setHistory(prev => [d.transaction, ...prev])
      setMsg(`Berhasil top-up ${formatRupiah(amount)}!`)
      setCustomAmount('')
      setTimeout(() => setMsg(''), 3000)
    } catch (e: any) {
      setMsg(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="py-6 flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-slate-900">Dompet Saya</h1>

      <Card className="bg-gradient-to-br from-teal-600 to-cyan-700 text-white border-0">
        <CardBody className="py-8">
          <p className="text-teal-100 text-sm mb-2">Saldo Tersedia</p>
          <p className="text-4xl font-bold">{formatRupiah(balance)}</p>
        </CardBody>
      </Card>

      <Card>
        <CardHeader><p className="font-semibold text-slate-900">Top-up Saldo</p></CardHeader>
        <CardBody>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {TOPUP_AMOUNTS.map(a => (
              <button key={a} onClick={() => handleTopup(a)} disabled={loading}
                className="py-2.5 text-sm font-medium rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50 hover:text-teal-700 transition-all disabled:opacity-50">
                {formatRupiah(a)}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              value={customAmount}
              onChange={e => setCustomAmount(e.target.value)}
              placeholder="Jumlah lainnya (Rp)"
              className="flex-1 rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
            <Button onClick={() => customAmount && handleTopup(Number(customAmount))} disabled={loading || !customAmount} loading={loading}>
              Top-up
            </Button>
          </div>
          {msg && <p className={`text-sm mt-3 ${msg.includes('Berhasil') ? 'text-emerald-600' : 'text-red-500'}`}>{msg}</p>}
        </CardBody>
      </Card>

      <Card>
        <CardHeader><p className="font-semibold text-slate-900">Riwayat Transaksi</p></CardHeader>
        {history.length === 0 ? (
          <CardBody className="text-center py-8 text-slate-400">Belum ada transaksi</CardBody>
        ) : (
          <div className="divide-y divide-slate-50">
            {history.map(tx => (
              <div key={tx.id} className="flex items-center justify-between px-6 py-3.5">
                <div>
                  <p className="text-sm font-medium text-slate-700">{tx.description || tx.type}</p>
                  <p className="text-xs text-slate-400">{formatDate(tx.createdAt)}</p>
                </div>
                <span className={`text-sm font-semibold ${tx.amount > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {tx.amount > 0 ? '+' : ''}{formatRupiah(tx.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}