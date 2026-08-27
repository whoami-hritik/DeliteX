#![cfg(test)]

use super::*;
use soroban_sdk::{
    testutils::{Address as _, Ledger},
    token::{StellarAssetClient, Client as TokenClient},
    vec, Address, Env,
};

#[test]
fn test_treasury_init_and_batch_payroll() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let owner1 = Address::generate(&env);
    let owner2 = Address::generate(&env);
    let owner3 = Address::generate(&env);

    let recipient1 = Address::generate(&env);
    let recipient2 = Address::generate(&env);

    let token_contract = env.register_stellar_asset_contract_v2(admin.clone());
    let token_client = TokenClient::new(&env, &token_contract.address());
    let stellar_token_client = StellarAssetClient::new(&env, &token_contract.address());

    let treasury_id = env.register(TreasuryVault, ());
    let treasury_client = TreasuryVaultClient::new(&env, &treasury_id);

    let owners = vec![&env, owner1.clone(), owner2.clone(), owner3.clone()];
    treasury_client.init(&owners, &2u32, &token_contract.address());

    // Verify config
    let config = treasury_client.get_config();
    assert_eq!(config.threshold, 2);
    assert_eq!(config.owners.len(), 3);

    // Fund the treasury with 10,000 tokens
    stellar_token_client.mint(&treasury_id, &10_000_0000000);
    assert_eq!(token_client.balance(&treasury_id), 10_000_0000000);

    // 1. Propose Payroll (1000 tokens to recipient1, 2000 tokens to recipient2)
    let payout_items = vec![
        &env,
        PayoutItem {
            recipient: recipient1.clone(),
            amount: 1_000_0000000,
        },
        PayoutItem {
            recipient: recipient2.clone(),
            amount: 2_000_0000000,
        },
    ];

    let deadline = env.ledger().timestamp() + 86400; // 24 hours
    let proposal_id = treasury_client.propose_payroll(&owner1, &payout_items, &deadline);
    assert_eq!(proposal_id, 1);

    let proposal = treasury_client.get_proposal(&proposal_id);
    assert_eq!(proposal.total_amount, 3_000_0000000);
    assert_eq!(proposal.approvals.len(), 1); // Proposer automatically approves
    assert_eq!(proposal.executed, false);

    // 2. Owner 2 approves proposal
    treasury_client.approve_payroll(&owner2, &proposal_id);
    let proposal_after_approval = treasury_client.get_proposal(&proposal_id);
    assert_eq!(proposal_after_approval.approvals.len(), 2);

    // 3. Execute payroll
    treasury_client.execute_payroll(&owner1, &proposal_id);

    // Verify balances
    assert_eq!(token_client.balance(&recipient1), 1_000_0000000);
    assert_eq!(token_client.balance(&recipient2), 2_000_0000000);
    assert_eq!(token_client.balance(&treasury_id), 7_000_0000000);

    let executed_proposal = treasury_client.get_proposal(&proposal_id);
    assert_eq!(executed_proposal.executed, true);
}
