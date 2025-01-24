use anchor_lang::prelude::*;

declare_id!("puwD5S1FtQFqhxNTAq7EEjGzz3hoWnyNRHmx4wAZzTo");

#[program]
pub mod gtopia_land {
    use super::*;

    pub fn create_land_plot(
        ctx: Context<CreateLandPlot>,
        start_x: u64,
        start_y: u64,
        width: u64,
        height: u64,
    ) -> Result<()> {
        let land_plot = &mut ctx.accounts.land_plot;

        land_plot.owner = ctx.accounts.creator.key();
        land_plot.start_x = start_x;
        land_plot.start_y = start_y;
        land_plot.width = width;
        land_plot.height = height;

        Ok(())
    }

    pub fn list_for_sale(
        ctx: Context<ListLand>,
        start_x: u64,
        start_y: u64,
        width: u64,
        height: u64,
        price_per_unit: u64,
    ) -> Result<()> {
        let land_plot = &mut ctx.accounts.land_plot;

        // Verify owner
        require!(
            land_plot.owner == ctx.accounts.owner.key(),
            LandError::NotOwner
        );

        // Verify dimensions are within owned plot
        require!(
            start_x >= land_plot.start_x
                && start_y >= land_plot.start_y
                && (start_x + width) <= (land_plot.start_x + land_plot.width)
                && (start_y + height) <= (land_plot.start_y + land_plot.height),
            LandError::InvalidDimensions
        );

        require!(!land_plot.is_for_rent, LandError::AlreadyRented);

        land_plot.is_for_sale = true;
        land_plot.sale_start_x = start_x;
        land_plot.sale_start_y = start_y;
        land_plot.sale_width = width;
        land_plot.sale_height = height;
        land_plot.price_per_unit = price_per_unit;

        Ok(())
    }

    pub fn remove_from_sale(ctx: Context<ListLand>) -> Result<()> {
        let land_plot = &mut ctx.accounts.land_plot;
        require!(
            land_plot.owner == ctx.accounts.owner.key(),
            LandError::NotOwner
        );

        land_plot.is_for_sale = false;
        land_plot.price_per_unit = 0;
        land_plot.sale_width = 0;
        land_plot.sale_height = 0;

        Ok(())
    }

    pub fn list_for_rent(
        ctx: Context<ListLand>,
        start_x: u64,
        start_y: u64,
        width: u64,
        height: u64,
        rental_price: u64,
    ) -> Result<()> {
        let land_plot = &mut ctx.accounts.land_plot;

        require!(
            land_plot.owner == ctx.accounts.owner.key(),
            LandError::NotOwner
        );

        // Verify dimensions
        require!(
            start_x >= land_plot.start_x
                && start_y >= land_plot.start_y
                && (start_x + width) <= (land_plot.start_x + land_plot.width)
                && (start_y + height) <= (land_plot.start_y + land_plot.height),
            LandError::InvalidDimensions
        );

        require!(!land_plot.is_for_sale, LandError::CurrentlyForSale);

        land_plot.is_for_rent = true;
        land_plot.rental_start_x = start_x;
        land_plot.rental_start_y = start_y;
        land_plot.rental_width = width;
        land_plot.rental_height = height;
        land_plot.rental_price = rental_price;

        Ok(())
    }

    pub fn remove_from_rent(ctx: Context<ListLand>) -> Result<()> {
        let land_plot = &mut ctx.accounts.land_plot;
        require!(
            land_plot.owner == ctx.accounts.owner.key(),
            LandError::NotOwner
        );

        land_plot.is_for_rent = false;
        land_plot.rental_price = 0;
        land_plot.rental_width = 0;
        land_plot.rental_height = 0;
        land_plot.rental_end_time = 0;
        land_plot.renter = Pubkey::default();

        Ok(())
    }

