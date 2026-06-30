import { cn } from '@/lib/utils'
import { HTMLAttributes } from 'react'
import { OrderStatus } from '@/types'
import { ORDER_STATUS_LABEL } from '@/lib/utils'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'teal'
}

export function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
  const variants = {
    default: 'bg-slate-100 text-slate-700',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
    teal: 'bg-teal-100 text-teal-700',
  }
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', variants[variant], className)} {...props}>
      {children}
    </span>
  )
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const variantMap: Record<OrderStatus, BadgeProps['variant']> = {
    SEDANG_DIKEMAS: 'warning',
    MENUNGGU_PENGIRIM: 'info',
    SEDANG_DIKIRIM: 'teal',
    PESANAN_SELESAI: 'success',
    DIKEMBALIKAN: 'danger',
  }
  return <Badge variant={variantMap[status]}>{ORDER_STATUS_LABEL[status]}</Badge>
}

export function RoleBadge({ role }: { role: string }) {
  const map: Record<string, BadgeProps['variant']> = {
    ADMIN: 'danger',
    SELLER: 'info',
    BUYER: 'success',
    DRIVER: 'warning',
  }
  const labels: Record<string, string> = { ADMIN: 'Admin', SELLER: 'Seller', BUYER: 'Buyer', DRIVER: 'Driver' }
  return <Badge variant={map[role] || 'default'}>{labels[role] || role}</Badge>
}

// Star rating display
export function StarRating({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className={i < rating ? 'text-amber-400' : 'text-slate-200'}>★</span>
      ))}
    </div>
  )
}

// Loading spinner
export function Spinner({ className }: { className?: string }) {
  return (
    <svg className={cn('animate-spin h-5 w-5 text-teal-600', className)} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

// Empty state
export function EmptyState({ icon, title, description }: { icon?: string; title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && <div className="text-5xl mb-4">{icon}</div>}
      <p className="text-slate-600 font-medium">{title}</p>
      {description && <p className="text-sm text-slate-400 mt-1">{description}</p>}
    </div>
  )
}

// Toast-like alert
export function Alert({ type = 'info', message, onClose }: { type?: 'success' | 'error' | 'info' | 'warning'; message: string; onClose?: () => void }) {
  const styles = {
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    error: 'bg-red-50 text-red-800 border-red-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
  }
  return (
    <div className={cn('flex items-start gap-3 p-3.5 rounded-xl border text-sm', styles[type])}>
      <span className="flex-1">{message}</span>
      {onClose && <button onClick={onClose} className="text-inherit opacity-60 hover:opacity-100">✕</button>}
    </div>
  )
}