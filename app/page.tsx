'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Button } from '../components/ui/button'
import { Card, CardBody } from '../components/ui/card'
import { StarRating } from '../components/ui/badge'
import { formatRupiah, formatDate } from '../lib/utils'
import { Product, Review } from '../types'
import { ShoppingBag, Store, Truck, Shield, ArrowRight, Star } from 'lucide-react'

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [reviewForm, setReviewForm] = useState({ name: '', rating: 5, comment: '' })
  const [submitting, setSubmitting] = useState(false)
  const [submitMsg, setSubmitMsg] = useState('')

  useEffect(() => {
    fetch('/api/products?limit=8').then(r => r.json()).then(d => setProducts(d.data?.products || []))
    fetch('/api/reviews').then(r => r.json()).then(d => setReviews(d.data?.reviews || []))
  }, [])

  async function handleReviewSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!reviewForm.name.trim() || !reviewForm.comment.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewForm),
      })
      const json = await res.json()
      if (json.success) {
        setReviews(prev => [json.data.review, ...prev])
        setReviewForm({ name: '', rating: 5, comment: '' })
        setSubmitMsg('Ulasan berhasil dikirim!')
        setTimeout(() => setSubmitMsg(''), 3000)
      } else {
        setSubmitMsg(json.error)
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-teal-600 via-teal-700 to-cyan-800 text-white py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 rounded-full px-4 py-1.5 text-sm mb-6">
             Platform marketplace multi-peran
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Semua kebutuhan<br />dalam satu platform
          </h1>
          <p className="text-lg text-teal-100 mb-10 max-w-2xl mx-auto">
            SEAPEDIA menghubungkan Pembeli, Penjual, dan Driver dalam satu ekosistem marketplace yang terintegrasi.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/products"><Button size="lg" className="bg-white text-teal-700 hover:bg-teal-50 font-semibold">Mulai Belanja</Button></Link>
            <Link href="/register"><Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">Daftar Sekarang</Button></Link>
          </div>
        </div>
      </section>

      {}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-slate-900 mb-3">Satu akun, banyak peran</h2>
          <p className="text-slate-500 text-center mb-10">Pilih peran sesuai kebutuhanmu — bahkan bisa lebih dari satu!</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: <ShoppingBag size={28} />, role: 'Buyer', desc: 'Belanja produk dari berbagai toko', color: 'text-emerald-600 bg-emerald-50' },
              { icon: <Store size={28} />, role: 'Seller', desc: 'Buka toko dan kelola produkmu', color: 'text-blue-600 bg-blue-50' },
              { icon: <Truck size={28} />, role: 'Driver', desc: 'Ambil job pengiriman dan raih penghasilan', color: 'text-amber-600 bg-amber-50' },
              { icon: <Shield size={28} />, role: 'Admin', desc: 'Pantau dan kelola seluruh platform', color: 'text-red-600 bg-red-50' },
            ].map(({ icon, role, desc, color }) => (
              <Card key={role} className="text-center hover:shadow-md transition-shadow">
                <CardBody className="py-6">
                  <div className={`inline-flex p-3 rounded-2xl ${color} mb-3`}>{icon}</div>
                  <h3 className="font-semibold text-slate-900 mb-1">{role}</h3>
                  <p className="text-xs text-slate-500">{desc}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 px-4 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Produk Terbaru</h2>
            <Link href="/products" className="flex items-center gap-1 text-teal-600 text-sm hover:underline">
              Lihat semua <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.length === 0 ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-slate-200 animate-pulse rounded-2xl h-52" />
              ))
            ) : (
              products.map(p => (
                <Link key={p.id} href={`/products/${p.id}`}>
                  <Card className="hover:shadow-md transition-shadow overflow-hidden group">
                    <div className="h-36 bg-gradient-to-br from-teal-100 to-cyan-100 flex items-center justify-center text-4xl">
                      🛍️
                    </div>
                    <CardBody className="py-3 px-3">
                      <p className="text-sm font-medium text-slate-900 truncate">{p.name}</p>
                      <p className="text-xs text-slate-500 mb-1">{p.store?.name}</p>
                      <p className="text-sm font-bold text-teal-600">{formatRupiah(p.price)}</p>
                    </CardBody>
                  </Card>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-slate-900 mb-2">Ulasan Pengguna</h2>
          <p className="text-slate-500 text-center mb-10">Apa kata mereka tentang SEAPEDIA?</p>
          <div className="grid md:grid-cols-2 gap-6 mb-10">
            {reviews.slice(0, 4).map(r => (
              <Card key={r.id}>
                <CardBody>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-slate-900 text-sm">{r.name}</p>
                      <p className="text-xs text-slate-400">{formatDate(r.createdAt)}</p>
                    </div>
                    <StarRating rating={r.rating} />
                  </div>
                  {/* Render as text only (XSS safe) */}
                  <p className="text-sm text-slate-600 leading-relaxed">{r.comment}</p>
                </CardBody>
              </Card>
            ))}
          </div>

          {/* Review Form */}
          <Card className="max-w-lg mx-auto">
            <CardBody>
              <h3 className="font-semibold text-slate-900 mb-4">Bagikan Pengalamanmu</h3>
              <form onSubmit={handleReviewSubmit} className="flex flex-col gap-4">
                <input
                  placeholder="Nama kamu"
                  value={reviewForm.name}
                  onChange={e => setReviewForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  required
                />
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-2">Rating</p>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(n => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setReviewForm(p => ({ ...p, rating: n }))}
                        className={`text-2xl transition-transform hover:scale-110 ${n <= reviewForm.rating ? 'text-amber-400' : 'text-slate-200'}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  placeholder="Ceritakan pengalaman kamu menggunakan SEAPEDIA..."
                  value={reviewForm.comment}
                  onChange={e => setReviewForm(p => ({ ...p, comment: e.target.value }))}
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm resize-none focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  required
                />
                {submitMsg && (
                  <div className={`text-sm p-3 rounded-xl ${submitMsg.includes('berhasil') ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                    {submitMsg}
                  </div>
                )}
                <Button type="submit" loading={submitting}>Kirim Ulasan</Button>
              </form>
            </CardBody>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 px-4 text-center text-sm">
        <p className="font-semibold text-white mb-1">SEAPEDIA</p>
        <p>© 2026 Platform marketplace multi-peran.</p>
      </footer>
    </div>
  )
}