    pub fn buy_land(
        ctx: Context<BuyLand>,
        purchase_start_x: u64,
        purchase_start_y: u64,
        purchase_width: u64,
        purchase_height: u64,
    ) -> Result<()> {
        let original_plot = &ctx.accounts.original_plot;
        let new_plot = &mut ctx.accounts.new_plot;

        require!(original_plot.is_for_sale, LandError::NotForSale);

        // Verify purchase dimensions are within listed sale area
        require!(
            purchase_start_x >= original_plot.sale_start_x
                && purchase_start_y >= original_plot.sale_start_y
                && (purchase_start_x + purchase_width)
                    <= (original_plot.sale_start_x + original_plot.sale_width)
                && (purchase_start_y + purchase_height)
                    <= (original_plot.sale_start_y + original_plot.sale_height),
            LandError::InvalidDimensions
        );

        // Calculate total price
        let total_price = original_plot
            .price_per_unit
            .checked_mul(purchase_width)
            .ok_or(LandError::CalculationError)?
            .checked_mul(purchase_height)
            .ok_or(LandError::CalculationError)?;

        // Transfer SOL to current owner
        **ctx.accounts.buyer.try_borrow_mut_lamports()? = ctx
            .accounts
            .buyer
            .lamports()
            .checked_sub(total_price)
            .ok_or(LandError::InsufficientFunds)?;
        **ctx.accounts.current_owner.try_borrow_mut_lamports()? = ctx
            .accounts
            .current_owner
            .lamports()
            .checked_add(total_price)
            .ok_or(LandError::CalculationError)?;

        // Initialize new plot for buyer
        new_plot.owner = ctx.accounts.buyer.key();
        new_plot.start_x = purchase_start_x;
        new_plot.start_y = purchase_start_y;
        new_plot.width = purchase_width;
        new_plot.height = purchase_height;
        new_plot.is_for_sale = false;
        new_plot.is_for_rent = false;

        Ok(())
    }

    pub fn rent_land(
        ctx: Context<RentLand>,
        rental_start_x: u64,
        rental_start_y: u64,
        rental_width: u64,
        rental_height: u64,
        rental_duration_days: i64,
    ) -> Result<()> {
        let land_plot = &mut ctx.accounts.land_plot;

        require!(land_plot.is_for_rent, LandError::NotForRent);
        require!(!land_plot.is_for_sale, LandError::CurrentlyForSale);

        // Verify rental dimensions
        require!(
            rental_start_x >= land_plot.rental_start_x
                && rental_start_y >= land_plot.rental_start_y
                && (rental_start_x + rental_width)
                    <= (land_plot.rental_start_x + land_plot.rental_width)
                && (rental_start_y + rental_height)
                    <= (land_plot.rental_start_y + land_plot.rental_height),
            LandError::InvalidDimensions
        );

        // Calculate total rental price
        let total_rental_price = land_plot
            .rental_price
            .checked_mul(rental_width)
            .ok_or(LandError::CalculationError)?
            .checked_mul(rental_height)
            .ok_or(LandError::CalculationError)?
            .checked_mul(rental_duration_days as u64)
            .ok_or(LandError::CalculationError)?;

        // Transfer rental payment
        **ctx.accounts.renter.try_borrow_mut_lamports()? = ctx
            .accounts
            .renter
            .lamports()
            .checked_sub(total_rental_price)
            .ok_or(LandError::InsufficientFunds)?;
        **ctx.accounts.owner.try_borrow_mut_lamports()? = ctx
            .accounts
            .owner
            .lamports()
            .checked_add(total_rental_price)
            .ok_or(LandError::CalculationError)?;

        // Set rental information
        land_plot.renter = ctx.accounts.renter.key();
        land_plot.rental_end_time = Clock::get()?.unix_timestamp + (rental_duration_days * 86400);
        land_plot.is_for_rent = false; // Remove from rental listing while rented

        Ok(())
    }

