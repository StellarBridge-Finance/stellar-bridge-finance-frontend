'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { api } from '@/services/api';
import { useAuthStore } from '@/store/auth';
import { Plus, Trash2 } from 'lucide-react';

const recipientSchema = z.object({
  address: z.string().startsWith('G').min(56).max(56),
  amount: z.coerce.number().positive(),
  currency: z.string().min(1),
});

const schema = z.object({
  currency: z.string().min(1),
  totalAmount: z.coerce.number().positive(),
  recipients: z.array(recipientSchema).min(1),
});

type FormData = z.infer<typeof schema>;

export default function NewPayrollPage() {
  const router = useRouter();
  const employer = useAuthStore((s) => s.employer) ?? '';
  const [txHash, setTxHash] = useState('');
  const [apiError, setApiError] = useState('');

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema) as Resolver<FormData>,
    defaultValues: { currency: 'USDC', recipients: [{ address: '', amount: 0, currency: 'USDC' }] },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'recipients' });

  async function onSubmit(data: FormData) {
    setApiError('');
    try {
      const res = await api.createPayroll({ ...data, employer });
      setTxHash(res.txHash);
    } catch (e: unknown) {
      setApiError((e as { message?: string })?.message ?? 'Failed to create payroll');
    }
  }

  if (txHash) {
    return (
      <DashboardLayout title="Payroll Created">
        <div className="max-w-lg rounded-xl border bg-white p-8 shadow-sm">
          <h2 className="text-lg font-semibold text-green-700 mb-2">✓ Payroll submitted</h2>
          <p className="text-sm text-gray-600 mb-1">Transaction hash:</p>
          <p className="font-mono text-xs break-all text-indigo-600 mb-4">{txHash}</p>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/dashboard/payroll')}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
            >
              View all payrolls
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="New Payroll">
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
        <div className="rounded-xl border bg-white p-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-gray-800">Batch details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Currency</label>
              <input
                {...register('currency')}
                className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="USDC"
              />
              {errors.currency && <p className="mt-1 text-xs text-red-500">{errors.currency.message}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Total amount</label>
              <input
                {...register('totalAmount')}
                type="number"
                step="0.01"
                className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="5000.00"
              />
              {errors.totalAmount && <p className="mt-1 text-xs text-red-500">{errors.totalAmount.message}</p>}
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">Recipients</h2>
            <button
              type="button"
              onClick={() => append({ address: '', amount: 0, currency: 'USDC' })}
              className="flex items-center gap-1 text-sm text-indigo-600 hover:underline"
            >
              <Plus size={14} /> Add recipient
            </button>
          </div>

          {fields.map((field, i) => (
            <div key={field.id} className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-start">
              <div>
                <input
                  {...register(`recipients.${i}.address`)}
                  placeholder="GABC…XYZ (Stellar address)"
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.recipients?.[i]?.address && (
                  <p className="mt-1 text-xs text-red-500">{errors.recipients[i]?.address?.message}</p>
                )}
              </div>
              <div>
                <input
                  {...register(`recipients.${i}.amount`)}
                  type="number"
                  step="0.01"
                  placeholder="Amount"
                  className="w-28 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <input
                  {...register(`recipients.${i}.currency`)}
                  placeholder="USDC"
                  className="w-20 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button
                type="button"
                onClick={() => remove(i)}
                className="mt-1 text-red-400 hover:text-red-600"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        {apiError && <p className="text-sm text-red-500">{apiError}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting…' : 'Submit payroll'}
        </button>
      </form>
    </DashboardLayout>
  );
}
