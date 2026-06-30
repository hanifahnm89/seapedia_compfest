'use client'

import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/features/auth/use-auth'
import { useApi } from '@/hooks/use-api'
import { Button } from '@/components/ui/button'
import { Card, CardBody } from '@/components/ui/card'
import { Spinner, Alert } from '@/components/ui/badge'
import { formatRupiah, formatDate } from '@/lib/utils'
import { Product } from '@/types'
import { Store, Package, ArrowLeft, ShoppingCart } from 'lucide-react'

export default function ProductDetailPage() {
  const { id } = useParams() as { id: string }
  const { isLoggedIn, activeRole } = useAuth()
  const { post } = useApi()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(1)
  const [adding, setAdding] = useState(false)
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then(r => r.json())
      .then(d => { setProduct(d.data?.product || null); setLoading(false) })
      .catch(() => setLoading(false))
  }, [id])

  async function addToCart() {
    if (!isLoggedIn) { router.push('/login'); return }
    if (activeRole !== 'BUYER') { setMsg({ type: 'error', text: 'Aktifkan role Buyer untuk berbelanja' }); return }
    setAdding(true)
    try {
      await post('/api/cart', { productId: id, quantity: qty })
      setMsg({ type: 'success', text: 'Produk ditambahkan ke keranjang!' })
      setTimeout(() => setMsg(null), 3000)
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : 'Gagal menambahkan ke keranjang'
      if (errMsg.includes('Keranjang sudah berisi')) {
        setMsg({ type: 'error', text: errMsg + ' — Pergi ke keranjang untuk mengosongkan terlebih dahulu.' })
      } else {
        setMsg({ type: 'error', text: errMsg })
      }
    } finally {
      setAdding(false)
    }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner className="h-8 w-8" /></div>
  if (!product) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <p className="text-slate-500">Produk tidak ditemukan.</p>
      <Link href="/products"><Button variant="outline" className="mt-4">Kembali</Button></Link>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <Link href="/products" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-teal-600 mb-6 transition-colors">
        <ArrowLeft size={14} /> Kembali ke Produk
      </Link>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Image */}
        <div className="h-80 bg-gradient-to-br from-teal-50 to-cyan-100 rounded-2xl flex items-center justify-center text-8xl">
          🛍️
        </div>

        {/* Info */}
        <div className="flex flex-col gap-4">
          <div>
            {product.store && (
              <Link href={`/stores/${product.store.id}`} className="inline-flex items-center gap-1.5 text-sm text-teal-600 hover:underline mb-2">
                <Store size={13} />{product.store.name}
              </Link>
            )}
            <h1 className="text-2xl font-bold text-slate-900">{product.name}</h1>
            {product.description && <p className="text-slate-500 text-sm mt-2 leading-relaxed">{product.description}</p>}
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-teal-600">{formatRupiah(product.price)}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Package size={14} />
            <span>Stok tersedia: <strong className="text-slate-700">{product.stock}</strong></span>
          </div>

          {product.stock > 0 ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-600 font-medium">Jumlah:</span>
                <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-10 h-10 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors text-lg">−</button>
                  <span className="w-12 text-center text-sm font-medium">{qty}</span>
                  <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} className="w-10 h-10 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors text-lg">+</button>
                </div>
              </div>

              {msg && <Alert type={msg.type} message={msg.text} onClose={() => setMsg(null)} />}

              <Button size="lg" loading={adding} onClick={addToCart} className="flex items-center gap-2">
                <ShoppingCart size={16} /> Tambah ke Keranjang
              </Button>

              {!isLoggedIn && (
                <p className="text-xs text-slate-400 text-center">
                  <Link href="/login" className="text-teal-600 hover:underline">Masuk</Link> untuk berbelanja
                </p>
              )}
            </div>
          ) : (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">Stok habis</div>
          )}
        </div>
      </div>

      {/* Store info */}
      {product.store && (
        <Card className="mt-8">
          <CardBody>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center text-2xl">🏪</div>
                <div>
                  <p className="font-semibold text-slate-900">{product.store.name}</p>
                  <p className="text-xs text-slate-400">Toko resmi SEAPEDIA</p>
                </div>
              </div>
              <Link href={`/stores/${product.store.id}`}>
                <Button variant="outline" size="sm">Kunjungi Toko</Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  )
}