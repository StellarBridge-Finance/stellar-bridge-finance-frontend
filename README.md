# StellarBridge Finance — Frontend

Employer dashboard for the StellarBridge cross-border payroll network. Built on Next.js 14 with the App Router. All blockchain interaction goes through the [backend API](https://github.com/your-org/stellar-bridge-backend) — this app never calls Soroban contracts directly.

---

## How the 3 repos connect

```
stellar-bridge-finance-contract   ← Soroban contracts (Rust)
         ↕  contract IDs + on-chain state
stellar-bridge-backend            ← NestJS REST API
         ↕  REST / WebSocket
stellar-bridge-finance-frontend   ← this repo
```

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Forms | react-hook-form + zod |
| State | Zustand (persisted auth) |
| Icons | lucide-react |
| HTTP | native `fetch` |

---

## Getting started

### Prerequisites

- Node.js 18+
- The backend running at `http://localhost:3000` (or set `NEXT_PUBLIC_API_URL`)

### Install & run

```bash
npm install
npm run dev
```

Open [http://localhost:3001](http://localhost:3001).

### Environment

Create `.env.local` (already included in the repo):

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

For production, point this at your deployed backend.

---

## Project structure

```
src/
├── app/
│   ├── login/                  # Sign-in page
│   ├── register/               # Employer registration
│   └── dashboard/
│       ├── page.tsx            # Overview — stats + quick actions
│       ├── payroll/
│       │   ├── page.tsx        # Payroll batch list
│       │   ├── new/page.tsx    # Create payroll batch
│       │   └── [id]/page.tsx   # Batch detail + approve/execute + status polling
│       ├── compliance/
│       │   └── page.tsx        # KYC lookup + whitelist / revoke
│       └── escrow/
│           └── page.tsx        # Lock funds + release / refund
│
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx         # Nav sidebar
│   │   ├── Header.tsx          # Page header
│   │   └── DashboardLayout.tsx # Wraps all dashboard pages
│   └── ui/
│       ├── StatusBadge.tsx     # Color-coded status pill
│       ├── AmountDisplay.tsx   # Stroops → human-readable amount
│       └── TxHashLink.tsx      # Truncated hash → stellar.expert link
│
├── services/
│   └── api.ts                  # Typed fetch client for all backend endpoints
│
├── store/
│   └── auth.ts                 # Zustand auth store (persisted to localStorage)
│
└── types/
    └── index.ts                # Shared TypeScript types (Payroll, Escrow, Compliance…)
```

---

## Pages & features

### Auth
- `/login` — email + password sign-in
- `/register` — company name, email, Stellar address, password

### Dashboard `/dashboard`
- Stats cards: total payrolls, executed, whitelisted addresses, active escrows
- Quick-action links to create payroll, check KYC, lock funds

### Payroll `/dashboard/payroll`
| Route | What it does |
|---|---|
| `/payroll` | List batches; look up any batch by on-chain ID |
| `/payroll/new` | Build a batch — dynamic recipient rows (address, amount, currency) |
| `/payroll/[id]` | View batch detail; Approve → Execute flow; live status polling every 3 s |

Payroll lifecycle: `Pending → Approved → Executed | Cancelled`

### Compliance `/dashboard/compliance`
- Look up any Stellar address for KYC status
- Whitelist or revoke an address (admin)
- Status values: `Whitelisted | Revoked | Pending`

### Escrow `/dashboard/escrow`
- Lock employer funds before a payroll run
- Look up an escrow by ID
- Release funds to beneficiary or refund to depositor

---

## API reference

All calls go to `NEXT_PUBLIC_API_URL`. The client is in `src/services/api.ts`.

```ts
api.createPayroll(dto)           // POST /payroll
api.approvePayroll(id)           // POST /payroll/:id/approve
api.executePayroll(id)           // POST /payroll/:id/execute
api.getPayroll(id)               // GET  /payroll/:id

api.checkKyc(address)            // GET  /compliance/:address
api.whitelistAddress(address)    // POST /compliance/:address/whitelist
api.revokeAddress(address)       // DELETE /compliance/:address/whitelist

api.createEscrow(dto)            // POST /escrow
api.releaseEscrow(id, depositor) // POST /escrow/:id/release
api.refundEscrow(id, depositor)  // POST /escrow/:id/refund
api.getEscrow(id)                // GET  /escrow/:id
```

Amounts from the API are in **stroops** (1 XLM = 10,000,000 stroops). `AmountDisplay` handles the conversion automatically.

---

## Scripts

```bash
npm run dev      # Start dev server (port 3000 by default)
npm run build    # Production build
npm run start    # Serve production build
npm run lint     # ESLint
```

---

## What's built (40%)

- [x] Project scaffold — Next.js 14, TypeScript, Tailwind, App Router
- [x] Typed API client + shared types
- [x] Auth pages (login, register) with Zustand persistence
- [x] Dashboard layout (sidebar, header)
- [x] Dashboard overview page
- [x] Payroll — list, create, detail + polling
- [x] Compliance — KYC check, whitelist, revoke
- [x] Escrow — create, release, refund
- [x] Reusable UI: StatusBadge, AmountDisplay, TxHashLink

## Remaining (60%)

- [ ] JWT auth — protected routes, token headers, refresh
- [ ] FX quote — `GET /fx/quote?from=USD&to=NGN&amount=1000`
- [ ] Wallet — balance view, create wallet
- [ ] CSV payroll upload — `POST /payroll/upload` multipart
- [ ] WebSocket — real-time payroll status push
- [ ] Salary streaming — per-second drip UI
- [ ] Anchor off-ramp — fiat withdrawal flow
