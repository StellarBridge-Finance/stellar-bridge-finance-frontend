'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { AmountDisplay } from '@/components/ui/AmountDisplay';
import { TxHashLink } from '@/components/ui/TxHashLink';
import { api } from '@/services/api';
import type { Payroll } from '@/types';
import { RefreshCw } from 'lucide-react';

export default function PayrollDetailPage() {
  const { id } = useParams<{ id: string }>();
  const payrollId = parseInt(id);

  const [payroll, setPayroll] = useState<Payroll | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionTx, setActionTx] = useState('');
  const [actionError, setActionError] = useState('');
  const [polling, setPolling] = useState(false);

  const fetchPayroll = useCallback(async () => {
    try {
      const p = await api.getPayroll(payrollId);
      setPayroll(p);
      return p;
    } catch (e: unknown) {
      setError((e as { message?: string })?.message ?? 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [payrollId]);

  useEffect(() => { fetchPayroll(); }, [fetchPayroll]);

  async function startPolling() {
    setPolling(true);
    setActionError('');
    try {
      let p = await fetchPayroll();
      while (p && p.status !== 'Executed' && p.status !== 'Cancelled') {
        await new Promise((r) => setTimeout(r, 3000));
        p = await fetchPayroll() ?? p;
      }
    } finally {
      setPolling(false);
    }
  }

  async function handleAction(action: 'approve' | 'execute') {
    setActionError('');
    setActionTx('');
    try {
      const res =
        action === 'approve'
          ? await api.approvePayroll(payrollId)
          : await api.executePayroll(payrollId);
      setActionTx(res.txHash);
      await fetchPayroll();
    } catch (e: unknown) {
      setActionError((e as { message?: string })?.message ?? 'Action failed');
    }
  }

  if (loading) return <DashboardLayout title="Payroll"><p className="text-sm text-gray-500">Loading…</p></DashboardLayout>;
  if (error) return <DashboardLayout title="Payroll"><p className="text-sm text-red-500">{error}</p></DashboardLayout>;
  if (!payroll) return null;

  const isTerminal = payroll.status === 'Executed' || payroll.status === 'Cancelled';

  return (
    <DashboardLayout title={`Payroll #${payroll.id}`}>
      <div className="max-w-2xl space-y-4">
        {/* Summary card */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Batch #{payroll.id}</h2>
            <StatusBadge status={payroll.status} />
          </div>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-gray-500">Employer</dt>
              <dd className="font-mono text-xs truncate">{payroll.employer}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Total</dt>
              <dd><AmountDisplay stroops={payroll.totalAmount} currency={payroll.currency} /></dd>
            </div>
          </dl>
        </div>

        {/* Recipients */}
        <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
          <div className="border-b px-5 py-3 font-semibold text-sm text-gray-800">
            Recipients ({payroll.recipients.length})
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-2 text-left">Address</th>
                <th className="px-4 py-2 text-left">Amount</th>
                <th className="px-4 py-2 text-left">Currency</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {payroll.recipients.map((r, i) => (
                <tr key={i}>
                  <td className="px-4 py-2 font-mono text-xs">{r.address}</td>
                  <td className="px-4 py-2">{r.amount}</td>
                  <td className="px-4 py-2">{r.currency}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Actions */}
        {!isTerminal && (
          <div className="flex flex-wrap gap-3">
            {payroll.status === 'Pending' && (
              <button
                onClick={() => handleAction('approve')}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
              >
                Approve
              </button>
            )}
            {payroll.status === 'Approved' && (
              <button
                onClick={() => handleAction('execute')}
                className="rounded-lg bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
              >
                Execute
              </button>
            )}
            <button
              onClick={startPolling}
              disabled={polling}
              className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw size={14} className={polling ? 'animate-spin' : ''} />
              {polling ? 'Polling…' : 'Poll status'}
            </button>
          </div>
        )}

        {actionTx && (
          <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm">
            <span className="text-green-700 font-medium">Tx: </span>
            <TxHashLink hash={actionTx} />
          </div>
        )}
        {actionError && (
          <p className="text-sm text-red-500">{actionError}</p>
        )}
      </div>
    </DashboardLayout>
  );
}
