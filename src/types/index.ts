// ─── Payroll ────────────────────────────────────────────────────────────────

export type PayrollStatus = 'Pending' | 'Approved' | 'Executed' | 'Cancelled';

export interface Recipient {
  address: string;
  amount: number;
  currency: string;
}

export interface CreatePayrollDto {
  employer: string;
  currency: string;
  totalAmount: number;
  recipients: Recipient[];
}

export interface Payroll {
  id: number;
  employer: string;
  totalAmount: string; // stroops
  currency: string;
  recipients: Recipient[];
  status: PayrollStatus;
}

// ─── Compliance ──────────────────────────────────────────────────────────────

export type KycStatus = 'Whitelisted' | 'Revoked' | 'Pending';

export interface ComplianceResult {
  address: string;
  allowed: boolean;
  status: KycStatus;
}

// ─── Escrow ──────────────────────────────────────────────────────────────────

export interface CreateEscrowDto {
  depositor: string;
  beneficiary: string;
  amount: number;
  currency: string;
}

export interface Escrow {
  id: number;
  depositor: string;
  beneficiary: string;
  amount: string; // stroops
  currency: string;
  released: boolean;
}

// ─── Shared ──────────────────────────────────────────────────────────────────

export interface TxResponse {
  txHash: string;
}

export interface ApiError {
  statusCode: number;
  message: string;
  error: string;
}
