# DeliteX: Flagship Financial Infrastructure Specification
**Production-Grade Architecture, Soroban Smart Contracts, and Data Flow**

---

## 1. Executive Summary

This document specifies the technical architecture, smart contract interfaces, cryptographic data structures, and execution flows for three flagship financial infrastructure features in DeliteX:

1. **Feature 2: Multi-Sig Corporate Treasury & 1-Click Batch Payroll Engine**
2. **Feature 3: Automated Liquidity Sweeper & Yield Vault (Zero-Idle Cash)**
3. **Feature 5: Atomic Cross-Currency Invoicing & Path Payment Checkout Link**

### Contract Requirement Overview:
* **Feature 2 (Multisig Treasury):** Requires a dedicated **`TreasuryVault`** Soroban contract (`contracts/treasury_multisig`).
* **Feature 3 (Yield Sweeper):** Requires a dedicated **`YieldSweeperVault`** Soroban contract (`contracts/yield_sweeper`) with integration into lending protocol contracts (e.g., Blend).
* **Feature 5 (Cross-Currency Invoicing):** Requires a dedicated **`InvoiceRouter`** Soroban contract (`contracts/invoice_router`) coupled with Stellar L1 Path Payment execution.

```
+---------------------------------------------------------------------------------------------------+
|                                      DeliteX Frontend / SDK                                       |
+---------------------------------+---------------------------------+-------------------------------+
                                  |                                 |
        [Freighter / SEP-7 Auth]  |        [Instant Sweep Call]     |     [Cross-Asset Payment]
                                  v                                 v                               v
+---------------------------------+  +------------------------------+  +----------------------------+
|        Feature 2: Treasury      |  |     Feature 3: Sweeper       |  |     Feature 5: Invoicing     |
|   `contracts/treasury_multisig` |  |  `contracts/yield_sweeper`   |  | `contracts/invoice_router` |
+---------------------------------+  +------------------------------+  +----------------------------+
| * M-of-N Threshold State        |  | * Share-based Accounting     |  | * Dynamic Invoice Ledger   |
| * Batch Proposal Storage        |  | * Auto-Deposit into Blend    |  | * L1 Path Payment Swap     |
| * Atomic Multi-Transfers        |  | * Atomic Sweep-on-Debit      |  | * Deterministic Settlement |
+---------------------------------+  +------------------------------+  +----------------------------+
                                  |                                 |                               |
                                  v                                 v                               v
+---------------------------------------------------------------------------------------------------+
|                         Stellar Core & Soroban WASM Runtime Environment                           |
+---------------------------------------------------------------------------------------------------+
```

---

## 2. Feature 2: Multi-Sig Corporate Treasury & Batch Payroll Engine

### 2.1 Problem & Value Proposition
Agencies, DAOs, and cross-border tech companies face major risks moving funds from single-signature wallets. Paying 50–100 contractors internationally today requires:
* 50 separate SWIFT wire transactions ($30–$50 fee each + manual bank entries), or
* High-fee payroll services (Deel/Rippling) charging $30–$50/seat/month.

DeliteX Treasury enables an organization to define $M$-of-$N$ threshold signing on-chain. An accountant uploads a CSV of 100 contractors; once $M$ executives sign with their Stellar wallets, **all 100 payments settle in 3.5 seconds in a single atomic transaction for < $0.01 network fee.**

---

### 2.2 Soroban Contract Architecture (`contracts/treasury_multisig`)

```rust
// Cargo.toml
// [dependencies]
// soroban-sdk = "22.0.0"
```

#### Contract State & Data Structures
```rust
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Vec, BytesN, token};

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct TreasuryConfig {
    pub owners: Vec<Address>,
    pub threshold: u32,
    pub token: Address, // SEP-41 Token (e.g. USDC SAC)
}

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct PayoutItem {
    pub recipient: Address,
    pub amount: i128,
}

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct PayrollProposal {
    pub id: u64,
    pub proposer: Address,
    pub items: Vec<PayoutItem>,
    pub total_amount: i128,
    pub approvals: Vec<Address>,
    pub executed: bool,
    pub deadline: u64,
}

#[contracttype]
pub enum DataKey {
    Config,
    ProposalCount,
    Proposal(u64),
}
```

