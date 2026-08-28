#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, token, Address, Env};

#[contracttype]
#[derive(Clone, Copy, Debug, PartialEq)]
pub enum InvoiceStatus {
    Unpaid = 0,
    Paid = 1,
    Cancelled = 2,
}

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct Invoice {
    pub id: u64,
    pub merchant: Address,     // Payee address
    pub target_token: Address, // Settlement token asset (e.g. USDC SAC)
    pub amount_due: i128,      // Amount due
    pub status: InvoiceStatus,
    pub payer: Option<Address>,
    pub created_at: u64,
    pub paid_at: u64,
}

#[contracttype]
pub enum DataKey {
    InvoiceCount,
    Invoice(u64),
}

#[contract]
pub struct InvoiceRouter;

#[contractimpl]
impl InvoiceRouter {
    /// Create a new on-chain invoice
    pub fn create_invoice(
        env: Env,
        merchant: Address,
        target_token: Address,
        amount_due: i128,
    ) -> u64 {
        merchant.require_auth();
        if amount_due <= 0 {
            panic!("invalid amount");
        }

        let mut count: u64 = env
            .storage()
            .instance()
            .get(&DataKey::InvoiceCount)
            .unwrap_or(0);
        count += 1;

        let invoice = Invoice {
            id: count,
            merchant: merchant.clone(),
            target_token,
            amount_due,
            status: InvoiceStatus::Unpaid,
            payer: None,
            created_at: env.ledger().timestamp(),
            paid_at: 0,
        };

        env.storage()
            .persistent()
            .set(&DataKey::Invoice(count), &invoice);
        env.storage().instance().set(&DataKey::InvoiceCount, &count);

        env.events()
            .publish((symbol_short!("Created"), merchant), (count, amount_due));

        count
    }

    /// Settle invoice: Payer transfers target tokens directly to merchant
    pub fn settle_invoice(env: Env, payer: Address, invoice_id: u64) {
        payer.require_auth();

        let mut invoice: Invoice = env
            .storage()
            .persistent()
            .get(&DataKey::Invoice(invoice_id))
            .expect("invoice not found");

        if invoice.status != InvoiceStatus::Unpaid {
            panic!("invoice not unpaid");
        }

        let token_client = token::Client::new(&env, &invoice.target_token);

        // Transfer target tokens from payer directly to merchant
        token_client.transfer(&payer, &invoice.merchant, &invoice.amount_due);

        // Update on-chain status
        invoice.status = InvoiceStatus::Paid;
        invoice.payer = Some(payer.clone());
        invoice.paid_at = env.ledger().timestamp();

        env.storage()
            .persistent()
            .set(&DataKey::Invoice(invoice_id), &invoice);

        env.events().publish(
            (symbol_short!("Settled"), invoice.merchant),
            (invoice_id, invoice.amount_due),
        );
    }

    /// Cancel an unpaid invoice
    pub fn cancel_invoice(env: Env, merchant: Address, invoice_id: u64) {
        merchant.require_auth();

        let mut invoice: Invoice = env
            .storage()
            .persistent()
            .get(&DataKey::Invoice(invoice_id))
            .expect("invoice not found");

        if invoice.merchant != merchant {
            panic!("unauthorized merchant");
        }
        if invoice.status != InvoiceStatus::Unpaid {
            panic!("cannot cancel settled invoice");
        }

        invoice.status = InvoiceStatus::Cancelled;
        env.storage()
            .persistent()
            .set(&DataKey::Invoice(invoice_id), &invoice);

        env.events()
            .publish((symbol_short!("Cancel"), merchant), invoice_id);
    }

    /// Retrieve invoice details by ID
    pub fn get_invoice(env: Env, invoice_id: u64) -> Invoice {
        env.storage()
            .persistent()
            .get(&DataKey::Invoice(invoice_id))
            .expect("invoice not found")
    }

    /// Total count of registered invoices
    pub fn get_invoice_count(env: Env) -> u64 {
        env.storage()
            .instance()
            .get(&DataKey::InvoiceCount)
            .unwrap_or(0)
    }
}
