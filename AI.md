Ai2.md — StellarBridge Finance Backend API
Generated: 2026-05-02
Scope: 30% scaffold — Payroll, Escrow, Compliance REST API
For: stellar-bridge-finance-frontend repo

How the 3 Repos Connect
stellar-bridge-finance-contract   (Soroban contracts — Rust)
        ↕  contract IDs + on-chain state
stellar-bridge-backend            (this repo — NestJS REST API)
        ↕  REST/WebSocket
stellar-bridge-finance-frontend   (employer dashboard — your repo)
The frontend never calls Soroban contracts directly.
All blockchain interaction goes through this backend.

Base URL
http://localhost:3000/api/v1          # local dev
https://api.stellarbridge.finance/api/v1  # production (TBD)
All responses are JSON. All mutation endpoints expect Content-Type: application/json.

Payroll Endpoints
POST /payroll — Submit a payroll batch
Request body:

{
  "employer": "GABC...XYZ",
  "currency": "USDC",
  "totalAmount": 5000.00,
  "recipients": [
    { "address": "GDEF...123", "amount": 2500.00, "currency": "USDC" },
    { "address": "GHIJ...456", "amount": 2500.00, "currency": "NGN" }
  ]
}
Response 201:

{ "txHash": "abc123..." }
txHash is the Stellar transaction hash of the create_payroll contract call.
Store it — you'll need the on-chain payroll ID to poll status.

POST /payroll/:id/approve — Approve a payroll batch
:id = on-chain payroll ID (returned from get_status or stored after creation).

Response 201:

{ "txHash": "def456..." }
POST /payroll/:id/execute — Execute (pay out) a payroll batch
Triggers compliance check on all recipients, then calls execute_payroll on-chain.
Will fail with 400 if any recipient is not KYC-whitelisted.

Response 201:

{ "txHash": "ghi789..." }
GET /payroll/:id — Get payroll status
Response 200:

{
  "id": 1,
  "employer": "GABC...XYZ",
  "totalAmount": "50000000000",
  "currency": "USDC",
  "recipients": [...],
  "status": "Approved"
}
status values: Pending → Approved → Executed | Cancelled

Polling pattern (frontend):

async function pollPayroll(id: number, intervalMs = 3000): Promise<PayrollStatus> {
  while (true) {
    const res = await fetch(`/api/v1/payroll/${id}`);
    const data = await res.json();
    if (data.status === 'Executed' || data.status === 'Cancelled') return data;
    await new Promise(r => setTimeout(r, intervalMs));
  }
}
Compliance Endpoints
GET /compliance/:address — Check KYC status
:address = Stellar public key (G...)

Response 200:

{
  "address": "GABC...XYZ",
  "allowed": true,
  "status": "Whitelisted"
}
status values: Whitelisted | Revoked | Pending

POST /compliance/:address/whitelist — Whitelist an address (admin)
Response 201:

{ "txHash": "jkl012..." }
DELETE /compliance/:address/whitelist — Revoke an address (admin)
Response 200:

{ "txHash": "mno345..." }
Escrow Endpoints
POST /escrow — Lock employer funds
Request body:

{
  "depositor": "GABC...XYZ",
  "beneficiary": "GDEF...123",
  "amount": 5000.00,
  "currency": "USDC"
}
Response 201:

{ "txHash": "pqr678..." }
POST /escrow/:id/release?depositor=G... — Release funds to beneficiary
Response 201:

{ "txHash": "stu901..." }
POST /escrow/:id/refund?depositor=G... — Refund funds to depositor
Response 201:

{ "txHash": "vwx234..." }
GET /escrow/:id — Get escrow state
Response 200:

{
  "id": 1,
  "depositor": "GABC...XYZ",
  "beneficiary": "GDEF...123",
  "amount": "50000000000",
  "currency": "USDC",
  "released": false
}
Amounts are in stroops (1 XLM = 10,000,000 stroops). Divide by 1e7 to display.

Error Responses
All errors follow this shape:

{
  "statusCode": 400,
  "message": "One or more recipients failed compliance",
  "error": "Bad Request"
}
Code	Meaning
400	Validation error or compliance block
404	Resource not found
500	Stellar/Soroban transaction failed
Suggested Frontend Service (TypeScript)
// services/api.ts
const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';

async function post<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw await res.json();
  return res.json();
}

export const api = {
  // Payroll
  createPayroll: (dto: CreatePayrollDto) => post('/payroll', dto),
  approvePayroll: (id: number) => post(`/payroll/${id}/approve`),
  executePayroll: (id: number) => post(`/payroll/${id}/execute`),
  getPayroll: (id: number) => get(`/payroll/${id}`),

  // Compliance
  checkKyc: (address: string) => get(`/compliance/${address}`),
  whitelistAddress: (address: string) => post(`/compliance/${address}/whitelist`),
  revokeAddress: (address: string) =>
    fetch(`${BASE}/compliance/${address}/whitelist`, { method: 'DELETE' }).then(r => r.json()),

  // Escrow
  createEscrow: (dto: CreateEscrowDto) => post('/escrow', dto),
  releaseEscrow: (id: number, depositor: string) =>
    post(`/escrow/${id}/release?depositor=${depositor}`),
  refundEscrow: (id: number, depositor: string) =>
    post(`/escrow/${id}/refund?depositor=${depositor}`),
  getEscrow: (id: number) => get(`/escrow/${id}`),
};
Typical Employer Payroll Flow
1. POST /escrow          → lock funds (get escrow ID)
2. POST /payroll         → create batch on-chain (get payroll ID)
3. GET  /compliance/:addr → verify each recipient is KYC-passed
4. POST /payroll/:id/approve
5. POST /payroll/:id/execute   ← backend checks compliance + calls contract
6. Poll GET /payroll/:id until status === "Executed"
7. POST /escrow/:id/release    → release locked funds
Environment Variable (frontend)
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
What's Left (70% — not yet built)
Feature	Notes
Auth / JWT	Employer login, protected routes
FX Service	GET /fx/quote?from=USD&to=NGN&amount=1000
Wallet Service	GET /wallet/:address/balance, create wallet
CSV payroll upload	POST /payroll/upload multipart
WebSocket events	Real-time payroll status push
Salary streaming	Per-second drip via streaming contract
Anchor off-ramp	Fiat withdrawal hooks