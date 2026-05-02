'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CreditCard, ShieldCheck, Lock, TrendingUp } from 'lucide-react';

const stats = [
  { label: 'Total Payrolls', value: '—', icon: CreditCard, color: 'bg-indigo-50 text-indigo-600' },
  { label: 'Executed', value: '—', icon: TrendingUp, color: 'bg-green-50 text-green-600' },
  { label: 'Whitelisted Addresses', value: '—', icon: ShieldCheck, color: 'bg-blue-50 text-blue-600' },
  { label: 'Active Escrows', value: '—', icon: Lock, color: 'bg-yellow-50 text-yellow-600' },
];

const recentActivity = [
  { id: 1, type: 'Payroll', description: 'Batch #1 executed', time: '2 min ago', status: 'Executed' },
  { id: 2, type: 'Escrow', description: 'Funds locked for batch #2', time: '10 min ago', status: 'Pending' },
  { id: 3, type: 'Compliance', description: 'GABC…XYZ whitelisted', time: '1 hr ago', status: 'Whitelisted' },
];

export default function DashboardPage() {
  return (
    <DashboardLayout title="Dashboard">
      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-xl bg-white p-5 shadow-sm border">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">{label}</p>
              <span className={`rounded-lg p-2 ${color}`}>
                <Icon size={16} />
              </span>
            </div>
            <p className="mt-3 text-2xl font-bold text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { href: '/dashboard/payroll/new', label: 'New Payroll', desc: 'Submit a payroll batch' },
          { href: '/dashboard/compliance', label: 'Check KYC', desc: 'Verify recipient addresses' },
          { href: '/dashboard/escrow', label: 'Lock Funds', desc: 'Create an escrow' },
        ].map(({ href, label, desc }) => (
          <a
            key={href}
            href={href}
            className="rounded-xl border bg-white p-5 shadow-sm hover:border-indigo-400 transition-colors"
          >
            <p className="font-semibold text-gray-800">{label}</p>
            <p className="mt-1 text-sm text-gray-500">{desc}</p>
          </a>
        ))}
      </div>

      {/* Recent activity */}
      <div className="mt-6 rounded-xl border bg-white shadow-sm">
        <div className="border-b px-5 py-4">
          <h2 className="font-semibold text-gray-800">Recent Activity</h2>
        </div>
        <ul className="divide-y">
          {recentActivity.map((item) => (
            <li key={item.id} className="flex items-center justify-between px-5 py-3">
              <div>
                <p className="text-sm font-medium text-gray-800">{item.description}</p>
                <p className="text-xs text-gray-400">{item.type} · {item.time}</p>
              </div>
              <span className="text-xs text-gray-500">{item.status}</span>
            </li>
          ))}
        </ul>
      </div>
    </DashboardLayout>
  );
}
