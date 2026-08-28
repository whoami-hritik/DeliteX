#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, token, Address, Env, String, Symbol};

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct BankBeneficiary {
    pub beneficiary_id: u64,
    pub owner: Address,
    pub rail_type: Symbol,         // UPI, SEPA, PIX, ACH, IMPS
    pub account_label: String,     // e.g. "HDFC Bank (user@okhdfcbank)"
    pub anchor_address: Address,   // Regulated Stellar Anchor Bridge Address
    pub auto_ramp_bps: u32,        // e.g. 4000 = 40.00%
    pub is_primary: bool,
}

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct OffRampExecution {
    pub execution_id: u64,
    pub owner: Address,
    pub beneficiary_id: u64,
    pub amount_usdc: i128,
    pub rail_type: Symbol,
    pub status: Symbol,            // SUBMIT, SETTLED
    pub timestamp: u64,
}

#[contracttype]
pub enum RampKey {
    Beneficiary(Address, u64),
    BeneficiaryCount(Address),
    RampCount(Address),
    RampExecution(Address, u64),
}

#[contract]
pub struct FiatRampRouter;

#[contractimpl]
impl FiatRampRouter {
    /// Register a verified domestic bank account or UPI ID for automated / manual off-ramping
    pub fn add_bank_beneficiary(
        env: Env,
        owner: Address,
        rail_type: Symbol,
        account_label: String,
        anchor_address: Address,
        auto_ramp_bps: u32,
        is_primary: bool,
    ) -> u64 {
        owner.require_auth();
        if auto_ramp_bps > 10_000 {
            panic!("invalid auto ramp percentage");
        }

        let mut count: u64 = env
            .storage()
            .instance()
            .get(&RampKey::BeneficiaryCount(owner.clone()))
            .unwrap_or(0);
        count += 1;

        let beneficiary = BankBeneficiary {
            beneficiary_id: count,
            owner: owner.clone(),
            rail_type: rail_type.clone(),
            account_label,
            anchor_address,
            auto_ramp_bps,
            is_primary,
        };

        env.storage()
            .persistent()
            .set(&RampKey::Beneficiary(owner.clone(), count), &beneficiary);
        env.storage()
            .instance()
            .set(&RampKey::BeneficiaryCount(owner.clone()), &count);

        env.events()
            .publish((symbol_short!("AddBenef"), owner), (count, rail_type));

        count
    }

    /// Manual 1-Click Instant Off-Ramp: Transfers USDC to regulated Anchor bridge
    pub fn execute_off_ramp(
        env: Env,
        owner: Address,
        beneficiary_id: u64,
        amount_usdc: i128,
        usdc_token: Address,
    ) -> u64 {
        owner.require_auth();
        if amount_usdc <= 0 {
            panic!("invalid amount");
        }

        let beneficiary: BankBeneficiary = env
            .storage()
            .persistent()
            .get(&RampKey::Beneficiary(owner.clone(), beneficiary_id))
            .expect("beneficiary not found");

        let token_client = token::Client::new(&env, &usdc_token);
        // Transfer USDC to Anchor settlement bridge
        token_client.transfer(&owner, &beneficiary.anchor_address, &amount_usdc);

        let mut count: u64 = env
            .storage()
            .instance()
            .get(&RampKey::RampCount(owner.clone()))
            .unwrap_or(0);
        count += 1;

        let execution = OffRampExecution {
            execution_id: count,
            owner: owner.clone(),
            beneficiary_id,
            amount_usdc,
            rail_type: beneficiary.rail_type.clone(),
            status: Symbol::new(&env, "SETTLED"),
            timestamp: env.ledger().timestamp(),
        };

        env.storage()
            .persistent()
            .set(&RampKey::RampExecution(owner.clone(), count), &execution);
        env.storage()
            .instance()
            .set(&RampKey::RampCount(owner.clone()), &count);

        env.events()
            .publish((symbol_short!("OffRamp"), owner), (amount_usdc, beneficiary.rail_type));

        count
    }

    /// Autonomous "Ramp on Inflow": Slices configured auto_ramp_bps directly to Anchor bridge
    pub fn execute_auto_ramp(
        env: Env,
        payer: Address,
        owner: Address,
        beneficiary_id: u64,
        inflow_amount: i128,
        usdc_token: Address,
    ) -> (i128, i128) {
        payer.require_auth();

        let beneficiary: BankBeneficiary = env
            .storage()
            .persistent()
            .get(&RampKey::Beneficiary(owner.clone(), beneficiary_id))
            .expect("beneficiary not found");

        let ramp_amount = (inflow_amount * (beneficiary.auto_ramp_bps as i128)) / 10_000;
        let retained_amount = inflow_amount.saturating_sub(ramp_amount);

        if ramp_amount > 0 {
            let token_client = token::Client::new(&env, &usdc_token);
            token_client.transfer(&payer, &beneficiary.anchor_address, &ramp_amount);

            let mut count: u64 = env
                .storage()
                .instance()
                .get(&RampKey::RampCount(owner.clone()))
                .unwrap_or(0);
            count += 1;

            let execution = OffRampExecution {
                execution_id: count,
                owner: owner.clone(),
                beneficiary_id,
                amount_usdc: ramp_amount,
                rail_type: beneficiary.rail_type.clone(),
                status: Symbol::new(&env, "SETTLED"),
                timestamp: env.ledger().timestamp(),
            };

            env.storage()
                .persistent()
                .set(&RampKey::RampExecution(owner.clone(), count), &execution);
            env.storage()
                .instance()
                .set(&RampKey::RampCount(owner.clone()), &count);

            env.events().publish(
                (symbol_short!("AutoRamp"), owner),
                (ramp_amount, beneficiary.rail_type),
            );
        }

        (retained_amount, ramp_amount)
    }

    /// Retrieve beneficiary by ID
    pub fn get_beneficiary(env: Env, owner: Address, beneficiary_id: u64) -> BankBeneficiary {
        env.storage()
            .persistent()
            .get(&RampKey::Beneficiary(owner, beneficiary_id))
            .expect("beneficiary not found")
    }

    /// Total count of registered beneficiaries for an owner
    pub fn get_beneficiary_count(env: Env, owner: Address) -> u64 {
        env.storage()
            .instance()
            .get(&RampKey::BeneficiaryCount(owner))
            .unwrap_or(0)
    }

    /// Retrieve off-ramp execution details
    pub fn get_execution(env: Env, owner: Address, execution_id: u64) -> OffRampExecution {
        env.storage()
            .persistent()
            .get(&RampKey::RampExecution(owner, execution_id))
            .expect("execution not found")
    }

    /// Total count of off-ramp executions for an owner
    pub fn get_execution_count(env: Env, owner: Address) -> u64 {
        env.storage()
            .instance()
            .get(&RampKey::RampCount(owner))
            .unwrap_or(0)
    }
}
