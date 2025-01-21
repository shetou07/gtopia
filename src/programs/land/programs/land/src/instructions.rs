//instruction.rs
use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{self, Mint, Token, TokenAccount},
};
use crate::state::*;

#[derive(Accounts)]
#[instruction(args: InitializeCountryArgs)]
pub struct InitializeCountry<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + std::mem::size_of::<CountryState>() + 1000,
        seeds = [b"country"],
        bump
    )]
    pub country: Account<'info, CountryState>,

    #[account(
        init,
        payer = authority,
        space = 8 + std::mem::size_of::<GridState>() + 1000,
        seeds = [b"grid"],
        bump
    )]
    pub grid: Account<'info, GridState>,

    pub payment_mint: Account<'info, Mint>,

    /// CHECK: This is safe as it's just used as a key for the treasury
    pub treasury: AccountInfo<'info>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>, // Add this line
}

#[derive(Accounts)]
#[instruction(args: PurchaseLandArgs)]
pub struct PurchaseLand<'info> {
    #[account(mut)]
    pub country: Account<'info, CountryState>,

    #[account(mut)]
    pub grid: Account<'info, GridState>,

    #[account(
        init,
        payer = buyer,
        space = 8 + std::mem::size_of::<LandPlot>()
    )]
    pub land_plot: Account<'info, LandPlot>,

    #[account(
        mut,
        constraint = buyer_token.mint == country.payment_mint,
        constraint = buyer_token.owner == buyer.key()
    )]
    pub buyer_token: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = treasury_token.mint == country.payment_mint,
        constraint = treasury_token.owner == country.treasury
    )]
    pub treasury_token: Account<'info, TokenAccount>,

    #[account(mut)]
    pub buyer: Signer<'info>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(args: SplitPlotArgs)]
pub struct SplitPlot<'info> {
    #[account(mut)]
    pub grid: Account<'info, GridState>,

    #[account(
        mut,
        constraint = original_plot.owner == owner.key()
    )]
    pub original_plot: Account<'info, LandPlot>,

    #[account(
        init,
        payer = owner,
        space = 8 + std::mem::size_of::<LandPlot>()
    )]
    pub new_plot: Account<'info, LandPlot>,

    #[account(mut)]
    pub owner: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct MergePlots<'info> {
    #[account(mut)]
    pub grid: Account<'info, GridState>,

    #[account(
        mut,
        constraint = plot_a.owner == owner.key()
    )]
    pub plot_a: Account<'info, LandPlot>,

    #[account(
        mut,
        constraint = plot_b.owner == owner.key(),
        close = owner
    )]
    pub plot_b: Account<'info, LandPlot>,

    #[account(mut)]
    pub owner: Signer<'info>,

    pub system_program: Program<'info, System>,
}