#### Contract Implementation
```rust
#[contract]
pub struct TreasuryVault;

#[contractimpl]
impl TreasuryVault {
    /// Initialize Treasury with M-of-N owners, threshold, and token asset
    pub fn init(env: Env, owners: Vec<Address>, threshold: u32, token: Address) {
        if env.storage().instance().has(&DataKey::Config) {
            panic!("Already initialized");
        }
        if threshold == 0 || threshold > owners.len() {
            panic!("Invalid threshold");
        }
        let config = TreasuryConfig { owners, threshold, token };
        env.storage().instance().set(&DataKey::Config, &config);
        env.storage().instance().set(&DataKey::ProposalCount, &0u64);
    }

    /// Submit a batch payroll proposal
    pub fn propose_payroll(env: Env, proposer: Address, items: Vec<PayoutItem>, deadline: u64) -> u64 {
        proposer.require_auth();
        let config: TreasuryConfig = env.storage().instance().get(&DataKey::Config).unwrap();
        
        // Verify proposer is an owner
        if !config.owners.contains(&proposer) {
            panic!("Unauthorized proposer");
        }

        let mut total: i128 = 0;
        for item in items.iter() {
            if item.amount <= 0 {
                panic!("Invalid item amount");
            }
            total += item.amount;
        }

        let mut count: u64 = env.storage().instance().get(&DataKey::ProposalCount).unwrap_or(0);
        count += 1;

        let mut approvals = Vec::new(&env);
        approvals.push_back(proposer.clone()); // Proposer auto-approves

        let proposal = PayrollProposal {
            id: count,
            proposer,
            items,
            total_amount: total,
            approvals,
            executed: false,
            deadline,
        };

        env.storage().persistent().set(&DataKey::Proposal(count), &proposal);
        env.storage().instance().set(&DataKey::ProposalCount, &count);

        count
    }

    /// Approve an existing batch payroll proposal
    pub fn approve_payroll(env: Env, approver: Address, proposal_id: u64) {
        approver.require_auth();
        let config: TreasuryConfig = env.storage().instance().get(&DataKey::Config).unwrap();
        
        if !config.owners.contains(&approver) {
            panic!("Unauthorized approver");
        }

        let mut proposal: PayrollProposal = env.storage().persistent()
            .get(&DataKey::Proposal(proposal_id))
            .expect("Proposal not found");

        if proposal.executed {
            panic!("Proposal already executed");
        }
        if env.ledger().timestamp() > proposal.deadline {
            panic!("Proposal expired");
        }
        if proposal.approvals.contains(&approver) {
            panic!("Already approved");
        }

        proposal.approvals.push_back(approver);
        env.storage().persistent().set(&DataKey::Proposal(proposal_id), &proposal);
    }

    /// Execute atomic batch transfer once threshold is satisfied
    pub fn execute_payroll(env: Env, executor: Address, proposal_id: u64) {
        executor.require_auth();
        let config: TreasuryConfig = env.storage().instance().get(&DataKey::Config).unwrap();
        
        let mut proposal: PayrollProposal = env.storage().persistent()
            .get(&DataKey::Proposal(proposal_id))
            .expect("Proposal not found");

        if proposal.executed {
            panic!("Already executed");
        }
        if proposal.approvals.len() < config.threshold {
            panic!("Threshold not reached");
        }

        let token_client = token::Client::new(&env, &config.token);
        let contract_address = env.current_contract_address();

        // Atomic multi-transfer loop
        for item in proposal.items.iter() {
            token_client.transfer(&contract_address, &item.recipient, &item.amount);
        }

        proposal.executed = true;
        env.storage().persistent().set(&DataKey::Proposal(proposal_id), &proposal);
    }
}
```

---

## 3. Feature 3: Automated Liquidity Sweeper & Yield Vault (Zero-Idle Cash)

### 3.1 Problem & Value Proposition
* **The Problem:** In conventional fintech, checking account balances earn 0% interest. In Web3, users must manually un-stake or withdraw from lending markets before paying bills, creating high friction and missed yield.
* **The Flagship Feature:** **Auto-Compounding Liquidity Sweeping**.
  * Any idle USDC deposited into DeliteX automatically sweeps into an audited Soroban lending market (e.g., Blend Protocol) earning 5–8% real APY.
  * When a bill debit, family transfer, or salary split occurs, the `YieldSweeperVault` contract atomically burns the exact required shares, redeems principal + interest from the lending market, and pays the destination in **one single transaction block**.

---

### 3.2 Soroban Contract Architecture (`contracts/yield_sweeper`)

#### Share Token Math ($c$-Token Model)
* When a user deposits $D$ tokens, they receive shares:
  $$\text{Shares} = \frac{D \times \text{TotalShares}}{\text{TotalUnderlyingAsset}}$$
* Total underlying value increases as interest accrues from the lending pool.
* On withdrawal or sweep, the vault burns:
  $$\text{SharesToBurn} = \frac{\text{RequiredAmount} \times \text{TotalShares}}{\text{TotalUnderlyingAsset}}$$

