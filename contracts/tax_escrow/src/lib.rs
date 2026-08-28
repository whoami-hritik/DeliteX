#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, token, Address, Env, Symbol};

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct TaxProfile {
    pub owner: Address,
    pub jurisdiction_code: u32, // 840 (US), 356 (India), 826 (UK), 276 (Germany)
    pub income_tax_bps: u32,    // e.g. 2500 = 25.00%
    pub vat_gst_bps: u32,       // e.g. 500 = 5.00%
    pub accumulated_principal: i128,
    pub yield_vault: Address,   // Address of Yield Sweeper Vault
    pub last_withheld_timestamp: u64,
}

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct TaxFilingRecord {
    pub filing_id: u64,
    pub period_label: Symbol,   // e.g. "Q1_2026", "Q2_2026"
    pub amount_paid: i128,
    pub yield_harvested: i128,
    pub tax_authority_address: Address,
    pub timestamp: u64,
}

#[contracttype]
pub enum TaxKey {
    Profile(Address),
    FilingCount(Address),
    Filing(Address, u64),
}

#[contract]
pub struct TaxEscrowVault;

#[contractimpl]
impl TaxEscrowVault {
    /// Configure personal or business tax withholding rules
    pub fn configure_tax_profile(
        env: Env,
        owner: Address,
        jurisdiction_code: u32,
        income_tax_bps: u32,
        vat_gst_bps: u32,
        yield_vault: Address,
    ) {
        owner.require_auth();
        if income_tax_bps + vat_gst_bps > 5000 {
            panic!("withholding rate cannot exceed 50%");
        }

        let existing_principal = env
            .storage()
            .persistent()
            .get::<_, TaxProfile>(&TaxKey::Profile(owner.clone()))
            .map(|p| p.accumulated_principal)
            .unwrap_or(0);

        let profile = TaxProfile {
            owner: owner.clone(),
            jurisdiction_code,
            income_tax_bps,
            vat_gst_bps,
            accumulated_principal: existing_principal,
            yield_vault,
            last_withheld_timestamp: env.ledger().timestamp(),
        };

        env.storage()
            .persistent()
            .set(&TaxKey::Profile(owner.clone()), &profile);

        env.events()
            .publish((symbol_short!("TaxConfig"), owner), (income_tax_bps, vat_gst_bps));
    }

    /// Autonomous Tax Slice: Withholds configured tax portion into escrow
    pub fn withhold_tax(
        env: Env,
        payer: Address,
        owner: Address,
        gross_amount: i128,
        token_addr: Address,
    ) -> (i128, i128) {
        payer.require_auth();

        let mut profile: TaxProfile = env
            .storage()
            .persistent()
            .get(&TaxKey::Profile(owner.clone()))
            .expect("tax profile not configured");

        let total_bps = profile.income_tax_bps + profile.vat_gst_bps;
        let tax_amount = (gross_amount * (total_bps as i128)) / 10_000;
        let net_spendable = gross_amount.saturating_sub(tax_amount);

        if tax_amount > 0 {
            let token_client = token::Client::new(&env, &token_addr);
            token_client.transfer(&payer, &env.current_contract_address(), &tax_amount);

            profile.accumulated_principal += tax_amount;
            profile.last_withheld_timestamp = env.ledger().timestamp();
            env.storage()
                .persistent()
                .set(&TaxKey::Profile(owner.clone()), &profile);

            env.events()
                .publish((symbol_short!("TaxHold"), owner), (gross_amount, tax_amount));
        }

        (net_spendable, tax_amount)
    }

    /// Manual Tax Reserve Deposit: Allows user to top-up tax reserves
    pub fn deposit_tax_reserve(env: Env, owner: Address, amount: i128, token_addr: Address) {
        owner.require_auth();
        if amount <= 0 {
            panic!("invalid amount");
        }

        let mut profile: TaxProfile = env
            .storage()
            .persistent()
            .get(&TaxKey::Profile(owner.clone()))
            .expect("tax profile not configured");

        let token_client = token::Client::new(&env, &token_addr);
        token_client.transfer(&owner, &env.current_contract_address(), &amount);

        profile.accumulated_principal += amount;
        env.storage()
            .persistent()
            .set(&TaxKey::Profile(owner.clone()), &profile);

        env.events()
            .publish((symbol_short!("TaxDep"), owner), amount);
    }

    /// Disburse quarterly tax payment to designated tax authority address
    pub fn pay_tax_filing(
        env: Env,
        owner: Address,
        tax_authority: Address,
        amount_to_pay: i128,
        period_label: Symbol,
        token_addr: Address,
    ) -> u64 {
        owner.require_auth();
        if amount_to_pay <= 0 {
            panic!("invalid payment amount");
        }

        let mut profile: TaxProfile = env
            .storage()
            .persistent()
            .get(&TaxKey::Profile(owner.clone()))
            .expect("tax profile not configured");

        if profile.accumulated_principal < amount_to_pay {
            panic!("insufficient tax reserve");
        }

        let token_client = token::Client::new(&env, &token_addr);
        token_client.transfer(&env.current_contract_address(), &tax_authority, &amount_to_pay);

        profile.accumulated_principal -= amount_to_pay;
        env.storage()
            .persistent()
            .set(&TaxKey::Profile(owner.clone()), &profile);

        let mut count: u64 = env
            .storage()
            .instance()
            .get(&TaxKey::FilingCount(owner.clone()))
            .unwrap_or(0);
        count += 1;

        let record = TaxFilingRecord {
            filing_id: count,
            period_label,
            amount_paid: amount_to_pay,
            yield_harvested: 0,
            tax_authority_address: tax_authority,
            timestamp: env.ledger().timestamp(),
        };

        env.storage()
            .persistent()
            .set(&TaxKey::Filing(owner.clone(), count), &record);
        env.storage()
            .instance()
            .set(&TaxKey::FilingCount(owner.clone()), &count);

        env.events()
            .publish((symbol_short!("TaxPaid"), owner), (count, amount_to_pay));

        count
    }

    /// Retrieve tax profile for an owner
    pub fn get_tax_profile(env: Env, owner: Address) -> TaxProfile {
        env.storage()
            .persistent()
            .get(&TaxKey::Profile(owner))
            .expect("tax profile not configured")
    }

    /// Retrieve on-chain tax filing receipt
    pub fn get_filing(env: Env, owner: Address, filing_id: u64) -> TaxFilingRecord {
        env.storage()
            .persistent()
            .get(&TaxKey::Filing(owner, filing_id))
            .expect("filing not found")
    }

    /// Total count of tax filings for an owner
    pub fn get_filing_count(env: Env, owner: Address) -> u64 {
        env.storage()
            .instance()
            .get(&TaxKey::FilingCount(owner))
            .unwrap_or(0)
    }
}
