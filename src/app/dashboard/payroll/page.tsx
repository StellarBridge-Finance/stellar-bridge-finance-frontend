'use client';

import { useState } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { AmountDisplay } from '@/components/ui/AmountDisplay';
import { api } from '@/services/api';
import type { Payroll } from '@/types';
import { Plus, RefreshCw } from 'lucide-react';

export default function PayrollListPage() {
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [lookupId, setLookupId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function lookup() {
    const id = parseInt(lookupId);
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const p = await api.getPayroll(id);
      setPayrolls((prev) => {
        const exists = prev.find((x) => x.id === p.id);
        return exists ? prev.map((x) => (x.id === p.id ? p : x)) : [p, ...prev];
      });
    } catch (e: unknown) {
      setError((e as { message?: string })?.message ?? 'Not found');
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardLayout title="Payroll">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Payroll Batches</h2>
        <Link
          href="/dashboard/payroll/new"
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <Plus size={14} /> New Payroll
        </Link>
      </div>

      {/* Lookup by ID */}
      <div className="mb-4 flex gap-2">
        <input
          value={lookupId}
          onChange={(e) => setLookupId(e.target.value)}
          placeholder="Lookup payroll by ID…"
          className="rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-56"
        />
        <button
          onClick={lookup}
          disabled={loading}
          className="flex items-center gap-1 rounded-lg border px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Fetch
        </button>
        {error && <p className="self-center text-xs text-red-500">{error}</p>}
      </div>

      {payrolls.length === 0 ? (
        <div className="rounded-xl border bg-white p-10 text-center text-sm text-gray-400">
          No payrolls loaded. Create one or look up by ID.
        </div>
      ) : (
        <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                {['ID', 'Employer', 'Amount', 'Currency', 'Status', ''].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {payrolls.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono">#{p.id}</td>
                  <td className="px-4 py-3 font-mono text-xs truncate max-w-[120px]">{p.employer}</td>
                  <td className="px-4 py-3">
                    <AmountDisplay stroops={p.totalAmount} currency={p.currency} />
                  </td>
                  <td className="px-4 py-3">{p.currency}</td>
                  <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/payroll/${p.id}`}
                      className="text-indigo-600 hover:underline text-xs"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}
