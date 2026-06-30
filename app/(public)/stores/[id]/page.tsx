'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardBody } from '@/components/ui/card'
import { Spinner } from '@/components/ui/badge'
import { formatRupiah } from '@/lib/utils'
import { ArrowLeft, Package } from 'lucide-react'

export default function StoreDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [store, setStore] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/stores/${id}`)
      .then(r => r.json())
      .then(d => { setStore(d.data?.store || null); setLoading(false) })
  }, [id])

  if (loading) return <div className="flex justify-center py-20"><Spinner className="h-8 w-8" /></div>
  if (!store) return <div className="text-center py-20 text-slate-500">Toko tidak ditemukan</div>

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <Link href="/products" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-teal-600 mb-6 transition-colors">
        <ArrowLeft size={14} /> Kembali
      </Link>

      {/* Store header */}
      <div className="flex items-center gap-4 mb-8 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="w-20 h-20 bg-teal-100 rounded-2xl flex items-center justify-center text-4xl">🏪</div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{store.name}</h1>
          {store.description && <p className="text-slate-500 text-sm mt-1">{store.description}</p>}
          <p className="text-xs text-slate-400 mt-2">Pemilik: {store.seller?.name}</p>
        </div>
        <div className="ml-auto text-center hidden sm:block">
          <p className="text-2xl font-bold text-teal-600">{store._count?.products || 0}</p>
          <p className="text-xs text-slate-400">Produk</p>
        </div>
      </div>

      {/* Products */}
      <h2 className="text-lg font-semibold text-slate-900 mb-4">Produk Toko</h2>
      {store.products?.length === 0 ? (
        <div className="text-center py-10 text-slate-400">Belum ada produk</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {store.products?.map((p: any) => (
            <Link key={p.id} href={`/products/${p.id}`}>
              <Card className="hover:shadow-md transition-shadow overflow-hidden">
                <div className="h-36 bg-gradient-to-br from-teal-50 to-cyan-100 flex items-center justify-center text-4xl">🛍️</div>
                <CardBody className="p-3">
                  <p className="text-sm font-medium text-slate-900 truncate">{p.name}</p>
                  <p className="text-sm font-bold text-teal-600 mt-1">{formatRupiah(p.price)}</p>
                  <p className="text-xs text-slate-400">Stok: {p.stock}</p>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}