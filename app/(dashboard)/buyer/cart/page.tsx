'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useApi } from '@/hooks/use-api'
import { Button } from '@/components/ui/button'
import { Card, CardBody, CardFooter } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/badge'
import { formatRupiah } from '@/lib/utils'
import { Cart } from '@/types'
import { Trash2, ShoppingBag } from 'lucide-react'

export default function CartPage() {
  const { get, put, del } = useApi()
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')

  async function loadCart() {
    const d = await get<any>('/api/cart').catch(() => ({ cart: null }))
    setCart(d.cart)
    setLoading(false)
  }
  useEffect(() => { loadCart() }, [])

  async function updateQty(itemId: string, quantity: number) {
    try {
      await put(`/api/cart/${itemId}`, { quantity })
      loadCart()
    } catch (e: any) { setMsg(e.message) }
  }

  async function removeItem(itemId: string) {
    await del(`/api/cart/${itemId}`).catch(() => {})
    loadCart()
  }

  async function clearCart() {
    if (!confirm('Kosongkan seluruh keranjang?')) return
    await del('/api/cart').catch(() => {})
    loadCart()
  }

  const subtotal = cart?.items?.reduce((s, i) => s + i.product.price * i.quantity, 0) || 0

  if (loading) return <div className="py-10 text-center text-slate-400">Memuat keranjang...</div>

  return (
    <div className="py-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Keranjang Belanja</h1>
        {cart?.storeId && (
          <div className="text-xs bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full border border-amber-200">
            ⚡ Satu keranjang = satu toko
          </div>
        )}
      </div>

      {msg && <div className="text-sm text-red-500 bg-red-50 px-4 py-3 rounded-xl">{msg}</div>}

      {!cart?.items?.length ? (
        <EmptyState icon="🛒" title="Keranjang kosong" description="Temukan produk menarik dan mulai belanja!" />
      ) : (
        <>
          <Card>
            {cart.items.map((item, i) => (
              <div key={item.id} className={`flex items-center gap-4 px-6 py-4 ${i > 0 ? 'border-t border-slate-50' : ''}`}>
                <div className="w-16 h-16 bg-teal-50 rounded-xl flex items-center justify-center text-2xl shrink-0">🛍️</div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 text-sm truncate">{item.product.name}</p>
                  <p className="text-xs text-slate-400">{item.product.store?.name}</p>
                  <p className="text-sm font-bold text-teal-600">{formatRupiah(item.product.price)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden">
                    <button onClick={() => item.quantity > 1 ? updateQty(item.id, item.quantity - 1) : removeItem(item.id)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-slate-50 text-slate-500 transition-colors">−</button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <button onClick={() => updateQty(item.id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-slate-50 text-slate-500 transition-colors">+</button>
                  </div>
                  <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600 transition-colors p-1">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
            <CardFooter className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Subtotal</p>
                <p className="text-xl font-bold text-teal-600">{formatRupiah(subtotal)}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={clearCart}>Kosongkan</Button>
                <Link href="/buyer/checkout">
                  <Button size="sm" className="flex items-center gap-1.5">
                    <ShoppingBag size={14} /> Checkout
                  </Button>
                </Link>
              </div>
            </CardFooter>
          </Card>

          <div className="text-xs text-slate-400 bg-slate-50 px-4 py-3 rounded-xl">
            ℹ️ <strong>Single-store checkout:</strong> SEAPEDIA menerapkan aturan satu toko per transaksi. Semua produk dalam keranjang harus dari toko yang sama.
          </div>
        </>
      )}
    </div>
  )
}