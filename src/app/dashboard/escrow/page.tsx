'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AmountDisplay } from '@/components/ui/AmountDisplay';
import { TxHashLink } from '@/components/ui/TxHashLink';
import { api } from '@/services/api';
import { useAuthStore } from '@/store/auth';
import type { Escrow } from '@/types';

const schema = z.object({
  beneficiary: z.string().startsWith('G').min(56).max(56),
  amount: z.coerce.number().positive(),
  currency: z.string().min(1),
});
type FormData = z.infer<typeof schema>;

export default function EscrowPage() {
  const depositor = useAuthStore((s) => s.employer) ?? '';
  const [escrow, setEscrow] = useState<Escrow | null>(null);
  const [txHash, setTxHash] = useState('');
  const [apiError, setApiError] = useState('');
  const [lookupId, setLookupId] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema) as Resolver<FormData>,
    defaultValues: { currency: 'USDC' },
  });

  async function onCreate(data: FormData) {
    setApiError('');
    setTxHash('');
    try {
      const res = await api.createEscrow({ ...data, depositor });
      setTxHash(res.txHash);
      reset();
    } catch (e: unknown) {
      setApiError((e as { message?: string })?.message ?? 'Failed');
    }
  }

  async function lookupEscrow() {
    const id = parseInt(lookupId);
    if (!id) return;
    try {
      const e = await api.getEscrow(id);
      setEscrow(e);
      setApiError('');
    } catch (e: unknown) {
      setApiError((e as { message?: string })?.message ?? 'Not found');
    }
  }

  async function handleRelease() {
    if (!escrow) return;
    try {
      const res = await api.releaseEscrow(escrow.id, depositor);
      setTxHash(res.txHash);
      setEscrow({ ...escrow, released: true });
    } catch (e: unknown) {
      setApiError((e as { message?: string })?.message ?? 'Failed');
    }
  }

  async function handleRefund() {
    if (!escrow) return;
    try {
      const res = await api.refundEscrow(escrow.id, depositor);
      setTxHash(res.txHash);
      setEscrow({ ...escrow, released: true });
    } catch (e: unknown) {
      setApiError((e as { message?: string })?.message ?? 'Failed');
    }
  }

  return (
    <DashboardLayout title="Escrow">
      <div className="max-w-xl space-y-4">
        {/* Create escrow */}
        <div className="rounded-xl border bg-white p-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-gray-800">Lock Funds</h2>
          <form onSubmit={handleSubmit(onCreate)} className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Beneficiary address</label>
              <input
                {...register('beneficiary')}
                placeholder="GDEF…123"
                className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {errors.beneficiary && <p className="mt-1 text-xs text-red-500">{errors.beneficiary.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Amount</label>
                <input
                  {...register('amount')}
                  type="number"
                  step="0.01"
                  placeholder="5000.00"
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.amount && <p className="mt-1 text-xs text-red-500">{errors.amount.message}</p>}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Currency</label>
                <input
                  {...register('currency')}
                  placeholder="USDC"
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Locking…' : 'Lock funds'}
            </button>
          </form>
        </div>

        {/* Lookup + manage */}
        <div className="rounded-xl border bg-white p-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-gray-800">Manage Escrow</h2>
          <div className="flex gap-2">
            <input
              value={lookupId}
              onChange={(e) => setLookupId(e.target.value)}
              placeholder="Escrow ID"
              className="w-32 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={lookupEscrow}
              className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
            >
              Fetch
            </button>
          </div>

          {escrow && (
            <div className="rounded-lg border p-4 space-y-3">
              <dl className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <dt className="text-gray-500 text-xs">ID</dt>
                  <dd className="font-medium">#{escrow.id}</dd>
                </div>
                <div>
                  <dt className="text-gray-500 text-xs">Status</dt>
                  <dd className={escrow.released ? 'text-gray-400' : 'text-green-600 font-medium'}>
                    {escrow.released ? 'Released' : 'Active'}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500 text-xs">Amount</dt>
                  <dd><AmountDisplay stroops={escrow.amount} currency={escrow.currency} /></dd>
                </div>
                <div>
                  <dt className="text-gray-500 text-xs">Beneficiary</dt>
                  <dd className="font-mono text-xs truncate">{escrow.beneficiary}</dd>
                </div>
              </dl>

              {!escrow.released && (
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={handleRelease}
                    className="rounded-lg bg-green-600 px-3 py-1.5 text-xs text-white hover:bg-green-700"
                  >
                    Release to beneficiary
                  </button>
                  <button
                    onClick={handleRefund}
                    className="rounded-lg bg-orange-500 px-3 py-1.5 text-xs text-white hover:bg-orange-600"
                  >
                    Refund to depositor
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {txHash && (
          <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm">
            <span className="text-green-700 font-medium">Tx: </span>
            <TxHashLink hash={txHash} />
          </div>
        )}
        {apiError && <p className="text-sm text-red-500">{apiError}</p>}
      </div>
    </DashboardLayout>
  );
}
