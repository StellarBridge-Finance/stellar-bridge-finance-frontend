'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { TxHashLink } from '@/components/ui/TxHashLink';
import { api } from '@/services/api';
import type { ComplianceResult } from '@/types';
import { Search, ShieldCheck, ShieldOff } from 'lucide-react';

export default function CompliancePage() {
  const [address, setAddress] = useState('');
  const [result, setResult] = useState<ComplianceResult | null>(null);
  const [checking, setChecking] = useState(false);
  const [checkError, setCheckError] = useState('');
  const [actionTx, setActionTx] = useState('');
  const [actionError, setActionError] = useState('');

  async function checkKyc() {
    if (!address.trim()) return;
    setChecking(true);
    setCheckError('');
    setResult(null);
    setActionTx('');
    try {
      const r = await api.checkKyc(address.trim());
      setResult(r);
    } catch (e: unknown) {
      setCheckError((e as { message?: string })?.message ?? 'Lookup failed');
    } finally {
      setChecking(false);
    }
  }

  async function handleWhitelist() {
    setActionError('');
    setActionTx('');
    try {
      const res = await api.whitelistAddress(address.trim());
      setActionTx(res.txHash);
      await checkKyc();
    } catch (e: unknown) {
      setActionError((e as { message?: string })?.message ?? 'Failed');
    }
  }

  async function handleRevoke() {
    setActionError('');
    setActionTx('');
    try {
      const res = await api.revokeAddress(address.trim());
      setActionTx(res.txHash);
      await checkKyc();
    } catch (e: unknown) {
      setActionError((e as { message?: string })?.message ?? 'Failed');
    }
  }

  return (
    <DashboardLayout title="Compliance">
      <div className="max-w-xl space-y-4">
        {/* KYC lookup */}
        <div className="rounded-xl border bg-white p-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-gray-800">KYC Check</h2>
          <div className="flex gap-2">
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Stellar address (G…)"
              className="flex-1 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={checkKyc}
              disabled={checking || !address.trim()}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              <Search size={14} />
              {checking ? 'Checking…' : 'Check'}
            </button>
          </div>
          {checkError && <p className="text-xs text-red-500">{checkError}</p>}

          {result && (
            <div className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-mono text-xs text-gray-600 truncate">{result.address}</p>
                <StatusBadge status={result.status} />
              </div>
              <p className="text-sm text-gray-600">
                Allowed:{' '}
                <span className={result.allowed ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                  {result.allowed ? 'Yes' : 'No'}
                </span>
              </p>

              {/* Admin actions */}
              <div className="flex gap-2 pt-1">
                {result.status !== 'Whitelisted' && (
                  <button
                    onClick={handleWhitelist}
                    className="flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs text-white hover:bg-green-700"
                  >
                    <ShieldCheck size={12} /> Whitelist
                  </button>
                )}
                {result.status === 'Whitelisted' && (
                  <button
                    onClick={handleRevoke}
                    className="flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs text-white hover:bg-red-700"
                  >
                    <ShieldOff size={12} /> Revoke
                  </button>
                )}
              </div>
            </div>
          )}

          {actionTx && (
            <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-2 text-sm">
              <span className="text-green-700 font-medium">Tx: </span>
              <TxHashLink hash={actionTx} />
            </div>
          )}
          {actionError && <p className="text-xs text-red-500">{actionError}</p>}
        </div>

        {/* Info box */}
        <div className="rounded-xl border bg-blue-50 p-4 text-sm text-blue-700">
          <p className="font-medium mb-1">How compliance works</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>All payroll recipients must be <strong>Whitelisted</strong> before execution.</li>
            <li>Executing a payroll with non-whitelisted addresses returns a 400 error.</li>
            <li>Revoking an address blocks future payroll executions for that address.</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}
