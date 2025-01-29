use anchor_lang::prelude::*;
use anchor_lang::solana_program::clock::Clock;

declare_id!("FAASs3638wEGwWxhp8EkaDuU2ENV1r4c1nJPN9fHLGtp"); // Replace with your program ID

#[program]
pub mod gtopia_citizenship {
    use super::*;

    pub fn initialize(
        ctx: Context<Initialize>,
        normal_citizenship_price: u64,
        senior_citizenship_price: u64,
        normal_visa_price_per_hour: u64,
        senior_visa_price_per_hour: u64,
    ) -> Result<()> {
        let state = &mut ctx.accounts.state;
        state.authority = ctx.accounts.authority.key();
        state.normal_citizenship_price = normal_citizenship_price;
        state.senior_citizenship_price = senior_citizenship_price;
        state.normal_visa_price_per_hour = normal_visa_price_per_hour;
        state.senior_visa_price_per_hour = senior_visa_price_per_hour;
        Ok(())
    }

    pub fn purchase_citizenship(ctx: Context<PurchaseCitizenship>, is_senior: bool) -> Result<()> {
        let state = &ctx.accounts.state;
        let clock = Clock::get()?;

        // Calculate price based on citizenship type
        let price = if is_senior {
            state.senior_citizenship_price
        } else {
            state.normal_citizenship_price
        };

        // Transfer payment
        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            anchor_lang::system_program::Transfer {
                from: ctx.accounts.payer.to_account_info(),
                to: ctx.accounts.authority.to_account_info(),
            },
        );
        anchor_lang::system_program::transfer(cpi_context, price)?;

        // Create citizenship record
        let citizenship = &mut ctx.accounts.citizenship;
        citizenship.owner = ctx.accounts.payer.key();
        citizenship.is_senior = is_senior;
        citizenship.start_time = clock.unix_timestamp;
        citizenship.expiry_time = clock.unix_timestamp + (365 * 24 * 60 * 60); // 1 year in seconds
        citizenship.is_active = true;

        Ok(())
    }

    pub fn purchase_visa(
        ctx: Context<PurchaseVisa>,
        is_senior: bool,
        duration_hours: u64,
    ) -> Result<()> {
        require!(duration_hours > 0, CustomError::InvalidDuration);
        require!(duration_hours <= 30 * 24, CustomError::DurationTooLong); // Max 30 days

        let state = &ctx.accounts.state;
        let clock = Clock::get()?;

        // Calculate price based on visa type and duration
        let price_per_hour = if is_senior {
            state.senior_visa_price_per_hour
        } else {
            state.normal_visa_price_per_hour
        };
        let total_price = price_per_hour * duration_hours;

        // Transfer payment
        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            anchor_lang::system_program::Transfer {
                from: ctx.accounts.payer.to_account_info(),
                to: ctx.accounts.authority.to_account_info(),
            },
        );
        anchor_lang::system_program::transfer(cpi_context, total_price)?;

        // Create visa record
        let visa = &mut ctx.accounts.visa;
        visa.owner = ctx.accounts.payer.key();
        visa.is_senior = is_senior;
        visa.start_time = clock.unix_timestamp;
        visa.expiry_time = clock.unix_timestamp + (duration_hours as i64 * 3600); // Convert hours to seconds
        visa.is_active = true;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 8 + 8 + 8 + 8,
        seeds = [b"state".as_ref()],
        bump
    )]
    pub state: Account<'info, ProgramState>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct PurchaseCitizenship<'info> {
    #[account(mut)]
    pub state: Account<'info, ProgramState>,
    #[account(
        init,
        payer = payer,
        space = 8 + 32 + 1 + 8 + 8 + 1,
        seeds = [b"citizenship", payer.key().as_ref()],
        bump
    )]
    pub citizenship: Account<'info, Citizenship>,
    /// CHECK: This is the wallet that will receive the payment
    #[account(mut)]
    pub authority: AccountInfo<'info>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct PurchaseVisa<'info> {
    #[account(mut)]
    pub state: Account<'info, ProgramState>,
    #[account(
        init,
        payer = payer,
        space = 8 + 32 + 1 + 8 + 8 + 1,
        seeds = [b"visa", payer.key().as_ref()],
        bump
    )]
    pub visa: Account<'info, Visa>,
    /// CHECK: This is the wallet that will receive the payment
    #[account(mut)]
    pub authority: AccountInfo<'info>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct ProgramState {
    pub authority: Pubkey,
    pub normal_citizenship_price: u64,
    pub senior_citizenship_price: u64,
    pub normal_visa_price_per_hour: u64,
    pub senior_visa_price_per_hour: u64,
}

#[account]
pub struct Citizenship {
    pub owner: Pubkey,
    pub is_senior: bool,
    pub start_time: i64,
    pub expiry_time: i64,
    pub is_active: bool,
}

#[account]
pub struct Visa {
    pub owner: Pubkey,
    pub is_senior: bool,
    pub start_time: i64,
    pub expiry_time: i64,
    pub is_active: bool,
}

#[error_code]
pub enum CustomError {
    #[msg("Duration must be greater than 0")]
    InvalidDuration,
    #[msg("Visa duration cannot exceed 30 days")]
    DurationTooLong,
}
