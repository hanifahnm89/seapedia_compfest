import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { DeliveryMethod, OrderStatus } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date))
}

export function deliveryFeeByMethod(method: DeliveryMethod | string): number {
  switch (method) {
    case 'INSTANT': return 25000
    case 'NEXT_DAY': return 15000
    case 'REGULAR': return 9000
    default: return 9000
  }
}

export function deliveryDeadline(method: DeliveryMethod | string, from = new Date()): Date {
  const d = new Date(from)
  switch (method) {
    case 'INSTANT': d.setHours(d.getHours() + 3); break
    case 'NEXT_DAY': d.setDate(d.getDate() + 1); break
    case 'REGULAR': d.setDate(d.getDate() + 3); break
  }
  return d
}

export const PPN_RATE = 0.12

export function calculateCheckout(subtotal: number, discountAmount: number, deliveryFee: number) {
  const afterDiscount = Math.max(0, subtotal - discountAmount)
  const tax = afterDiscount * PPN_RATE
  const total = afterDiscount + tax + deliveryFee
  return { afterDiscount, tax: parseFloat(tax.toFixed(2)), total: parseFloat(total.toFixed(2)) }
}

export function sanitizeText(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .trim()
}

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  SEDANG_DIKEMAS: 'Sedang Dikemas',
  MENUNGGU_PENGIRIM: 'Menunggu Pengirim',
  SEDANG_DIKIRIM: 'Sedang Dikirim',
  PESANAN_SELESAI: 'Pesanan Selesai',
  DIKEMBALIKAN: 'Dikembalikan',
}

export const DELIVERY_METHOD_LABEL: Record<DeliveryMethod, string> = {
  INSTANT: 'Instant (3 jam)',
  NEXT_DAY: 'Next Day (1 hari)',
  REGULAR: 'Regular (3 hari)',
}

export function truncate(str: string, len = 100): string {
  return str.length > len ? str.slice(0, len) + '...' : str
}