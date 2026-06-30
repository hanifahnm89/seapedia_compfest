'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useApi } from '@/hooks/use-api'
import { Button } from '@/components/ui/button'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { formatRupiah, deliveryFeeByMethod, calculateCheckout, DELIVERY_METHOD_LABEL } from '@/lib/utils'
import { Address, Cart, DeliveryMethod } from '@/types'
import { CheckCircle, Tag } from 'lucide-react'

const DELIVERY_METHODS: DeliveryMethod[] = ['INSTANT', 'NEXT_DAY', 'REGULAR']

export default function CheckoutPage() {
  const { get, post } = useApi()
  const router = useRouter()
  const [cart, setCart] = useState<Cart | null>(null)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddress, setSelectedAddress] = useState('')
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('REGULAR')
  const [discountCode, setDiscountCode] = useState('')
  const [discount, setDiscount] = useState<{ amount: number; type: string; code: string } | null>(null)
  const [validating, setValidating] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [orderId, setOrderId] = useState('')

  useEffect(() => {
    get<any>('/api/cart').then(d => setCart(d.cart))
    get<any>('/api/buyer/addresses').then(d => {
      setAddresses(d.addresses || [])
      const def = d.addresses?.find((a: Address) => a.isDefault)
      if (def) setSelectedAddress(def.id)
    })
  }, [])

  const subtotal = cart?.items?.reduce((s, i) => s + i.product.price * i.quantity, 0) || 0
  const deliveryFee = deliveryFeeByMethod(deliveryMethod)
  const discountAmount = discount?.amount || 0
  const { tax, total } = calculateCheckout(subtotal, discountAmount, deliveryFee)

  async function validateDiscount() {
    if (!discountCode.trim()) return
    setValidating(true)
    setError('')
    try {
      let d: any = null
      try { d = await post<any>('/api/vouchers/validate', { code: discountCode.toUpperCase(), subtotal }) } catch {}
      if (!d) d = await post<any>('/api/promos/validate', { code: discountCode.toUpperCase(), subtotal })
      setDiscount({ amount: d.discountAmount, type: d.type, code: discountCode.toUpperCase() })
    } catch (e: any) {
      setError(e.message)
      setDiscount(null)
    } finally { setValidating(false) }
  }

  async function handleCheckout() {
    if (!selectedAddress) { setError('Pilih alamat pengiriman'); return }
    setLoading(true)
    setError('')
    try {
      const d = await post<any>('/api/orders', {
        addressId: selectedAddress,
        deliveryMethod,
        discountCode: discount?.code || undefined,
      })
      setOrderId(d.order.id)
      setSuccess(true)
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  if (success) return (
    <div className="py-10 max-w-md mx-auto text-center">
      <div className="text-6xl mb-4">🎉</div>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Pesanan Berhasil!</h2>
      <p className="text-slate-500 mb-6">Pesananmu sedang dikemas oleh seller.</p>
      <div className="flex flex-col gap-2">
        <Button onClick={() => router.push(`/buyer/orders/${orderId}`)}>Lihat Pesanan</Button>
        <Button variant="secondary" onClick={() => router.push('/buyer/orders')}>Semua Pesanan</Button>
      </div>
    </div>
  )

  if (!cart?.items?.length) return (
    <div className="py-10 text-center">
      <p className="text-slate-500">Keranjang kosong.</p>
      <Button className="mt-4" onClick={() => router.push('/products')}>Belanja Sekarang</Button>
    </div>
  )

  return (
    <div className="py-6">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Checkout</h1>
      <div className="grid md:grid-cols-[1fr_360px] gap-6">
        <div className="flex flex-col gap-5">
          {/* Address */}
          <Card>
            <CardHeader><p className="font-semibold text-slate-900">📍 Alamat Pengiriman</p></CardHeader>
            <CardBody>
              {addresses.length === 0 ? (
                <p className="text-sm text-amber-600">Tambahkan alamat di <a href="/buyer/addresses" className="underline">halaman alamat</a> terlebih dahulu.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {addresses.map(a => (
                    <label key={a.id} className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${selectedAddress === a.id ? 'border-teal-500 bg-teal-50' : 'border-slate-200 hover:border-slate-300'}`}>
                      <input type="radio" name="address" value={a.id} checked={selectedAddress === a.id} onChange={() => setSelectedAddress(a.id)} className="mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">{a.label}</p>
                        <p className="text-xs text-slate-500">{a.street}, {a.city}, {a.province} {a.zipCode}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          {/* Delivery method */}
          <Card>
            <CardHeader><p className="font-semibold text-slate-900">🚚 Metode Pengiriman</p></CardHeader>
            <CardBody>
              <div className="flex flex-col gap-2">
                {DELIVERY_METHODS.map(m => (
                  <label key={m} className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${deliveryMethod === m ? 'border-teal-500 bg-teal-50' : 'border-slate-200 hover:border-slate-300'}`}>
                    <div className="flex items-center gap-3">
                      <input type="radio" name="delivery" value={m} checked={deliveryMethod === m} onChange={() => setDeliveryMethod(m)} />
                      <span className="text-sm font-medium text-slate-700">{DELIVERY_METHOD_LABEL[m]}</span>
                    </div>
                    <span className="text-sm font-semibold text-teal-600">{formatRupiah(deliveryFeeByMethod(m))}</span>
                  </label>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Discount */}
          <Card>
            <CardHeader><p className="font-semibold text-slate-900">🏷️ Kode Diskon</p></CardHeader>
            <CardBody>
              <div className="flex gap-2">
                <input
                  value={discountCode}
                  onChange={e => setDiscountCode(e.target.value.toUpperCase())}
                  placeholder="Masukkan kode voucher / promo"
                  className="flex-1 rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
                <Button onClick={validateDiscount} loading={validating} variant="outline">Pakai</Button>
              </div>
              {discount && (
                <div className="flex items-center gap-2 mt-3 text-sm text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl">
                  <Tag size={13} />
                  <span>{discount.type} diterapkan: hemat {formatRupiah(discount.amount)}</span>
                  <button onClick={() => { setDiscount(null); setDiscountCode('') }} className="ml-auto text-slate-400 hover:text-slate-600">✕</button>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Summary */}
        <div>
          <Card className="sticky top-20">
            <CardHeader><p className="font-semibold text-slate-900">Ringkasan Pembayaran</p></CardHeader>
            <CardBody className="flex flex-col gap-3">
              {cart.items.map(i => (
                <div key={i.id} className="flex justify-between text-sm">
                  <span className="text-slate-600">{i.product.name} ×{i.quantity}</span>
                  <span className="font-medium">{formatRupiah(i.product.price * i.quantity)}</span>
                </div>
              ))}
              <div className="border-t border-slate-100 pt-3 flex flex-col gap-2">
                <div className="flex justify-between text-sm text-slate-600"><span>Subtotal</span><span>{formatRupiah(subtotal)}</span></div>
                {discountAmount > 0 && <div className="flex justify-between text-sm text-emerald-600"><span>Diskon ({discount?.type})</span><span>−{formatRupiah(discountAmount)}</span></div>}
                <div className="flex justify-between text-sm text-slate-600"><span>Ongkir ({deliveryMethod})</span><span>{formatRupiah(deliveryFee)}</span></div>
                <div className="flex justify-between text-sm text-slate-600"><span>PPN 12%</span><span>{formatRupiah(tax)}</span></div>
                <div className="flex justify-between font-bold text-base border-t border-slate-100 pt-2"><span>Total</span><span className="text-teal-600">{formatRupiah(total)}</span></div>
              </div>
              {error && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-xl">{error}</p>}
              <Button size="lg" loading={loading} onClick={handleCheckout} className="mt-1">
                <CheckCircle size={15} /> Bayar Sekarang
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}