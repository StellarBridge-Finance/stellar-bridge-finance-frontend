import type {
  CreatePayrollDto,
  Payroll,
  TxResponse,
  ComplianceResult,
  CreateEscrowDto,
  Escrow,
} from '@/types';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  const data = await res.json();
  if (!res.ok) throw data;
  return data as T;
}

const get = <T>(path: string) => request<T>(path);
const post = <T>(path: string, body?: unknown) =>
  request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined });

export const api = {
  // ── Payroll ────────────────────────────────────────────────────────────────
  createPayroll: (dto: CreatePayrollDto) => post<TxResponse>('/payroll', dto),
  approvePayroll: (id: number) => post<TxResponse>(`/payroll/${id}/approve`),
  executePayroll: (id: number) => post<TxResponse>(`/payroll/${id}/execute`),
  getPayroll: (id: number) => get<Payroll>(`/payroll/${id}`),

  // ── Compliance ─────────────────────────────────────────────────────────────
  checkKyc: (address: string) => get<ComplianceResult>(`/compliance/${address}`),
  whitelistAddress: (address: string) =>
    post<TxResponse>(`/compliance/${address}/whitelist`),
  revokeAddress: (address: string) =>
    request<TxResponse>(`/compliance/${address}/whitelist`, { method: 'DELETE' }),

  // ── Escrow ─────────────────────────────────────────────────────────────────
  createEscrow: (dto: CreateEscrowDto) => post<TxResponse>('/escrow', dto),
  releaseEscrow: (id: number, depositor: string) =>
    post<TxResponse>(`/escrow/${id}/release?depositor=${depositor}`),
  refundEscrow: (id: number, depositor: string) =>
    post<TxResponse>(`/escrow/${id}/refund?depositor=${depositor}`),
  getEscrow: (id: number) => get<Escrow>(`/escrow/${id}`),
};

/** Poll payroll until terminal status */
export async function pollPayroll(
  id: number,
  intervalMs = 3000,
  onTick?: (p: Payroll) => void
): Promise<Payroll> {
  while (true) {
    const data = await api.getPayroll(id);
    onTick?.(data);
    if (data.status === 'Executed' || data.status === 'Cancelled') return data;
    await new Promise((r) => setTimeout(r, intervalMs));
  }
}
