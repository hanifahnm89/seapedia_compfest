import { DashboardLayout } from '@/components/layout/dashboard-layout'

const navItems = [
  { href: '/driver', label: 'Dashboard', icon: '🏠' },
  { href: '/driver/jobs', label: 'Cari Job', icon: '🔍' },
  { href: '/driver/my-jobs', label: 'Job Saya', icon: '📋' },
  { href: '/driver/earnings', label: 'Penghasilan', icon: '💰' },
]

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout navItems={navItems} title="Driver Dashboard" roleColor="text-amber-600">
      {children}
    </DashboardLayout>
  )
}