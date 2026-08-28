#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, token, Address, Env};

#[contracttype]
#[derive(Clone, Copy, Debug, PartialEq)]
pub enum FactoringStatus {
    Unfunded = 0,
    Active = 1,
    Settled = 2,
    Defaulted = 3,
}

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct FactoringPosition {
    pub invoice_id: u64,
    pub merchant: Address,
    pub total_invoice_amount: i128,
    pub advance_amount: i128,
    pub discount_fee: i128,
    pub status: FactoringStatus,
    pub funded_at: u64,
    pub due_date: u64,
}

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct PoolConfig {
    pub liquidity_token: Address, // USDC
    pub total_liquidity: i128,
    pub total_advanced: i128,
    pub base_fee_bps: u32,        // 150 bps = 1.5%
    pub ltv_bps: u32,             // 8000 bps = 80%
}

#[contracttype]
pub enum FactoringKey {
    Config,
    Position(u64),
    ProviderDeposit(Address),
}

#[contract]
pub struct InvoiceFactoringPool;

#[contractimpl]
impl InvoiceFactoringPool {
    /// Initialize working capital pool with liquidity token and underwriting params
    pub fn init(env: Env, liquidity_token: Address, base_fee_bps: u32, ltv_bps: u32) {
        if env.storage().instance().has(&FactoringKey::Config) {
            panic!("already initialized");
        }
        let config = PoolConfig {
            liquidity_token,
            total_liquidity: 0,
            total_advanced: 0,
            base_fee_bps,
            ltv_bps,
        };
        env.storage().instance().set(&FactoringKey::Config, &config);
    }

    /// Liquidity providers supply capital to earn factoring discount fees
    pub fn deposit_liquidity(env: Env, provider: Address, amount: i128) {
        provider.require_auth();
        if amount <= 0 {
            panic!("invalid amount");
        }

        let mut config: PoolConfig = env
            .storage()
            .instance()
            .get(&FactoringKey::Config)
            .expect("not initialized");

        let token_client = token::Client::new(&env, &config.liquidity_token);
        token_client.transfer(&provider, &env.current_contract_address(), &amount);

        let current_deposit: i128 = env
            .storage()
            .persistent()
            .get(&FactoringKey::ProviderDeposit(provider.clone()))
            .unwrap_or(0);

        env.storage()
            .persistent()
            .set(&FactoringKey::ProviderDeposit(provider.clone()), &(current_deposit + amount));

        config.total_liquidity += amount;
        env.storage().instance().set(&FactoringKey::Config, &config);

        env.events()
            .publish((symbol_short!("LpDeposit"), provider), amount);
    }

    /// Liquidity providers withdraw unutilized capital
    pub fn withdraw_liquidity(env: Env, provider: Address, amount: i128) {
        provider.require_auth();
        if amount <= 0 {
            panic!("invalid amount");
        }

        let mut config: PoolConfig = env
            .storage()
            .instance()
            .get(&FactoringKey::Config)
            .expect("not initialized");

        let mut current_deposit: i128 = env
            .storage()
            .persistent()
            .get(&FactoringKey::ProviderDeposit(provider.clone()))
            .unwrap_or(0);

        if current_deposit < amount {
            panic!("insufficient provider balance");
        }

        let available_liquidity = config.total_liquidity - config.total_advanced;
        if amount > available_liquidity {
            panic!("liquidity currently locked in active advances");
        }

        current_deposit -= amount;
        config.total_liquidity -= amount;

        env.storage()
            .persistent()
            .set(&FactoringKey::ProviderDeposit(provider.clone()), &current_deposit);
        env.storage().instance().set(&FactoringKey::Config, &config);

        let token_client = token::Client::new(&env, &config.liquidity_token);
        token_client.transfer(&env.current_contract_address(), &provider, &amount);

        env.events()
            .publish((symbol_short!("LpWithdr"), provider), amount);
    }

    /// Merchant requests instant 80% cash advance against verified unpaid invoice
    pub fn advance_invoice(
        env: Env,
        merchant: Address,
        invoice_id: u64,
        total_amount: i128,
        due_date: u64,
    ) -> i128 {
        merchant.require_auth();
        let mut config: PoolConfig = env
            .storage()
            .instance()
            .get(&FactoringKey::Config)
            .expect("not initialized");

        if env
            .storage()
            .persistent()
            .has(&FactoringKey::Position(invoice_id))
        {
            panic!("invoice already factored");
        }

        let advance_amount = (total_amount * (config.ltv_bps as i128)) / 10_000;
        let discount_fee = (total_amount * (config.base_fee_bps as i128)) / 10_000;

        let available_liquidity = config.total_liquidity - config.total_advanced;
        if advance_amount > available_liquidity {
            panic!("insufficient pool liquidity");
        }

        let position = FactoringPosition {
            invoice_id,
            merchant: merchant.clone(),
            total_invoice_amount: total_amount,
            advance_amount,
            discount_fee,
            status: FactoringStatus::Active,
            funded_at: env.ledger().timestamp(),
            due_date,
        };

        config.total_advanced += advance_amount;
        env.storage().instance().set(&FactoringKey::Config, &config);
        env.storage()
            .persistent()
            .set(&FactoringKey::Position(invoice_id), &position);

        // Disburse 80% advance instantly to merchant wallet
        let token_client = token::Client::new(&env, &config.liquidity_token);
        token_client.transfer(&env.current_contract_address(), &merchant, &advance_amount);

        env.events()
            .publish((symbol_short!("Advance"), merchant), (invoice_id, advance_amount));

        advance_amount
    }

    /// Settle factored invoice: Repay pool principal + fee and forward remainder to merchant
    pub fn settle_factored_payment(env: Env, invoice_id: u64, incoming_amount: i128) {
        let mut position: FactoringPosition = env
            .storage()
            .persistent()
            .get(&FactoringKey::Position(invoice_id))
            .expect("factoring position not found");

        if position.status != FactoringStatus::Active {
            panic!("position not active");
        }

        let mut config: PoolConfig = env
            .storage()
            .instance()
            .get(&FactoringKey::Config)
            .expect("not initialized");

        let pool_repayment = position.advance_amount + position.discount_fee;
        let merchant_remainder = incoming_amount.saturating_sub(pool_repayment);

        config.total_advanced = config.total_advanced.saturating_sub(position.advance_amount);
        config.total_liquidity += position.discount_fee; // Discount fee compounds into pool

        position.status = FactoringStatus::Settled;
        env.storage()
            .persistent()
            .set(&FactoringKey::Position(invoice_id), &position);
        env.storage().instance().set(&FactoringKey::Config, &config);

        let token_client = token::Client::new(&env, &config.liquidity_token);

        // Forward remainder to merchant
        if merchant_remainder > 0 {
            token_client.transfer(&env.current_contract_address(), &position.merchant, &merchant_remainder);
        }

        env.events().publish(
            (symbol_short!("FactSetl"), position.merchant),
            (invoice_id, merchant_remainder),
        );
    }

    /// Query current pool configuration and stats
    pub fn get_pool_config(env: Env) -> PoolConfig {
        env.storage()
            .instance()
            .get(&FactoringKey::Config)
            .expect("not initialized")
    }

    /// Query factoring position by invoice ID
    pub fn get_position(env: Env, invoice_id: u64) -> FactoringPosition {
        env.storage()
            .persistent()
            .get(&FactoringKey::Position(invoice_id))
            .expect("position not found")
    }
}
