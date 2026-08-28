<div align="center">

# Delite

### Agentic Remittance, Multi-Sig Treasury & Cross-Currency Invoicing on Stellar Soroban

Automate Global Payroll · Multi-Sig Treasury · Zero-Idle Sweeper · Cross-Currency Invoicing · Built on Stellar Testnet

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Delite%20App-6366f1?style=flat-square)](https://delite-x-web.vercel.app/)
[![Network](https://img.shields.io/badge/Network-Stellar%20Testnet-0ea5e9?style=flat-square)](https://stellar.org)
[![Soroban](https://img.shields.io/badge/Contracts-Soroban%20v22-8b5cf6?style=flat-square)](https://soroban.stellar.org)
[![Treasury](https://img.shields.io/badge/Treasury-M--of--N%20Multisig-22c55e?style=flat-square)](https://stellar.expert/explorer/testnet/contract/CDA53YJJ6KEL24EY5KVY34ELUWG7LRCTDTDMPLZMYEU3UBXZQKV7GM53)
[![Sweeper](https://img.shields.io/badge/Sweeper-Zero--Idle%20Vault-22c55e?style=flat-square)](https://stellar.expert/explorer/testnet/contract/CDNBSZFM6XFAW7T2JKAWX4MDCIMAHUPT4TH2QNBFOCGRTRQWEGHUBD64)
[![Invoicing](https://img.shields.io/badge/Invoicing-Path%20Payment-22c55e?style=flat-square)](https://stellar.expert/explorer/testnet/contract/CAJVSV3RWS76EFMGLSJOL2UV5SLPI55R5BLNTR4OQSEZMTGLA44SWC2B)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2016-black?style=flat-square)](https://nextjs.org)
[![CI](https://img.shields.io/badge/CI-Passing-22c55e?style=flat-square)](#)

</div>

---

## What's New

### 1. Atomic Cross-Currency Invoicing & Path Payment Checkout Engine
We have deployed an on-chain smart invoicing protocol on Soroban coupled with Stellar L1 path payments:
- **Instant Cross-Asset Settlement:** Invoices denominated in USDC can be settled by global payers using EURC, XLM, or USDC via automated DEX path routing with zero hidden FX spreads.
- **Verifiable On-Chain Status:** Invoices register directly on Soroban with deterministic states (`Unpaid`, `Paid`, `Cancelled`) and emit real-time settlement events.
- **1-Click Shareable Checkout Links:** Payers connect their wallet, inspect real-time interbank conversion rates, and settle in 3.5 seconds.
- **Live Testnet Contract:** [`CAJVSV3RWS76EFMGLSJOL2UV5SLPI55R5BLNTR4OQSEZMTGLA44SWC2B`](https://stellar.expert/explorer/testnet/contract/CAJVSV3RWS76EFMGLSJOL2UV5SLPI55R5BLNTR4OQSEZMTGLA44SWC2B)

### 2. Automated Liquidity Sweeper & Yield Engine (Zero-Idle Cash)
We have deployed an on-chain automated liquidity sweeping vault on Soroban:
- **Zero-Idle Compounding:** Idle funds earn automated compound yield (7.40% APY) inside a $c$-token share vault without manual staking.
- **Atomic "Sweep & Pay" Engine:** When bills, contractor payouts, or family remittances occur, the vault atomically burns the exact required shares, redeems funds, and pays the destination in a single transaction block.
- **Live Testnet Contract:** [`CDNBSZFM6XFAW7T2JKAWX4MDCIMAHUPT4TH2QNBFOCGRTRQWEGHUBD64`](https://stellar.expert/explorer/testnet/contract/CDNBSZFM6XFAW7T2JKAWX4MDCIMAHUPT4TH2QNBFOCGRTRQWEGHUBD64)

### 3. Corporate Multi-Sig Treasury & 1-Click Batch Payroll
We have deployed an on-chain corporate treasury governance and batch disbursement engine natively on Soroban:
- **M-of-N Cryptographic Consensus:** Organizations configure $N$ executive signer keys and require $M$ cryptographic approvals before treasury capital can be moved.
- **1-Click CSV Batch Payroll:** Upload a contractor spreadsheet (`Name, Stellar Address, Amount`) and execute up to 100 contractor disbursements in a single atomic transaction.
- **Zero External Gas Waste & Atomic Rollback:** If any single recipient address or transfer fails, the entire transaction reverts safely on-chain with zero lost funds.
- **Live Testnet Contract:** [`CDA53YJJ6KEL24EY5KVY34ELUWG7LRCTDTDMPLZMYEU3UBXZQKV7GM53`](https://stellar.expert/explorer/testnet/contract/CDA53YJJ6KEL24EY5KVY34ELUWG7LRCTDTDMPLZMYEU3UBXZQKV7GM53)

---

## Comprehensive Overview

Delite is a full-stack, non-custodial financial operating system and remittance router built natively for the Stellar and Soroban ecosystem. Delite automates cross-border income flows, multi-sig corporate treasuries, smart cross-currency invoicing, and decentralized savings streams, replacing slow banking rails with instant, cryptographic smart contracts.

### Core Protocol Stack & Features

1. **Atomic Cross-Currency Invoicing (`invoice_router`)**
   - **Multi-Asset DEX Path Routing**: Clients in Europe or across the globe pay invoices in EURC or XLM; merchants receive exact USDC settlement directly on-chain.
   - **Verifiable Receipt Registry**: On-chain invoice lifecycle management with automated receipt generation and transaction hashes.

2. **Automated Liquidity Sweeper & Yield Vault (`yield_sweeper`)**
   - **Zero-Idle Cash Compounding**: Continuous second-by-second yield compounding at 7.40% APY via Soroban share tokens.
   - **Atomic Sweep-on-Debit**: Unwinds exact required funds from the yield vault only at the exact millisecond a payment executes, eliminating manual un-staking friction.

3. **Corporate Multi-Sig Treasury & Batch Payroll (`treasury`)**
   - **M-of-N Cryptographic Consensus**: Define multiple executive keys requiring on-chain threshold approvals before releasing capital.
   - **1-Click CSV Payroll Processor**: Drag-and-drop contractor payroll spreadsheets with automated Stellar address validation and batch total calculation.
   - **Atomic Multi-Transfer Router**: Atomically disburses funds across all recipients in a single transaction loop with zero partial failure risk.

4. **Autonomous On-Chain Payment Splitting (`router`)**
   - **Declarative Income Matrix**: When incoming paychecks or invoices arrive, the router intercepts the funds and splits them deterministically.
   - **Multi-Bucket Allocation**: Automatically partitions incoming revenue into customizable buckets: Bills, Family Remittance, and Yield Vaults.
   - **Zero Custody**: All fund flows execute directly on-chain via user-authorized Soroban contracts.

5. **Decentralized Yield Vaults (`vault`)**
   - **Automated Yield Compounding**: Idle savings are routed to an ERC-4626 style Soroban vault for automated yield generation.
   - **Instant Liquidity**: Users deposit and withdraw funds on demand without locking penalties.

6. **Web3 Authentication & Profile Management**
   - **Multi-Wallet Support**: Seamless connection with Freighter, xBull, and Albedo wallets via `@creit.tech/stellar-wallets-kit`.
   - **Automatic Testnet Funding**: One-click Friendbot funding to get new users onboarded with 10,000 testnet XLM instantly.
   - **Real-Time Horizon & Soroban Sync**: Real-time balance and position tracking fetched directly from Stellar Horizon and Soroban RPC nodes.

---

## Smart Contract Deployments

All contracts are written in Rust with `soroban-sdk = "=22.0.0"`, compiled to `wasm32v1-none`, and deployed natively on the **Stellar Soroban Testnet**.

| Contract | Address | Explorer |
|----------|---------|---------|
| **Cross-Currency Invoice Router** | `CAJVSV3RWS76EFMGLSJOL2UV5SLPI55R5BLNTR4OQSEZMTGLA44SWC2B` | [View on StellarExpert](https://stellar.expert/explorer/testnet/contract/CAJVSV3RWS76EFMGLSJOL2UV5SLPI55R5BLNTR4OQSEZMTGLA44SWC2B) |
| **Liquidity Sweeper Vault** | `CDNBSZFM6XFAW7T2JKAWX4MDCIMAHUPT4TH2QNBFOCGRTRQWEGHUBD64` | [View on StellarExpert](https://stellar.expert/explorer/testnet/contract/CDNBSZFM6XFAW7T2JKAWX4MDCIMAHUPT4TH2QNBFOCGRTRQWEGHUBD64) |
| **Corporate Treasury Vault** | `CDA53YJJ6KEL24EY5KVY34ELUWG7LRCTDTDMPLZMYEU3UBXZQKV7GM53` | [View on StellarExpert](https://stellar.expert/explorer/testnet/contract/CDA53YJJ6KEL24EY5KVY34ELUWG7LRCTDTDMPLZMYEU3UBXZQKV7GM53) |
| **Payment Router** | `CBJQ5ABTAU37OHQGD4HHLNYECUTVPJXS4BUFNWBLM7IVHBH6EIQMSJJ2` | [View on StellarExpert](https://stellar.expert/explorer/testnet/contract/CBJQ5ABTAU37OHQGD4HHLNYECUTVPJXS4BUFNWBLM7IVHBH6EIQMSJJ2) |
| **Yield Vault** | `CAQFOWQLHE3BBOAGMJZNPCIASUOSJJCUQLJE6V6VSMW7H7ST4OOHD77C` | [View on StellarExpert](https://stellar.expert/explorer/testnet/contract/CAQFOWQLHE3BBOAGMJZNPCIASUOSJJCUQLJE6V6VSMW7H7ST4OOHD77C) |

---

## Detailed Project Structure

```
DeliteX/
├── .github/
│   └── workflows/
│       └── ci.yml                      # Automated CI/CD Pipeline
│
├── apps/
│   └── web/                            # Next.js 16 Web Application
│       ├── public/                     # Static assets, icons, and brand media
│       │   ├── Screenshots/            # Product walkthrough screenshots
│       │   └── images/                 # Transparent logo and vector assets
│       │
│       ├── src/
│       │   ├── app/                    # App Router Pages & API Routes
│       │   │   ├── app/                # Main Application Dashboard
│       │   │   ├── login/              # Authentication Portal
│       │   │   ├── demo/               # Interactive Sandbox Mode
│       │   │   ├── admin/              # Admin Analytics Portal
│       │   │   ├── layout.tsx          # Root Layout with Font Preconnects
│       │   │   ├── globals.css         # Dark Glassmorphic Theme & Design System
│       │   │   └── api/                # Backend API Handlers (Stellar, AI, Vault)
│       │   │
│       │   ├── components/             # React UI Component Library
│       │   │   ├── dashboard/          # Dashboard View Modules
│       │   │   │   ├── DashboardShell.tsx   # Glassmorphic Layout & Wallet Bar
│       │   │   │   ├── OverviewView.tsx     # Account Overview & Bucket Cards
│       │   │   │   ├── TreasuryView.tsx     # Multi-Sig Treasury & Batch Payroll UI
│       │   │   │   ├── InvoicingView.tsx    # Cross-Currency Smart Invoicing UI
│       │   │   │   ├── SavingsView.tsx      # Automated Liquidity Sweeper & Yield UI
│       │   │   │   ├── RulesEditor.tsx      # Natural Language Rule Configurator
│       │   │   │   ├── Sidebar.tsx          # Navigation Sidebar with Active Indicators
│       │   │   │   ├── IncomeView.tsx       # Incoming Payment Stream Tracker
│       │   │   │   ├── BillsView.tsx        # Automated Bills & Subscriptions
│       │   │   │   └── FamilyView.tsx       # Remittance & Beneficiary List
│       │   │   └── ui/                  # Shared Primitive UI Elements
│       │   │       └── ProceduralGroundBackground.tsx # WebGL Shader Background
│       │   │
│       │   ├── hooks/                  # Global State Hooks
│       │   │   └── DashboardContext.tsx # Supabase & Horizon Real-Time Context
│       │   │
│       │   └── lib/                    # Web3, Stellar SDK & Data Utilities
│       │       ├── stellar/            # Stellar & Soroban Client Libraries
│       │       │   ├── invoicing.ts    # Cross-currency path payment calculations
│       │       │   ├── sweeper.ts      # Liquidity sweeper compounding calculations
│       │       │   ├── treasury.ts     # Batch CSV parser & Multisig helpers
│       │       │   ├── accounts.ts     # Testnet account creation & funding
│       │       │   ├── contracts.ts    # Soroban Contract ABI interfaces
│       │       │   ├── payments.ts     # Horizon payment stream listeners
│       │       │   └── vault.ts        # Yield Vault deposit/withdraw SDK
│       │       └── supabase/           # Supabase client authentication
│       │
│       └── package.json                # Web App Dependencies (Next 16, Stellar SDK)
│
├── contracts/                          # Soroban Smart Contracts (Rust Workspace)
│   ├── invoice_router/                 # Cross-Currency Smart Invoicing Contract
│   │   └── src/lib.rs                  # Invoice registry & deterministic settlement
│   ├── yield_sweeper/                  # Automated Liquidity Sweeper & Yield Engine
│   │   └── src/lib.rs                  # Share-based accounting & atomic sweep-and-pay
│   ├── treasury/                       # Multi-Sig Corporate Treasury & Batch Payroll
│   │   └── src/lib.rs                  # M-of-N threshold consensus & atomic payouts
│   ├── router/                         # Autonomous Payment Splitting Contract
│   │   └── src/lib.rs                  # Atomic cross-contract payment routing
│   ├── vault/                          # Yield-Generation Vault Contract
│   │   └── src/lib.rs                  # ERC-4626 style deposit, withdraw & balances
│   ├── scripts/                        # Deployment & Initialization Scripts
│   │   ├── deploy-invoice.js           # Deploys Invoice Router contract to Testnet
│   │   ├── deploy-sweeper.js           # Deploys Yield Sweeper contract to Testnet
│   │   ├── deploy-treasury.js          # Deploys Treasury contract to Testnet
│   │   ├── deploy.js                   # Deploys Router & Vault contracts
│   │   ├── init.js                     # Initializes Router contract parameters
│   │   └── init-vault.js               # Initializes Vault contract parameters
│   └── Cargo.toml                      # Cargo Workspace Manifest
│
├── packages/
│   ├── ui/                             # Shared Monorepo UI Components
│   ├── config-eslint/                  # Strict Monorepo ESLint Configuration
│   └── config-typescript/              # Shared TypeScript Configuration
│
├── supabase/
│   └── migrations/                     # PostgreSQL Schema & RLS Policies
│
├── docs/                               # Architecture & Production Specs
│   ├── production_features_spec.md     # Production Features Technical Specification
│   └── blockchain_mapping.md           # On-Chain State & ABI Mapping
│
├── turbo.json                          # Turborepo Build Pipeline Config
├── package.json                        # Root Monorepo Scripts
└── README.md                           # Protocol Documentation
```

---

## Environment Variables

| Variable                       | Required | Default | Description                                                |
| ------------------------------ | -------- | ------- | ---------------------------------------------------------- |
| `NEXT_PUBLIC_SOROBAN_INVOICE`  | Yes      | `""`    | Deployed Invoice Router contract ID on Stellar Testnet     |
| `NEXT_PUBLIC_SOROBAN_SWEEPER`  | Yes      | `""`    | Deployed Sweeper Vault contract ID on Stellar Testnet      |
| `NEXT_PUBLIC_SOROBAN_TREASURY` | Yes      | `""`    | Deployed Treasury contract ID on Stellar Testnet           |
| `NEXT_PUBLIC_SOROBAN_ROUTER`   | Yes      | `""`    | Deployed Router contract ID on Stellar Testnet             |
| `NEXT_PUBLIC_SOROBAN_VAULT`    | Yes      | `""`    | Deployed Vault contract ID on Stellar Testnet              |

---

## Live Deployment

| Resource | Details |
|----------|---------|
| **Live Application** | [https://delite-x-web.vercel.app/](https://delite-x-web.vercel.app/) |
| **GitHub Repository** | [https://github.com/whoami-hritik/DeliteX](https://github.com/whoami-hritik/DeliteX) |
| **Network** | Stellar Testnet |
| **Soroban RPC** | `https://soroban-testnet.stellar.org` |
| **Horizon API** | `https://horizon-testnet.stellar.org` |
| **Supported Wallets** | [Freighter](https://www.freighter.app/), [xBull](https://xbull.app/), [Albedo](https://albedo.link/) |

---

## Screenshots

### Landing Page
![Landing Page](apps/web/public/Screenshots/Landing%20Page.png)
> Delite's entry point — glassmorphic hero with WebGL procedural background, wallet connect, and live feature overview.

---

### Dashboard Overview
![Dashboard](apps/web/public/Screenshots/Dashbaord.png)
> Financial OS overview tracking available reserves, smart buckets (Bills, Remittance, Savings), and recent transactions.

---

### AI Allocation Rule Editor
![Agentic AI](apps/web/public/Screenshots/Agentic%20Ai.png)
> Interactive rule configurator for converting plain-text financial goals into on-chain Soroban routing matrices.

---

### Family & Remittance Management
![Family & Remittance](apps/web/public/Screenshots/Family%20&%20Remitance.png)
> Manage global beneficiaries and verify automated cross-border settlements in real time.

---

### Deployed Vault Contract
![Deployed Vault Contract](apps/web/public/Screenshots/Deployed%20Vault%20Contract.png)
> Verified yield vault contract on Stellar Testnet showing on-chain storage and WASM execution metrics.

---

### Vault Deposit Transaction
![Vault Transaction](apps/web/public/Screenshots/Vault%20Transaction.png)
> On-chain confirmation of automated fund routing into the Soroban Yield Vault.

---

### Real-World Transaction Proof
![Transaction Proof](apps/web/public/Screenshots/Transaction%20Proof.png)
> Real-time ledger confirmation of payment interception and automated splitting.

---

### CI/CD Pipeline
![CI CD Pipeline](apps/web/public/Screenshots/CI%20CD%20Pipeline.png)
> Turborepo automated build and type-checking pipelines ensuring zero regression.

---

## System Architecture

```text
┌─────────────────────────────────────────────────────────────────────┐
│                       USER / ENTERPRISE ADMIN                       │
└─────────────────────────────────────────────────────────────────────┘
        │                                             │
        │ Declarative Intent / Invoices / Payroll     │ M-of-N Signature
        ▼                                             ▼
┌──────────────────────────────────────────────────────────────────────┐
│                    Delite Next.js Frontend OS                        │
│         /app  ·  /invoices  ·  /treasury  ·  /savings                │
└──────────────────────────────┬───────────────────────────────────────┘
                               │
              ┌────────────────┴─────────────────┐
              │                                  │
              ▼                                  ▼
 ┌─────────────────────────┐     ┌─────────────────────────────────────┐
 │   Stellar Wallet        │     │       Supabase Database             │
 │   (Freighter / xBull)   │     │  user_rules  transactions  profiles │
 │                         │────▶│                                     │
 │   Signs Soroban XDR     │     └─────────────────────────────────────┘
 └────────────┬────────────┘
              │
              ▼
 ┌────────────────────────────────────────────────────────────────────┐
 │                  Stellar Horizon & Soroban RPC                     │
 └────────────────────────────┬───────────────────────────────────────┘
                              │
     ┌────────────────────────┼────────────────────────┬────────────────────────┬────────────────────────┐
     ▼                        ▼                        ▼                        ▼                        ▼
┌───────────────┐     ┌───────────────┐        ┌───────────────┐        ┌───────────────┐        ┌───────────────┐
│Invoice Router │     │ Yield Sweeper │        │Treasury Vault │        │Payment Router │        │  Yield Vault  │
│(Cross-Currency│     │ (Zero-Idle    │        │(M-of-N Multi  │        │(Autonomous    │        │  (ERC-4626    │
│ Path Payments)│     │  Auto-Yield)  │        │ Batch Payroll)│        │ Fund Splits)  │        │   Compounding)│
└───────────────┘     └───────────────┘        └───────────────┘        └───────────────┘        └───────────────┘
```

---

## Local Setup & Development

### Prerequisites

- Node.js 18+ with `pnpm`
- Rust with target `wasm32-unknown-unknown` / `wasm32v1-none`
- `stellar-cli` (v27.0+)
- [Freighter Wallet](https://www.freighter.app/) set to **Testnet**

### Quick Start

```bash
# Clone the repository
git clone https://github.com/whoami-hritik/DeliteX.git
cd DeliteX

# Install monorepo dependencies
pnpm install

# Configure environment
cp apps/web/.env.example apps/web/.env.local

# Run frontend development server
pnpm run dev
```

### Contract Build & Test Commands

```bash
# Build all Soroban smart contracts
cargo build --manifest-path contracts/Cargo.toml --target wasm32-unknown-unknown --release

# Build specific contract using Stellar CLI
stellar contract build --manifest-path contracts/invoice_router/Cargo.toml

# Run smart contract unit tests
cargo test --manifest-path contracts/Cargo.toml
```

---

## Security & Non-Custodial Architecture

- **Client-Side Key Management**: Delite never stores or transmits private keys. All cryptographic signing happens locally inside the user's browser extension via `@creit.tech/stellar-wallets-kit`.
- **Soroban `require_auth`**: Every state-changing function across Invoices, Sweeper, Treasury, Router, and Vault enforces cryptographic caller authentication.
- **Zero-Spread DEX Routing**: Cross-currency invoicing executes directly via Stellar L1 orderbooks, preventing middleman FX gouging.
- **Zero-Idle Capital Efficiency**: 100% of liquid assets remain compounding inside the Soroban Vault and are unwound atomically at the millisecond of payment execution.
- **M-of-N Multisig Guarantees**: Corporate disbursements cannot execute without satisfying the on-chain threshold of authorized owner signatures.
- **Atomic Rollbacks**: Operations revert completely if any single recipient transfer encounters an error, preventing partial disbursements or trapped capital.

---

## License & Disclaimer

Testnet experimental build. Built for the Stellar & Soroban ecosystem. Open source under the MIT License.
