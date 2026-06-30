import { DashboardLayout } from '@/components/layout/dashboard-layout'

const navItems = [
  { href: '/seller', label: 'Ringkasan', icon: '🏠' },
  { href: '/seller/store', label: 'Toko Saya', icon: '🏪' },
  { href: '/seller/products', label: 'Produk', icon: '📦' },
  { href: '/seller/orders', label: 'Pesanan Masuk', icon: '🧾' },
]

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout navItems={navItems} title="Seller Dashboard" roleColor="text-blue-600">
      {children}
    </DashboardLayout>
  )
}