#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, token, Address, Env};

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct VaultState {
    pub underlying_token: Address, // SEP-41 USDC Asset
    pub total_shares: i128,        // Total share supply minted
    pub total_deposited: i128,     // Principal amount in pool
    pub apy_basis_points: u32,     // Annual yield basis points (e.g. 740 = 7.40%)
    pub last_update: u64,          // Timestamp of last yield checkpoint
}

#[contracttype]
pub enum SweeperKey {
    State,
    UserShares(Address),
    UserDeposit(Address),
}

const SECONDS_PER_YEAR: u64 = 31_536_000;
const BPS_DIVISOR: i128 = 10_000;

#[contract]
pub struct YieldSweeperVault;

#[contractimpl]
impl YieldSweeperVault {
    /// Initialize the Yield Sweeper Vault with underlying token and base APY
    pub fn init(env: Env, underlying_token: Address, apy_basis_points: u32) {
        if env.storage().instance().has(&SweeperKey::State) {
            panic!("already initialized");
        }
        let state = VaultState {
            underlying_token,
            total_shares: 0,
            total_deposited: 0,
            apy_basis_points,
            last_update: env.ledger().timestamp(),
        };
        env.storage().instance().set(&SweeperKey::State, &state);
    }

    /// Deposit underlying token and receive yield-compounding shares
    pub fn deposit(env: Env, from: Address, amount: i128) -> i128 {
        from.require_auth();
        if amount <= 0 {
            panic!("invalid deposit amount");
        }

        let mut state: VaultState = env
            .storage()
            .instance()
            .get(&SweeperKey::State)
            .expect("not initialized");

        // Accrue pending yield before modifying balances
        Self::accrue_yield(&env, &mut state);

        let token_client = token::Client::new(&env, &state.underlying_token);
        let contract_address = env.current_contract_address();

        // Transfer funds from user to Vault
        token_client.transfer(&from, &contract_address, &amount);

        // Share minting math (1:1 base, or scaled to pool growth)
        let shares_to_mint = if state.total_shares == 0 || state.total_deposited == 0 {
            amount
        } else {
            (amount * state.total_shares) / state.total_deposited
        };

        let current_user_shares: i128 = env
            .storage()
            .persistent()
            .get(&SweeperKey::UserShares(from.clone()))
            .unwrap_or(0);

        let current_user_deposit: i128 = env
            .storage()
            .persistent()
            .get(&SweeperKey::UserDeposit(from.clone()))
            .unwrap_or(0);

        env.storage()
            .persistent()
            .set(&SweeperKey::UserShares(from.clone()), &(current_user_shares + shares_to_mint));

        env.storage()
            .persistent()
            .set(&SweeperKey::UserDeposit(from.clone()), &(current_user_deposit + amount));

        state.total_shares += shares_to_mint;
        state.total_deposited += amount;
        env.storage().instance().set(&SweeperKey::State, &state);

        env.events()
            .publish((symbol_short!("Deposit"), from), (amount, shares_to_mint));

        shares_to_mint
    }

    /// Withdraw underlying tokens by burning shares (redeeming principal + accrued yield)
    pub fn withdraw(env: Env, from: Address, shares: i128) -> i128 {
        from.require_auth();
        if shares <= 0 {
            panic!("invalid share amount");
        }

        let mut state: VaultState = env
            .storage()
            .instance()
            .get(&SweeperKey::State)
            .expect("not initialized");

        Self::accrue_yield(&env, &mut state);

        let mut user_shares: i128 = env
            .storage()
            .persistent()
            .get(&SweeperKey::UserShares(from.clone()))
            .unwrap_or(0);

        if user_shares < shares {
            panic!("insufficient shares");
        }

        // Calculate proportional underlying token payout
        let underlying_payout = (shares * state.total_deposited) / state.total_shares;

        user_shares -= shares;
        state.total_shares -= shares;
        state.total_deposited -= underlying_payout;

        env.storage()
            .persistent()
            .set(&SweeperKey::UserShares(from.clone()), &user_shares);
        env.storage().instance().set(&SweeperKey::State, &state);

        let token_client = token::Client::new(&env, &state.underlying_token);
        token_client.transfer(&env.current_contract_address(), &from, &underlying_payout);

        env.events()
            .publish((symbol_short!("Withdraw"), from), (shares, underlying_payout));

        underlying_payout
    }

    /// Atomic Sweep & Pay: Burns exact shares needed and transfers funds directly to recipient in one call
    pub fn sweep_and_pay(env: Env, owner: Address, recipient: Address, amount: i128) {
        owner.require_auth();
        if amount <= 0 {
            panic!("invalid sweep amount");
        }

        let mut state: VaultState = env
            .storage()
            .instance()
            .get(&SweeperKey::State)
            .expect("not initialized");

        Self::accrue_yield(&env, &mut state);

        if state.total_deposited <= 0 || state.total_shares <= 0 {
            panic!("empty vault");
        }

        // Calculate exact shares required to cover `amount`
        let shares_needed = (amount * state.total_shares) / state.total_deposited;
        let mut user_shares: i128 = env
            .storage()
            .persistent()
            .get(&SweeperKey::UserShares(owner.clone()))
            .unwrap_or(0);

        if user_shares < shares_needed {
            panic!("insufficient vault liquidity");
        }

        user_shares -= shares_needed;
        state.total_shares -= shares_needed;
        state.total_deposited -= amount;

        env.storage()
            .persistent()
            .set(&SweeperKey::UserShares(owner.clone()), &user_shares);
        env.storage().instance().set(&SweeperKey::State, &state);

        // Disburse directly to recipient atomically
        let token_client = token::Client::new(&env, &state.underlying_token);
        token_client.transfer(&env.current_contract_address(), &recipient, &amount);

        env.events().publish(
            (symbol_short!("SweepPay"), owner),
            (recipient, amount),
        );
    }

    /// Query the current vault configuration and total balances
    pub fn get_vault_state(env: Env) -> VaultState {
        let mut state: VaultState = env
            .storage()
            .instance()
            .get(&SweeperKey::State)
            .expect("not initialized");
        Self::accrue_yield(&env, &mut state);
        state
    }

    /// Query user's current shares and live redeemable underlying token balance
    pub fn get_user_position(env: Env, user: Address) -> (i128, i128) {
        let mut state: VaultState = env
            .storage()
            .instance()
            .get(&SweeperKey::State)
            .expect("not initialized");
        Self::accrue_yield(&env, &mut state);

        let shares: i128 = env
            .storage()
            .persistent()
            .get(&SweeperKey::UserShares(user))
            .unwrap_or(0);

        let underlying = if state.total_shares == 0 {
            0
        } else {
            (shares * state.total_deposited) / state.total_shares
        };

        (shares, underlying)
    }

    /// Helper to accrue automated compound yield based on elapsed ledger time
    fn accrue_yield(env: &Env, state: &mut VaultState) {
        let now = env.ledger().timestamp();
        let elapsed = now.saturating_sub(state.last_update);
        if elapsed == 0 || state.total_deposited == 0 {
            return;
        }

        // Accrued Interest = total_deposited * apy_bps * elapsed / (SECONDS_PER_YEAR * 10,000)
        let interest = (state.total_deposited
            * (state.apy_basis_points as i128)
            * (elapsed as i128))
            / ((SECONDS_PER_YEAR as i128) * BPS_DIVISOR);

        if interest > 0 {
            state.total_deposited += interest;
            state.last_update = now;
        }
    }
}