    pub fn end_rental(ctx: Context<EndRental>) -> Result<()> {
        let land_plot = &mut ctx.accounts.land_plot;

        // Verify rental has expired
        require!(
            Clock::get()?.unix_timestamp >= land_plot.rental_end_time,
            LandError::RentalNotExpired
        );

        // Reset rental information
        land_plot.renter = Pubkey::default();
        land_plot.rental_end_time = 0;
        land_plot.is_for_rent = true; // Automatically relist for rent

        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreateLandPlot<'info> {
    #[account(
        init,
        payer = creator,
        space = 8 + // discriminator
               32 + // owner
               8 + // start_x
               8 + // start_y
               8 + // width
               8 + // height
               1 + // is_for_sale
               1 + // is_for_rent
               8 + // price_per_unit
               8 + // sale_start_x
               8 + // sale_start_y
               8 + // sale_width
               8 + // sale_height
               8 + // rental_price
               8 + // rental_start_x
               8 + // rental_start_y
               8 + // rental_width
               8 + // rental_height
               8 + // rental_end_time
               32  // renter
    )]
    pub land_plot: Account<'info, LandPlot>,
    #[account(mut)]
    pub creator: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ListLand<'info> {
    #[account(mut)]
    pub land_plot: Account<'info, LandPlot>,
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct BuyLand<'info> {
    #[account(mut)]
    pub original_plot: Account<'info, LandPlot>,
    #[account(
        init,
        payer = buyer,
        space = 8 + 32 + 8 + 8 + 8 + 8 + 1 + 1 + 8 + 8 + 8 + 8 + 8 + 8 + 8 + 8 + 8 + 8 + 8 + 32
    )]
    pub new_plot: Account<'info, LandPlot>,
    #[account(mut)]
    pub buyer: Signer<'info>,
    /// CHECK: This is safe because we only credit SOL to this account
    #[account(
        mut,
        constraint = current_owner.key() == original_plot.owner @ LandError::InvalidOwner
    )]
    pub current_owner: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RentLand<'info> {
    #[account(mut)]
    pub land_plot: Account<'info, LandPlot>,
    #[account(mut)]
    pub renter: Signer<'info>,
    /// CHECK: This is safe because we only credit SOL to this account
    #[account(
        mut,
        constraint = owner.key() == land_plot.owner @ LandError::InvalidOwner
    )]
    pub owner: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct EndRental<'info> {
    #[account(mut)]
    pub land_plot: Account<'info, LandPlot>,
    /// Anyone can end an expired rental
    pub authority: Signer<'info>,
}

#[account]
pub struct LandPlot {
    pub owner: Pubkey,
    pub start_x: u64,
    pub start_y: u64,
    pub width: u64,
    pub height: u64,
    pub is_for_sale: bool,
    pub is_for_rent: bool,
    pub price_per_unit: u64,
    pub sale_start_x: u64,
    pub sale_start_y: u64,
    pub sale_width: u64,
    pub sale_height: u64,
    pub rental_price: u64,
    pub rental_start_x: u64,
    pub rental_start_y: u64,
    pub rental_width: u64,
    pub rental_height: u64,
    pub rental_end_time: i64,
    pub renter: Pubkey,
}
#[error_code]
pub enum LandError {
    #[msg("Calculation error")]
    CalculationError,
    #[msg("Not the owner")]
    NotOwner,
    #[msg("Land is currently for sale")]
    CurrentlyForSale,
    #[msg("Land is already rented")]
    AlreadyRented,
    #[msg("Land is not for rent")]
    NotForRent,
    #[msg("Land is not for sale")]
    NotForSale,
    #[msg("Insufficient funds")]
    InsufficientFunds,
    #[msg("Invalid owner")]
    InvalidOwner,
    #[msg("Invalid dimensions")]
    InvalidDimensions,
    #[msg("Rental period has not expired yet")]
    RentalNotExpired,
    #[msg("Invalid rental duration")]
    InvalidRentalDuration,
    #[msg("Invalid price")]
    InvalidPrice,
}
