import { DashboardLayout } from '@/components/layout/dashboard-layout'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/users', label: 'Users', icon: '👥' },
  { href: '/admin/stores', label: 'Toko', icon: '🏪' },
  { href: '/admin/orders', label: 'Pesanan', icon: '🧾' },
  { href: '/admin/vouchers', label: 'Voucher', icon: '🎟️' },
  { href: '/admin/promos', label: 'Promo', icon: '🏷️' },
  { href: '/admin/delivery', label: 'Pengiriman', icon: '🚚' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout navItems={navItems} title="Admin Panel" roleColor="text-red-600">
      {children}
    </DashboardLayout>
  )
}