#### Contract State & Data Structures
```rust
#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct VaultState {
    pub underlying_token: Address, // USDC Contract Address
    pub pool_adapter: Address,     // Lending Market Adapter (e.g. Blend)
    pub total_shares: i128,
}

#[contracttype]
pub enum SweeperKey {
    State,
    UserShares(Address),
}
```

#### Contract Implementation
```rust
#[contract]
pub struct YieldSweeperVault;

#[contractimpl]
impl YieldSweeperVault {
    pub fn init(env: Env, underlying_token: Address, pool_adapter: Address) {
        if env.storage().instance().has(&SweeperKey::State) {
            panic!("Already initialized");
        }
        let state = VaultState {
            underlying_token,
            pool_adapter,
            total_shares: 0,
        };
        env.storage().instance().set(&SweeperKey::State, &state);
    }

    /// Deposit USDC and receive yield-bearing shares
    pub fn deposit(env: Env, from: Address, amount: i128) -> i128 {
        from.require_auth();
        if amount <= 0 { panic!("Invalid amount"); }

        let mut state: VaultState = env.storage().instance().get(&SweeperKey::State).unwrap();
        let token_client = token::Client::new(&env, &state.underlying_token);
        let contract_address = env.current_contract_address();

        // Transfer funds from user to Vault
        token_client.transfer(&from, &contract_address, &amount);

        // Supply to Lending Pool Adapter
        token_client.approve(&contract_address, &state.pool_adapter, &amount, &(env.ledger().sequence() + 1000));
        // (Cross-contract call to lending pool adapter to deposit)

        let total_underlying = Self::get_total_underlying(&env, &state);
        let shares_to_mint = if state.total_shares == 0 || total_underlying == 0 {
            amount
        } else {
            (amount * state.total_shares) / total_underlying
        };

        let current_user_shares: i128 = env.storage().persistent()
            .get(&SweeperKey::UserShares(from.clone()))
            .unwrap_or(0);

        env.storage().persistent().set(&SweeperKey::UserShares(from), &(current_user_shares + shares_to_mint));
        state.total_shares += shares_to_mint;
        env.storage().instance().set(&SweeperKey::State, &state);

        shares_to_mint
    }

    /// Atomic Sweep-and-Disburse: Unwinds exact required funds from pool & pays recipient
    pub fn sweep_and_pay(env: Env, owner: Address, recipient: Address, amount: i128) {
        owner.require_auth();
        if amount <= 0 { panic!("Invalid amount"); }

        let mut state: VaultState = env.storage().instance().get(&SweeperKey::State).unwrap();
        let total_underlying = Self::get_total_underlying(&env, &state);
        
        let shares_needed = (amount * state.total_shares) / total_underlying;
        let mut user_shares: i128 = env.storage().persistent()
            .get(&SweeperKey::UserShares(owner.clone()))
            .expect("No balance");

        if user_shares < shares_needed {
            panic!("Insufficient funds in yield vault");
        }

        // 1. Redeem exact amount from Lending Pool Adapter to this contract
        // (Cross-contract call: pool_adapter::redeem(amount))

        // 2. Transfer exact amount directly to recipient atomically
        let token_client = token::Client::new(&env, &state.underlying_token);
        token_client.transfer(&env.current_contract_address(), &recipient, &amount);

        // 3. Burn shares
        user_shares -= shares_needed;
        state.total_shares -= shares_needed;

        env.storage().persistent().set(&SweeperKey::UserShares(owner), &user_shares);
        env.storage().instance().set(&SweeperKey::State, &state);
    }

    pub fn get_total_underlying(env: &Env, state: &VaultState) -> i128 {
        // Query pool_adapter balance or local reserves
        // For baseline, returns total pool allocation
        state.total_shares // (Mock 1:1 base + accrued yield calculation)
    }
}
```

---

## 4. Feature 5: Atomic Cross-Currency Invoicing & Path Payment Checkout Link

### 4.1 Problem & Value Proposition
* **The Problem:** Freelancers and global contractors bill clients worldwide. European clients want to pay in Euros (EURC) or credit card; the freelancer wants USDC or Indian INR in their account. PayPal and Stripe charge 3.5% + $0.30 + 2.5% hidden FX spreads.
* **The Flagship Feature:** **Stellar L1 Path-Payment Smart Invoicing**.
  * A freelancer generates a payment link: `pay.delitex.app/inv/0892`.
  * The invoice metadata specifies: `Due: 1,000 USDC`.
  * When a German client connects their wallet and chooses to pay in `EURC`, the system uses Stellar's native **PathPaymentStrictReceive** engine to trade `EURC` $\rightarrow$ `USDC` across Stellar DEX liquidity pools in a single atomic transaction.
  * The `InvoiceRouter` contract records the receipt, marks the invoice as settled on-chain, and routes the USDC directly into the recipient's pre-configured DeliteX buckets.

