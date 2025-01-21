// payment.rs
use anchor_lang::prelude::*;
use anchor_spl::token::{self, TokenAccount, Transfer};
use crate::error::LandError;

pub fn process_payment<'info>(
    amount: u64,
    from: &Account<'info, TokenAccount>,
    to: &Account<'info, TokenAccount>,
    authority: &Signer<'info>,
    token_program: &Program<'info, token::Token>,
) -> Result<()> {
    token::transfer(
        CpiContext::new(
            token_program.to_account_info(),
            Transfer {
                from: from.to_account_info(),
                to: to.to_account_info(),
                authority: authority.to_account_info(),
            },
        ),
        amount,
    )
}

pub fn calculate_tax(amount: u64, tax_rate: u64) -> Result<u64> {
    amount
        .checked_mul(tax_rate)
        .and_then(|product| product.checked_div(10000))
        .ok_or(error!(LandError::CalculationError))
}
