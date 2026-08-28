<div align="center">

# Delite

### Agentic Remittance, Multi-Sig Treasury, Factoring & Tax Escrow on Stellar Soroban

Automate Global Payroll · Multi-Sig Treasury · Zero-Idle Sweeper · Cross-Currency Invoicing · Instant Factoring · Direct Bank Off-Ramp · Tax Escrow · Built on Stellar Testnet

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Delite%20App-6366f1?style=flat-square)](https://delite-x-web.vercel.app/)
[![User Feedback](https://img.shields.io/badge/User%20Feedback-Live%20Onboarding%20Responses-10b981?style=flat-square)](https://docs.google.com/spreadsheets/d/e/2PACX-1vTgVIIIMvIPay_pSydzaoXReBWiHQVnfCydVe5mCN5MsJBXJL7taSVapETTAnIZbdL47HVmX2eAJ6rJ/pubhtml)
[![Network](https://img.shields.io/badge/Network-Stellar%20Testnet-0ea5e9?style=flat-square)](https://stellar.org)
[![Soroban](https://img.shields.io/badge/Contracts-Soroban%20v22-8b5cf6?style=flat-square)](https://soroban.stellar.org)
[![Tax Escrow](https://img.shields.io/badge/Tax%20Escrow-Yield%20Compounding-22c55e?style=flat-square)](https://stellar.expert/explorer/testnet/contract/CDOLCWJWM3NHGWIBY7QZGECAEXJUZVCY2BIHCB4IV7R46VUUOUWYI6F4)
[![Off-Ramp](https://img.shields.io/badge/Off--Ramp-Direct%20Bank%20Settlement-22c55e?style=flat-square)](https://stellar.expert/explorer/testnet/contract/CAN7RIIEUQQ5WUNJZ2C3AUBUCUKTYSQ4NB6ICKCBSUUECW5QBOWHD7Y2)
[![Factoring](https://img.shields.io/badge/Factoring-Working%20Capital%20Advance-22c55e?style=flat-square)](https://stellar.expert/explorer/testnet/contract/CAPNWFV3JFNE2FCGH6IWXVH5DAZQYYWFKWNLE2HRIITDZSNINH7FO2WA)
[![Invoicing](https://img.shields.io/badge/Invoicing-Path%20Payment-22c55e?style=flat-square)](https://stellar.expert/explorer/testnet/contract/CDPNJLGFJTBVYXUMHYQPOCEFIGA27UKNCAT2IHWSSVJRPGGWWT4NJC2I)
[![Treasury](https://img.shields.io/badge/Treasury-M--of--N%20Multisig-22c55e?style=flat-square)](https://stellar.expert/explorer/testnet/contract/CDA53YJJ6KEL24EY5KVY34ELUWG7LRCTDTDMPLZMYEU3UBXZQKV7GM53)
[![Sweeper](https://img.shields.io/badge/Sweeper-Zero--Idle%20Vault-22c55e?style=flat-square)](https://stellar.expert/explorer/testnet/contract/CDNBSZFM6XFAW7T2JKAWX4MDCIMAHUPT4TH2QNBFOCGRTRQWEGHUBD64)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2016-black?style=flat-square)](https://nextjs.org)
[![CI](https://img.shields.io/badge/CI-Passing-22c55e?style=flat-square)](#)

> 📊 **User Onboarding Feedback & Validation**: [View Public User Onboarding & Feedback Sheet ↗](https://docs.google.com/spreadsheets/d/e/2PACX-1vTgVIIIMvIPay_pSydzaoXReBWiHQVnfCydVe5mCN5MsJBXJL7taSVapETTAnIZbdL47HVmX2eAJ6rJ/pubhtml)

</div>

---

## What's New

### 1. Automated On-Chain Tax Withholding & Yield-Earning Tax Escrow
We have deployed an on-chain tax compliance and yield vault on Soroban:
- **Autonomous Inflow Slicing:** Automatically slices configured tax brackets (e.g. 25% US Federal/State, 20% + 10% India TDS/GST, 20% UK HMRC) whenever payments hit the DeliteX router.
- **Yield Compounding on Tax Capital (7.40% APY):** Instead of sitting dead, withheld tax reserves compound continuously inside Soroban yield vaults until quarterly filing deadlines, earning users risk-free passive profit.
- **1-Click On-Chain Filing & Cryptographic Proofs:** Directly settle quarterly tax liabilities to certified tax authority addresses and export verifiable cryptographic compliance certificates.
- **Live Testnet Contract:** [`CDOLCWJWM3NHGWIBY7QZGECAEXJUZVCY2BIHCB4IV7R46VUUOUWYI6F4`](https://stellar.expert/explorer/testnet/contract/CDOLCWJWM3NHGWIBY7QZGECAEXJUZVCY2BIHCB4IV7R46VUUOUWYI6F4)

### 2. Automated Local Fiat Off-Ramp & Direct Bank Settlement
- **Direct Multi-Rail Domestic Settlement:** Convert on-chain USDC directly into local fiat currency deposited to domestic bank accounts via **UPI/IMPS** (India), **SEPA Instant** (Europe), **Pix** (Brazil), or **FedNow/ACH** (US) in 35 seconds via Stellar SEP-24/38/31 anchors.
- **Live Testnet Contract:** [`CAN7RIIEUQQ5WUNJZ2C3AUBUCUKTYSQ4NB6ICKCBSUUECW5QBOWHD7Y2`](https://stellar.expert/explorer/testnet/contract/CAN7RIIEUQQ5WUNJZ2C3AUBUCUKTYSQ4NB6ICKCBSUUECW5QBOWHD7Y2)

### 3. Instant Invoice Factoring & Working Capital Liquidity Pool
- **80% Instant Cash Advances:** Agencies and freelancers lock verified Net-30/60 unpaid invoices and receive 80% liquid USDC in their wallet in under 5 seconds with automated self-repayment upon client settlement.
- **Live Testnet Contract:** [`CAPNWFV3JFNE2FCGH6IWXVH5DAZQYYWFKWNLE2HRIITDZSNINH7FO2WA`](https://stellar.expert/explorer/testnet/contract/CAPNWFV3JFNE2FCGH6IWXVH5DAZQYYWFKWNLE2HRIITDZSNINH7FO2WA)

### 4. Atomic Cross-Currency Invoicing & Path Payment Checkout
- **Instant Cross-Asset Settlement:** Invoices denominated in USDC can be settled by global payers using EURC, XLM, or USDC via automated DEX path routing with zero hidden FX spreads.
- **Live Testnet Contract:** [`CDPNJLGFJTBVYXUMHYQPOCEFIGA27UKNCAT2IHWSSVJRPGGWWT4NJC2I`](https://stellar.expert/explorer/testnet/contract/CDPNJLGFJTBVYXUMHYQPOCEFIGA27UKNCAT2IHWSSVJRPGGWWT4NJC2I)

### 5. Automated Liquidity Sweeper & Yield Engine (Zero-Idle Cash)
- **Zero-Idle Compounding:** Idle funds earn automated compound yield (7.40% APY) inside a $c$-token share vault with atomic `sweep_and_pay()` execution for bills and remittances.
- **Live Testnet Contract:** [`CDNBSZFM6XFAW7T2JKAWX4MDCIMAHUPT4TH2QNBFOCGRTRQWEGHUBD64`](https://stellar.expert/explorer/testnet/contract/CDNBSZFM6XFAW7T2JKAWX4MDCIMAHUPT4TH2QNBFOCGRTRQWEGHUBD64)

### 6. Corporate Multi-Sig Treasury & 1-Click Batch Payroll
- **M-of-N Cryptographic Consensus:** Organizations configure $N$ executive signer keys and require $M$ approvals to disburse payroll across up to 100 contractors in a single atomic transaction block.
- **Live Testnet Contract:** [`CDA53YJJ6KEL24EY5KVY34ELUWG7LRCTDTDMPLZMYEU3UBXZQKV7GM53`](https://stellar.expert/explorer/testnet/contract/CDA53YJJ6KEL24EY5KVY34ELUWG7LRCTDTDMPLZMYEU3UBXZQKV7GM53)

---

## Comprehensive Overview

Delite is a full-stack, non-custodial financial operating system and remittance router built natively for the Stellar and Soroban ecosystem. Delite automates cross-border income flows, multi-sig corporate treasuries, instant working capital factoring, direct fiat bank off-ramps, automated tax withholding, and decentralized savings streams, replacing slow banking rails with instant, cryptographic smart contracts.

### Core Protocol Stack & Features

1. **Automated On-Chain Tax Escrow (`tax_escrow`)**
   - **Autonomous Tax Slicing**: Automatically separates income tax and GST/VAT from gross revenue before reaching spending wallets.
   - **Yield-Earning Tax Reserves**: Compounds idle tax capital at 7.4% APY until quarterly payment dates.

2. **Automated Local Fiat Off-Ramp (`ramp_settlement`)**
   - **Direct Domestic Bank Settlement**: Automatic conversion and deposit of on-chain USDC into domestic bank switches (UPI/IMPS for India, SEPA for Europe, Pix for Brazil, FedNow/ACH for US).

3. **Instant Invoice Factoring & Working Capital (`invoice_factoring`)**
   - **80% LTV Instant Cash Advances**: Receive instant working capital on Net-30 invoices without traditional bank credit checks or personal guarantees.

4. **Atomic Cross-Currency Invoicing (`invoice_router`)**
   - **Multi-Asset DEX Path Routing**: Clients in Europe or across the globe pay invoices in EURC or XLM; merchants receive exact USDC settlement directly on-chain.

5. **Automated Liquidity Sweeper & Yield Vault (`yield_sweeper`)**
   - **Zero-Idle Cash Compounding**: Continuous second-by-second yield compounding at 7.40% APY via Soroban share tokens.

6. **Corporate Multi-Sig Treasury & Batch Payroll (`treasury`)**
   - **M-of-N Cryptographic Consensus**: Define multiple executive keys requiring on-chain threshold approvals before releasing capital.

---

## Smart Contract Deployments

All contracts are written in Rust with `soroban-sdk = "=22.0.0"`, compiled to `wasm32v1-none`, and deployed natively on the **Stellar Soroban Testnet**.

| Contract | Address | Explorer |
|----------|---------|---------|
| **Tax Escrow Vault** | `CAVR6ODONMVSBKAWV2V5C7LRBYYKOHM2HX5ADDBRF6AFJ65KILZM2XVV` | [View on StellarExpert](https://stellar.expert/explorer/testnet/contract/CAVR6ODONMVSBKAWV2V5C7LRBYYKOHM2HX5ADDBRF6AFJ65KILZM2XVV) |
| **Fiat Ramp Router** | `CDBRJZWMNN534PAEBOX6D5LNXVABLNFYFFVK2VIQHQ5U2KUWVPPFKVX7` | [View on StellarExpert](https://stellar.expert/explorer/testnet/contract/CDBRJZWMNN534PAEBOX6D5LNXVABLNFYFFVK2VIQHQ5U2KUWVPPFKVX7) |
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
│       │   │   │   ├── TaxView.tsx          # Automated On-Chain Tax Escrow UI
│       │   │   │   ├── OffRampView.tsx      # Automated Fiat Off-Ramp & Bank UI
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
│       │       │   ├── tax.ts          # Jurisdiction rules & tax slicing calculations
│       │       │   ├── offramp.ts      # Multi-rail bank calculations (UPI/SEPA/Pix)
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
│   ├── tax_escrow/                     # Automated On-Chain Tax Withholding Vault
│   │   └── src/lib.rs                  # Tax profile, autonomous slicing & disbursements
│   ├── ramp_settlement/                # Automated Fiat Off-Ramp & Bank Router
│   │   └── src/lib.rs                  # Bank beneficiary registry & auto-ramp slicing
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
│   │   ├── deploy-tax.js               # Deploys Tax Escrow Vault to Testnet
│   │   ├── deploy-ramp.js              # Deploys Fiat Ramp Router to Testnet
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
| `NEXT_PUBLIC_SOROBAN_TAX`      | Yes      | `""`    | Deployed Tax Escrow Vault contract ID on Stellar Testnet   |
| `NEXT_PUBLIC_SOROBAN_RAMP`     | Yes      | `""`    | Deployed Fiat Ramp Router contract ID on Stellar Testnet   |
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
| **User Onboarding Feedback** | [📊 View Live User Feedback Responses Sheet](https://docs.google.com/spreadsheets/d/e/2PACX-1vTgVIIIMvIPay_pSydzaoXReBWiHQVnfCydVe5mCN5MsJBXJL7taSVapETTAnIZbdL47HVmX2eAJ6rJ/pubhtml) |
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
        │ Tax / Off-Ramp / Factoring / Invoicing      │ M-of-N Signature
        ▼                                             ▼
┌──────────────────────────────────────────────────────────────────────┐
│                    Delite Next.js Frontend OS                        │
│   /app · /tax · /offramp · /factoring · /invoices · /treasury        │
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
     ┌────────────────────────┼────────────────────────┬────────────────────────┬────────────────────────┬────────────────────────┬────────────────────────┬────────────────────────┐
     ▼                        ▼                        ▼                        ▼                        ▼                        ▼                        ▼                        ▼
┌───────────────┐     ┌───────────────┐        ┌───────────────┐        ┌───────────────┐        ┌───────────────┐        ┌───────────────┐        ┌───────────────┐        ┌───────────────┐
│Tax Escrow     │     │Fiat Ramp      │        │Factoring Pool │        │Invoice Router │        │ Yield Sweeper │        │Treasury Vault │        │Payment Router │        │  Yield Vault  │
│(Auto-Withhold │     │(Direct Bank / │        │(80% Working   │        │(Cross-Currency│        │ (Zero-Idle    │        │(M-of-N Multi  │        │(Autonomous    │        │  (ERC-4626    │
│ & 7.4% Yield) │     │ UPI Auto-Ramp)│        │Capital Advance│        │ Path Payments)│        │  Auto-Yield)  │        │ Batch Payroll)│        │ Fund Splits)  │        │   Compounding)│
└───────────────┘     └───────────────┘        └───────────────┘        └───────────────┘        └───────────────┘        └───────────────┘        └───────────────┘        └───────────────┘
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
stellar contract build --manifest-path contracts/tax_escrow/Cargo.toml

# Run smart contract unit tests
cargo test --manifest-path contracts/Cargo.toml
```

---

## Security & Non-Custodial Architecture

- **Client-Side Key Management**: Delite never stores or transmits private keys. All cryptographic signing happens locally inside the user's browser extension via `@creit.tech/stellar-wallets-kit`.
- **Soroban `require_auth`**: Every state-changing function across Tax Escrow, Off-Ramp, Factoring, Invoices, Sweeper, Treasury, Router, and Vault enforces cryptographic caller authentication.
- **Yield-Compounded Tax Reserves**: Tax capital remains non-custodial and earns yield until authorized for disbursement to certified tax authority addresses.
- **Zero-Idle Capital Efficiency**: 100% of liquid assets remain compounding inside the Soroban Vault and are unwound atomically at the millisecond of payment execution.
- **M-of-N Multisig Guarantees**: Corporate disbursements cannot execute without satisfying the on-chain threshold of authorized owner signatures.

---

## 📸 Product Screenshots & Walkthrough

### 1. Landing Page & Gateway
![Landing Page](apps/web/public/Screenshots/Landing%20Page.png)
> **Gateway to Agentic Finance**: Delite's entry point featuring a glassmorphic hero with WebGL procedural shader canvas, non-custodial Stellar wallet authentication, and live protocol feature suite.

---

### 2. Financial OS & Central Dashboard
![Dashboard](apps/web/public/Screenshots/Dashbaord.png)
> **Unified Liquidity Command Center**: Real-time asset tracking across liquid reserves, smart automated budget buckets (Bills, Remittances, Savings, Tax Reserves), and incoming payment feeds.

---

### 3. Corporate Multi-Sig Treasury & Approval Matrix
![Corporate Treasury](apps/web/public/Screenshots/Corporate%20Treasury.png)
> **M-of-N Cryptographic Governance**: Non-custodial enterprise treasury requiring multi-party quorum authorization before executing transactions with transparent signer tracking.

---

### 4. 1-Click Multi-Sig Batch Payroll Execution
![Multi-Sig Payroll Batch](apps/web/public/Screenshots/Multi%20Sig%20payrooll%20Batch.png)
> **Atomic Contractor Payroll**: Disburse batch payroll to up to 100 global contractor wallets in a single atomic transaction block with zero execution or double-spend risk.

---

### 5. Instant Invoice Factoring & Working Capital Pool
![Working Capital & Factoring](apps/web/public/Screenshots/Working%20Cap.png)
> **80% Instant LTV Cash Advances**: Agencies and freelancers lock verified Net-30/60 client invoices and receive immediate liquid USDC capital with automated escrow self-repayment upon settlement.

---

### 6. Atomic Cross-Currency Smart Invoicing & Path Payment
![Smart Invoicing](apps/web/public/Screenshots/Smart%20Invoicing.png)
> **DEX Path-Routed Global Billing**: Create verifiable on-chain invoices payable in EURC, XLM, or USDC via automated DEX path routing with zero FX spread losses.

---

### 7. Automated Local Fiat Off-Ramp & Direct Bank Settlement
![Fiat Off-Ramp](apps/web/public/Screenshots/Fiat%20Off%20Ramp.png)
> **35-Second Domestic Bank Settlement**: Autonomous conversion and payout of on-chain USDC directly into domestic bank rails via UPI/IMPS (India), SEPA Instant (Europe), Pix (Brazil), and FedNow/ACH (US).

---

### 8. Autonomous Execution Rules & Routing Matrix
![Rule Book](apps/web/public/Screenshots/Rule%20Book.png)
> **Visual Financial Automation Rulebook**: Define algorithmic policies for automated income splitting, scheduled bill disbursements, and zero-idle capital rebalances.

---

### 9. AI Natural Language Rule Configurator
![Agentic AI](apps/web/public/Screenshots/Agentic%20Ai.png)
> **Natural Language Intent to Smart Contract Rules**: Interactive AI assistant that translates natural language financial intentions into mathematical Soroban execution matrices.

---

### 10. Cross-Border Beneficiary & Family Remittance
![Family & Remittance](apps/web/public/Screenshots/Family%20&%20Remitance.png)
> **Zero-Fee Global Remittances**: Stream automated salary allocations directly to family members and dependents across international borders in real time.

---

### 11. Automated On-Chain Tax Withholding & Yield Escrow
![Tax Escrow Vault](apps/web/public/Screenshots/Tax%20Escrow%20Vault.png)
> **Autonomous Tax Slicing & 7.4% APY Compounding**: Automatically slice IRS 1099, India TDS/GST, and UK HMRC brackets on inflow, earning continuous compound yield until 1-click quarterly filing.

---

### 12. Deployed Soroban Vault Contract
![Deployed Vault Contract](apps/web/public/Screenshots/Deployed%20Vault%20Contract.png)
> **Verified On-Chain Architecture**: Live ERC-4626 style yield vault contract deployed on Stellar Soroban Testnet displaying ledger state and WASM storage metrics.

---

### 13. Vault Compounding & Deposit Transaction
![Vault Transaction](apps/web/public/Screenshots/Vault%20Transaction.png)
> **Zero-Idle Yield Compounding**: Confirmed on-chain transaction routing surplus treasury capital into the Soroban compounding vault for continuous yield generation.

---

### 14. Real-World Ledger Transaction Proof
![Transaction Proof](apps/web/public/Screenshots/Transaction%20Proof.png)
> **Verifiable Blockchain Finality**: Direct transaction proof on the Stellar ledger with sub-second settlement confirmation and transparent cryptographic hashes.

---

### 15. Turborepo CI/CD & Automated Pipeline
![CI CD Pipeline](apps/web/public/Screenshots/CI%20CD%20Pipeline.png)
> **Enterprise Reliability**: Automated Turborepo continuous integration pipeline verifying smart contract tests, TypeScript build, and strict lint checks on every commit.

---


## License & Disclaimer

Testnet experimental build. Built for the Stellar & Soroban ecosystem. Open source under the MIT License.
