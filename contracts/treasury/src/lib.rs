#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, token, Address, Env, Vec,
};

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct TreasuryConfig {
    pub owners: Vec<Address>,
    pub threshold: u32,
    pub token: Address,
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

#[contract]
pub struct TreasuryVault;

#[contractimpl]
impl TreasuryVault {
    /// Initialize the Treasury with M-of-N owners, threshold, and payout token
    pub fn init(env: Env, owners: Vec<Address>, threshold: u32, token: Address) {
        if env.storage().instance().has(&DataKey::Config) {
            panic!("already initialized");
        }
        if threshold == 0 || threshold > owners.len() {
            panic!("invalid threshold");
        }
        let config = TreasuryConfig {
            owners,
            threshold,
            token,
        };
        env.storage().instance().set(&DataKey::Config, &config);
        env.storage().instance().set(&DataKey::ProposalCount, &0u64);
    }

    /// Submit a batch payroll proposal
    pub fn propose_payroll(
        env: Env,
        proposer: Address,
        items: Vec<PayoutItem>,
        deadline: u64,
    ) -> u64 {
        proposer.require_auth();
        let config: TreasuryConfig = env
            .storage()
            .instance()
            .get(&DataKey::Config)
            .expect("not initialized");

        // Verify proposer is an owner
        let mut is_owner = false;
        for owner in config.owners.iter() {
            if owner == proposer {
                is_owner = true;
                break;
            }
        }
        if !is_owner {
            panic!("unauthorized proposer");
        }

        if items.is_empty() {
            panic!("empty items list");
        }

        let mut total: i128 = 0;
        for item in items.iter() {
            if item.amount <= 0 {
                panic!("invalid item amount");
            }
            total += item.amount;
        }

        let mut count: u64 = env
            .storage()
            .instance()
            .get(&DataKey::ProposalCount)
            .unwrap_or(0);
        count += 1;

        let mut approvals = Vec::new(&env);
        approvals.push_back(proposer.clone());

        let proposal = PayrollProposal {
            id: count,
            proposer: proposer.clone(),
            items,
            total_amount: total,
            approvals,
            executed: false,
            deadline,
        };

        env.storage()
            .persistent()
            .set(&DataKey::Proposal(count), &proposal);
        env.storage().instance().set(&DataKey::ProposalCount, &count);

        env.events()
            .publish((symbol_short!("Propose"), proposer), (count, total));

        count
    }

    /// Approve an existing batch payroll proposal
    pub fn approve_payroll(env: Env, approver: Address, proposal_id: u64) {
        approver.require_auth();
        let config: TreasuryConfig = env
            .storage()
            .instance()
            .get(&DataKey::Config)
            .expect("not initialized");

        let mut is_owner = false;
        for owner in config.owners.iter() {
            if owner == approver {
                is_owner = true;
                break;
            }
        }
        if !is_owner {
            panic!("unauthorized approver");
        }

        let mut proposal: PayrollProposal = env
            .storage()
            .persistent()
            .get(&DataKey::Proposal(proposal_id))
            .expect("proposal not found");

        if proposal.executed {
            panic!("proposal already executed");
        }
        if env.ledger().timestamp() > proposal.deadline {
            panic!("proposal expired");
        }

        for existing_approver in proposal.approvals.iter() {
            if existing_approver == approver {
                panic!("already approved");
            }
        }

        proposal.approvals.push_back(approver.clone());
        env.storage()
            .persistent()
            .set(&DataKey::Proposal(proposal_id), &proposal);

        env.events()
            .publish((symbol_short!("Approve"), approver), proposal_id);
    }

    /// Execute atomic batch transfer once threshold is satisfied
    pub fn execute_payroll(env: Env, executor: Address, proposal_id: u64) {
        executor.require_auth();
        let config: TreasuryConfig = env
            .storage()
            .instance()
            .get(&DataKey::Config)
            .expect("not initialized");

        let mut proposal: PayrollProposal = env
            .storage()
            .persistent()
            .get(&DataKey::Proposal(proposal_id))
            .expect("proposal not found");

        if proposal.executed {
            panic!("already executed");
        }
        if proposal.approvals.len() < config.threshold {
            panic!("threshold not reached");
        }

        let token_client = token::Client::new(&env, &config.token);
        let contract_address = env.current_contract_address();

        // Atomic multi-transfer loop
        for item in proposal.items.iter() {
            token_client.transfer(&contract_address, &item.recipient, &item.amount);
        }

        proposal.executed = true;
        env.storage()
            .persistent()
            .set(&DataKey::Proposal(proposal_id), &proposal);

        env.events().publish(
            (symbol_short!("Execute"), executor),
            (proposal_id, proposal.total_amount),
        );
    }

    /// Get current Treasury Configuration
    pub fn get_config(env: Env) -> TreasuryConfig {
        env.storage()
            .instance()
            .get(&DataKey::Config)
            .expect("not initialized")
    }

    /// Get proposal by ID
    pub fn get_proposal(env: Env, proposal_id: u64) -> PayrollProposal {
        env.storage()
            .persistent()
            .get(&DataKey::Proposal(proposal_id))
            .expect("proposal not found")
    }

    /// Get total proposals count
    pub fn get_proposal_count(env: Env) -> u64 {
        env.storage()
            .instance()
            .get(&DataKey::ProposalCount)
            .unwrap_or(0)
    }
}

