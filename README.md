<div align="center">

# Delite

### Agentic Remittance, Multi-Sig Treasury & Instant Working Capital on Stellar Soroban

Automate Global Payroll · Multi-Sig Treasury · Zero-Idle Sweeper · Cross-Currency Invoicing · Instant Factoring · Built on Stellar Testnet

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Delite%20App-6366f1?style=flat-square)](https://delite-x-web.vercel.app/)
[![Network](https://img.shields.io/badge/Network-Stellar%20Testnet-0ea5e9?style=flat-square)](https://stellar.org)
[![Soroban](https://img.shields.io/badge/Contracts-Soroban%20v22-8b5cf6?style=flat-square)](https://soroban.stellar.org)
[![Factoring](https://img.shields.io/badge/Factoring-Working%20Capital%20Advance-22c55e?style=flat-square)](https://stellar.expert/explorer/testnet/contract/CAEOVGNP6CDDJHZDXHWTZFTOP2MEPXZZDHTQNSAVJGE6GIO6QUKP6INW)
[![Invoicing](https://img.shields.io/badge/Invoicing-Path%20Payment-22c55e?style=flat-square)](https://stellar.expert/explorer/testnet/contract/CAJVSV3RWS76EFMGLSJOL2UV5SLPI55R5BLNTR4OQSEZMTGLA44SWC2B)
[![Treasury](https://img.shields.io/badge/Treasury-M--of--N%20Multisig-22c55e?style=flat-square)](https://stellar.expert/explorer/testnet/contract/CDA53YJJ6KEL24EY5KVY34ELUWG7LRCTDTDMPLZMYEU3UBXZQKV7GM53)
[![Sweeper](https://img.shields.io/badge/Sweeper-Zero--Idle%20Vault-22c55e?style=flat-square)](https://stellar.expert/explorer/testnet/contract/CDNBSZFM6XFAW7T2JKAWX4MDCIMAHUPT4TH2QNBFOCGRTRQWEGHUBD64)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2016-black?style=flat-square)](https://nextjs.org)
[![CI](https://img.shields.io/badge/CI-Passing-22c55e?style=flat-square)](#)

</div>

---

## What's New

### 1. Instant Invoice Factoring & Working Capital Liquidity Pool
We have deployed an on-chain working capital financing pool on Soroban:
- **80% Instant Cash Advances:** Agencies and freelancers lock verified Net-30/60 unpaid invoices and receive 80% liquid USDC in their wallet in under 5 seconds.
- **Automated Self-Repaying Settlement:** When the debtor settles the invoice via `InvoiceRouter`, the smart contract intercepts the payment, repays the pool principal + 1.5% discount fee, and forwards the 20% remainder to the merchant.
- **LP Liquidity Yield (14.2% APY):** Liquidity providers stake USDC into the factoring pool to earn continuous factoring discount yields.
- **Live Testnet Contract:** [`CAEOVGNP6CDDJHZDXHWTZFTOP2MEPXZZDHTQNSAVJGE6GIO6QUKP6INW`](https://stellar.expert/explorer/testnet/contract/CAEOVGNP6CDDJHZDXHWTZFTOP2MEPXZZDHTQNSAVJGE6GIO6QUKP6INW)

### 2. Atomic Cross-Currency Invoicing & Path Payment Checkout
- **Instant Cross-Asset Settlement:** Invoices denominated in USDC can be settled by global payers using EURC, XLM, or USDC via automated DEX path routing with zero hidden FX spreads.
- **Live Testnet Contract:** [`CAJVSV3RWS76EFMGLSJOL2UV5SLPI55R5BLNTR4OQSEZMTGLA44SWC2B`](https://stellar.expert/explorer/testnet/contract/CAJVSV3RWS76EFMGLSJOL2UV5SLPI55R5BLNTR4OQSEZMTGLA44SWC2B)

### 3. Automated Liquidity Sweeper & Yield Engine (Zero-Idle Cash)
- **Zero-Idle Compounding:** Idle funds earn automated compound yield (7.40% APY) inside a $c$-token share vault with atomic `sweep_and_pay()` execution for bills and remittances.
- **Live Testnet Contract:** [`CDNBSZFM6XFAW7T2JKAWX4MDCIMAHUPT4TH2QNBFOCGRTRQWEGHUBD64`](https://stellar.expert/explorer/testnet/contract/CDNBSZFM6XFAW7T2JKAWX4MDCIMAHUPT4TH2QNBFOCGRTRQWEGHUBD64)

### 4. Corporate Multi-Sig Treasury & 1-Click Batch Payroll
- **M-of-N Cryptographic Consensus:** Organizations configure $N$ executive signer keys and require $M$ approvals to disburse payroll across up to 100 contractors in a single atomic transaction block.
- **Live Testnet Contract:** [`CDA53YJJ6KEL24EY5KVY34ELUWG7LRCTDTDMPLZMYEU3UBXZQKV7GM53`](https://stellar.expert/explorer/testnet/contract/CDA53YJJ6KEL24EY5KVY34ELUWG7LRCTDTDMPLZMYEU3UBXZQKV7GM53)

---

## Comprehensive Overview

Delite is a full-stack, non-custodial financial operating system and remittance router built natively for the Stellar and Soroban ecosystem. Delite automates cross-border income flows, multi-sig corporate treasuries, instant working capital factoring, and decentralized savings streams, replacing slow banking rails with instant, cryptographic smart contracts.

### Core Protocol Stack & Features

1. **Instant Invoice Factoring & Working Capital (`invoice_factoring`)**
   - **80% LTV Instant Cash Advances**: Receive instant working capital on Net-30 invoices without traditional bank credit checks or personal guarantees.
   - **Self-Repaying On-Chain Escrow**: Automatically repays advances and remits residual funds on client settlement.

2. **Atomic Cross-Currency Invoicing (`invoice_router`)**
   - **Multi-Asset DEX Path Routing**: Clients in Europe or across the globe pay invoices in EURC or XLM; merchants receive exact USDC settlement directly on-chain.
   - **Verifiable Receipt Registry**: On-chain invoice lifecycle management with automated receipt generation and transaction hashes.

3. **Automated Liquidity Sweeper & Yield Vault (`yield_sweeper`)**
   - **Zero-Idle Cash Compounding**: Continuous second-by-second yield compounding at 7.40% APY via Soroban share tokens.
   - **Atomic Sweep-on-Debit**: Unwinds exact required funds from the yield vault only at the exact millisecond a payment executes, eliminating manual un-staking friction.

4. **Corporate Multi-Sig Treasury & Batch Payroll (`treasury`)**
   - **M-of-N Cryptographic Consensus**: Define multiple executive keys requiring on-chain threshold approvals before releasing capital.
   - **1-Click CSV Payroll Processor**: Drag-and-drop contractor payroll spreadsheets with automated Stellar address validation and batch total calculation.

5. **Autonomous On-Chain Payment Splitting (`router`)**
   - **Declarative Income Matrix**: When incoming paychecks or invoices arrive, the router intercepts the funds and splits them deterministically.
   - **Multi-Bucket Allocation**: Automatically partitions incoming revenue into customizable buckets: Bills, Family Remittance, and Yield Vaults.

---

## Smart Contract Deployments

All contracts are written in Rust with `soroban-sdk = "=22.0.0"`, compiled to `wasm32v1-none`, and deployed natively on the **Stellar Soroban Testnet**.

| Contract | Address | Explorer |
|----------|---------|---------|
| **Invoice Factoring Pool** | `CAEOVGNP6CDDJHZDXHWTZFTOP2MEPXZZDHTQNSAVJGE6GIO6QUKP6INW` | [View on StellarExpert](https://stellar.expert/explorer/testnet/contract/CAEOVGNP6CDDJHZDXHWTZFTOP2MEPXZZDHTQNSAVJGE6GIO6QUKP6INW) |
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
│       │   │   │   ├── FactoringView.tsx    # Working Capital & Instant Factoring UI
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
│       │       │   ├── factoring.ts    # 80% LTV advance & fee calculations
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
│   ├── invoice_factoring/              # Working Capital & Instant Invoice Factoring
│   │   └── src/lib.rs                  # 80% LTV advance & self-repaying settlement
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
│   │   ├── deploy-factoring.js         # Deploys Factoring contract to Testnet
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
| `NEXT_PUBLIC_SOROBAN_FACTORING`| Yes      | `""`    | Deployed Factoring Pool contract ID on Stellar Testnet     |
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

## System Architecture

```text
┌─────────────────────────────────────────────────────────────────────┐
│                       USER / ENTERPRISE ADMIN                       │
└─────────────────────────────────────────────────────────────────────┘
        │                                             │
        │ Factoring Advances / Invoices / Payroll     │ M-of-N Signature
        ▼                                             ▼
┌──────────────────────────────────────────────────────────────────────┐
│                    Delite Next.js Frontend OS                        │
│    /app · /factoring · /invoices · /treasury · /savings              │
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
     ┌────────────────────────┼────────────────────────┬────────────────────────┬────────────────────────┬────────────────────────┐
     ▼                        ▼                        ▼                        ▼                        ▼                        ▼
┌───────────────┐     ┌───────────────┐        ┌───────────────┐        ┌───────────────┐        ┌───────────────┐        ┌───────────────┐
│Factoring Pool │     │Invoice Router │        │ Yield Sweeper │        │Treasury Vault │        │Payment Router │        │  Yield Vault  │
│(80% Working   │     │(Cross-Currency│        │ (Zero-Idle    │        │(M-of-N Multi  │        │(Autonomous    │        │  (ERC-4626    │
│Capital Advance│     │ Path Payments)│        │  Auto-Yield)  │        │ Batch Payroll)│        │ Fund Splits)  │        │   Compounding)│
└───────────────┘     └───────────────┘        └───────────────┘        └───────────────┘        └───────────────┘        └───────────────┘
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
stellar contract build --manifest-path contracts/invoice_factoring/Cargo.toml

# Run smart contract unit tests
cargo test --manifest-path contracts/Cargo.toml
```

---

## Security & Non-Custodial Architecture

- **Client-Side Key Management**: Delite never stores or transmits private keys. All cryptographic signing happens locally inside the user's browser extension via `@creit.tech/stellar-wallets-kit`.
- **Soroban `require_auth`**: Every state-changing function across Factoring, Invoices, Sweeper, Treasury, Router, and Vault enforces cryptographic caller authentication.
- **80% LTV Underwriting Guarantees**: Factoring advances are strictly bound to 80% of verified invoices with automated escrow self-repayment.
- **Zero-Idle Capital Efficiency**: 100% of liquid assets remain compounding inside the Soroban Vault and are unwound atomically at the millisecond of payment execution.
- **M-of-N Multisig Guarantees**: Corporate disbursements cannot execute without satisfying the on-chain threshold of authorized owner signatures.
- **Atomic Rollbacks**: Operations revert completely if any single recipient transfer encounters an error, preventing partial disbursements or trapped capital.

---

## License & Disclaimer

Testnet experimental build. Built for the Stellar & Soroban ecosystem. Open source under the MIT License.
