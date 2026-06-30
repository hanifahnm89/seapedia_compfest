'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Card, CardBody } from '@/components/ui/card'
import { Spinner, EmptyState } from '@/components/ui/badge'
import { formatRupiah } from '@/lib/utils'
import { Product } from '@/types'
import { Search } from 'lucide-react'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [query, setQuery] = useState('')

  async function load(q = query, p = page) {
    setLoading(true)
    const url = `/api/products?page=${p}&limit=20${q ? `&search=${encodeURIComponent(q)}` : ''}`
    const res = await fetch(url)
    const json = await res.json()
    if (json.success) {
      setProducts(json.data.products)
      setTotalPages(json.data.pages)
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [page])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setPage(1)
    setQuery(search)
    load(search, 1)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Semua Produk</h1>
          <p className="text-slate-500 text-sm">Temukan produk dari berbagai toko</p>
        </div>
        <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari produk..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>
          <button type="submit" className="px-4 py-2.5 bg-teal-600 text-white text-sm rounded-xl hover:bg-teal-700 transition-colors font-medium">
            Cari
          </button>
        </form>
      </div>

      
      {loading ? (
        <div className="flex justify-center py-20"><Spinner className="h-8 w-8" /></div>
      ) : products.length === 0 ? (
        <EmptyState icon="🔍" title="Produk tidak ditemukan" description="Coba kata kunci lain" />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {products.map(p => (
              <Link key={p.id} href={`/products/${p.id}`}>
                <Card className="hover:shadow-md transition-all hover:-translate-y-0.5 overflow-hidden group h-full">
                  <div className="h-40 bg-gradient-to-br from-teal-50 to-cyan-100 flex items-center justify-center text-5xl">
                    🛍️
                  </div>
                  <CardBody className="p-3">
                    <p className="text-sm font-medium text-slate-900 line-clamp-2 leading-tight mb-1">{p.name}</p>
                    <p className="text-xs text-slate-400 mb-2 truncate">{p.store?.name}</p>
                    <p className="text-sm font-bold text-teal-600">{formatRupiah(p.price)}</p>
                    <p className="text-xs text-slate-400 mt-0.5">Stok: {p.stock}</p>
                  </CardBody>
                </Card>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
              >
                ← Prev
              </button>
              <span className="px-4 py-2 text-sm text-slate-600">{page} / {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 text-sm rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}