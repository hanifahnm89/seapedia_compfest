'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useApi } from '@/hooks/use-api'
import { Button } from '@/components/ui/button'
import { Card, CardBody } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/badge'
import { formatRupiah, formatDate } from '@/lib/utils'
import { Product } from '@/types'
import { Plus, Pencil, Trash2 } from 'lucide-react'

export default function SellerProductsPage() {
  const { get, del } = useApi()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [store, setStore] = useState<any>(null)

  async function load() {
    const s = await get<any>('/api/seller/store').catch(() => null)
    setStore(s?.store)
    if (s?.store) {
      const d = await get<any>(`/api/products?storeId=${s.store.id}&limit=50`).catch(() => ({ products: [] }))
      setProducts(d.products || [])
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleDelete(id: string) {
    if (!confirm('Hapus produk ini?')) return
    await del(`/api/products/${id}`).catch(() => {})
    load()
  }

  if (loading) return <div className="py-10 text-center text-slate-400">Memuat produk...</div>

  return (
    <div className="py-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Produk Saya</h1>
        {store && (
          <Link href="/seller/products/new">
            <Button size="sm"><Plus size={14} /> Tambah Produk</Button>
          </Link>
        )}
      </div>

      {!store ? (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-700">
          ⚠️ <Link href="/seller/store" className="font-semibold underline">Buat toko</Link> terlebih dahulu sebelum menambahkan produk.
        </div>
      ) : products.length === 0 ? (
        <EmptyState icon="📦" title="Belum ada produk" description="Tambahkan produk pertamamu!" />
      ) : (
        <div className="grid gap-3">
          {products.map(p => (
            <Card key={p.id}>
              <CardBody>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-teal-50 rounded-xl flex items-center justify-center text-2xl shrink-0">🛍️</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 text-sm">{p.name}</p>
                    <p className="text-xs text-slate-400 truncate">{p.description || '—'}</p>
                    <div className="flex gap-3 mt-1">
                      <span className="text-sm font-bold text-teal-600">{formatRupiah(p.price)}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${p.stock > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                        Stok: {p.stock}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Link href={`/seller/products/${p.id}`}>
                      <Button variant="secondary" size="sm"><Pencil size={12} /></Button>
                    </Link>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(p.id)}><Trash2 size={12} /></Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}