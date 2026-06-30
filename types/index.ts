export type Role = 'ADMIN' | 'SELLER' | 'BUYER' | 'DRIVER'

export type OrderStatus =
  | 'SEDANG_DIKEMAS'
  | 'MENUNGGU_PENGIRIM'
  | 'SEDANG_DIKIRIM'
  | 'PESANAN_SELESAI'
  | 'DIKEMBALIKAN'

export type DeliveryMethod = 'INSTANT' | 'NEXT_DAY' | 'REGULAR'

export interface User {
  id: string
  username: string
  email: string
  name: string
  phone?: string | null
  roles: Role[]
  createdAt: string
}

export interface AuthState {
  user: User | null
  activeRole: Role | null
  token: string | null
  isLoading: boolean
}

export interface Store {
  id: string
  sellerId: string
  name: string
  description?: string | null
  imageUrl?: string | null
  createdAt: string
  seller?: { name: string; username: string }
}

export interface Product {
  id: string
  storeId: string
  name: string
  description?: string | null
  price: number
  stock: number
  imageUrl?: string | null
  isActive: boolean
  createdAt: string
  store?: { id: string; name: string }
}

export interface CartItem {
  id: string
  cartId: string
  productId: string
  quantity: number
  product: Product
}

export interface Cart {
  id: string
  buyerId: string
  storeId?: string | null
  items: CartItem[]
}

export interface Address {
  id: string
  buyerId: string
  label: string
  street: string
  city: string
  province: string
  zipCode: string
  isDefault: boolean
}

export interface BuyerProfile {
  id: string
  userId: string
  balance: number
}

export interface WalletTransaction {
  id: string
  amount: number
  type: 'TOPUP' | 'PAYMENT' | 'REFUND'
  description?: string | null
  createdAt: string
}

export interface OrderItem {
  id: string
  productId: string
  name: string
  price: number
  quantity: number
}

export interface OrderStatusHistory {
  id: string
  status: OrderStatus
  note?: string | null
  createdAt: string
}

export interface Order {
  id: string
  buyerId: string
  storeId: string
  status: OrderStatus
  deliveryMethod: DeliveryMethod
  subtotal: number
  discountAmount: number
  deliveryFee: number
  tax: number
  total: number
  discountCode?: string | null
  isOverdue: boolean
  createdAt: string
  updatedAt: string
  overdueAt?: string | null
  items: OrderItem[]
  statusHistory?: OrderStatusHistory[]
  store?: { id: string; name: string }
  address?: Address | null
  deliveryJob?: DeliveryJob | null
}

export interface Voucher {
  id: string
  code: string
  description?: string | null
  discountType: 'PERCENTAGE' | 'FIXED'
  discountValue: number
  minPurchase: number
  maxDiscount?: number | null
  expiresAt: string
  usageLimit: number
  usageCount: number
  isActive: boolean
  createdAt: string
}

export interface Promo {
  id: string
  code: string
  description?: string | null
  discountType: 'PERCENTAGE' | 'FIXED'
  discountValue: number
  minPurchase: number
  maxDiscount?: number | null
  expiresAt: string
  isActive: boolean
  createdAt: string
}

export interface DeliveryJob {
  id: string
  orderId: string
  driverId?: string | null
  status: 'AVAILABLE' | 'TAKEN' | 'COMPLETED'
  fee: number
  takenAt?: string | null
  completedAt?: string | null
  createdAt: string
  order?: Order
  driver?: { id: string; user: { name: string } } | null
}

export interface DriverEarning {
  id: string
  driverId: string
  jobId: string
  amount: number
  createdAt: string
  job?: DeliveryJob
}

export interface Review {
  id: string
  userId?: string | null
  name: string
  rating: number
  comment: string
  createdAt: string
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  pages: number
}

export interface CheckoutSummary {
  subtotal: number
  discountAmount: number
  discountCode?: string
  discountType?: 'VOUCHER' | 'PROMO'
  deliveryFee: number
  tax: number
  total: number
}