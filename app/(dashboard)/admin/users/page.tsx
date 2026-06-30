'use client'

import { useEffect, useState } from 'react'
import { useApi } from '@/hooks/use-api'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { RoleBadge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'

export default function AdminUsersPage() {
  const { get } = useApi()
  const [users, setUsers] = useState<any[]>([])

  useEffect(() => {
    get<any>('/api/admin/users').then(d => setUsers(d.users || [])).catch(() => {})
  }, [])

  return (
    <div className="py-6 flex flex-col gap-5">
      <h1 className="text-2xl font-bold text-slate-900">Manajemen Users ({users.length})</h1>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-6 py-3 text-xs text-slate-500 font-medium">Nama</th>
                <th className="text-left px-6 py-3 text-xs text-slate-500 font-medium">Username</th>
                <th className="text-left px-6 py-3 text-xs text-slate-500 font-medium">Email</th>
                <th className="text-left px-6 py-3 text-xs text-slate-500 font-medium">Role</th>
                <th className="text-left px-6 py-3 text-xs text-slate-500 font-medium">Bergabung</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="px-6 py-3 font-medium text-slate-900">{u.name}</td>
                  <td className="px-6 py-3 text-slate-600">@{u.username}</td>
                  <td className="px-6 py-3 text-slate-500">{u.email}</td>
                  <td className="px-6 py-3">
                    <div className="flex flex-wrap gap-1">
                      {u.roles.map((r: string) => <RoleBadge key={r} role={r} />)}
                    </div>
                  </td>
                  <td className="px-6 py-3 text-slate-400 text-xs">{formatDate(u.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}