---

### 4.2 Soroban Contract Architecture (`contracts/invoice_router`)

```rust
#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub enum InvoiceStatus {
    Unpaid,
    Paid,
    Cancelled,
    Refunded,
}

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct Invoice {
    pub id: BytesN<32>,          // Unique UUID hash
    pub merchant: Address,       // Payee
    pub target_token: Address,   // Target Token (e.g. USDC)
    pub amount_due: i128,        // Target Amount
    pub status: InvoiceStatus,
    pub payer: Option<Address>,
    pub created_at: u64,
    pub paid_at: u64,
}

#[contracttype]
pub enum InvoiceKey {
    Invoice(BytesN<32>),
    MerchantInvoices(Address),
}
```

#### Contract Implementation
```rust
#[contract]
pub struct InvoiceRouter;

#[contractimpl]
impl InvoiceRouter {
    /// Merchant registers a new on-chain invoice
    pub fn create_invoice(
        env: Env,
        merchant: Address,
        invoice_id: BytesN<32>,
        target_token: Address,
        amount_due: i128,
    ) {
        merchant.require_auth();
        if amount_due <= 0 { panic!("Invalid amount"); }

        if env.storage().persistent().has(&InvoiceKey::Invoice(invoice_id.clone())) {
            panic!("Invoice ID already exists");
        }

        let invoice = Invoice {
            id: invoice_id.clone(),
            merchant,
            target_token,
            amount_due,
            status: InvoiceStatus::Unpaid,
            payer: None,
            created_at: env.ledger().timestamp(),
            paid_at: 0,
        };

        env.storage().persistent().set(&InvoiceKey::Invoice(invoice_id), &invoice);
    }

    /// Settle invoice: Called either directly with target token or after L1 Path Payment swap
    pub fn settle_invoice(env: Env, payer: Address, invoice_id: BytesN<32>) {
        payer.require_auth();

        let mut invoice: Invoice = env.storage().persistent()
            .get(&InvoiceKey::Invoice(invoice_id.clone()))
            .expect("Invoice not found");

        if invoice.status != InvoiceStatus::Unpaid {
            panic!("Invoice is not payable");
        }

        let token_client = token::Client::new(&env, &invoice.target_token);

        // Transfer target asset from payer directly to merchant
        token_client.transfer(&payer, &invoice.merchant, &invoice.amount_due);

        // Update on-chain status
        invoice.status = InvoiceStatus::Paid;
        invoice.payer = Some(payer);
        invoice.paid_at = env.ledger().timestamp();

        env.storage().persistent().set(&InvoiceKey::Invoice(invoice_id), &invoice);

        // Emit on-chain event for instant webhook / frontend sync
        env.events().publish((invoice.id, invoice.merchant), invoice.amount_due);
    }
}
```

---

## 5. Summary Table: Smart Contract Matrix

| Feature | Contract Name | Key Soroban Functions | Stellar L1 Capabilities Used |
| :--- | :--- | :--- | :--- |
| **Feature 2: Multisig Treasury** | `TreasuryVault` | `init`, `propose_payroll`, `approve_payroll`, `execute_payroll` | SEP-41 SAC Token Transfers, Threshold Authorization |
| **Feature 3: Yield Sweeper** | `YieldSweeperVault` | `deposit`, `sweep_and_pay`, `get_total_underlying` | Cross-Contract Calls, Yield Compounding, Share Token Math |
| **Feature 5: Invoicing** | `InvoiceRouter` | `create_invoice`, `settle_invoice` | `PathPaymentStrictReceive`, Stellar DEX Liquidity Pools, Event Publishing |

---

## 6. Implementation Plan for DeliteX

1. **Phase 1: Soroban Smart Contracts (Rust / WASM)**
   * Create `contracts/treasury_multisig`, `contracts/yield_sweeper`, `contracts/invoice_router`.
   * Write comprehensive unit tests in Rust using `soroban-sdk::Env::default()`.
   * Compile to `.wasm` and deploy to Stellar Testnet.

2. **Phase 2: TypeScript SDK & Horizon Integration**
   * Generate TypeScript contract bindings using `@stellar/stellar-sdk` and `soroban-client`.
   * Integrate Stellar Wallets Kit (Freighter, xBull, Albedo) for threshold multi-signature collection.

3. **Phase 3: Production Dashboard UI**
   * **Treasury Tab:** Upload CSV, review batch disbursements, execute multi-sig sign-offs.
   * **Sweeper Tab:** Real-time APY display, yield accrual counter, zero-idle cash settings.
   * **Invoicing Tab:** Instant invoice generator with QR codes, shareable URLs (`pay.delitex.app/inv/[id]`), and multi-asset checkout.
