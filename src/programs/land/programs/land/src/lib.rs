//lib.rs
use anchor_lang::prelude::*;
use anchor_spl::{associated_token::AssociatedToken, token::Token};

declare_id!("4AxDhKc6HoRmtUnjHFup9x6uEyd8byg2EVwZUa9vzSgy");

pub mod error;
pub mod instructions;
pub mod payment;
pub mod state;
pub mod utils;

use crate::{error::*, instructions::*, payment::*, state::*, utils::*};

#[program]
pub mod gtopia_land {
    use super::*;

    pub fn initialize_country(
        ctx: Context<InitializeCountry>,
        args: InitializeCountryArgs,
    ) -> Result<()> {
        let country = &mut ctx.accounts.country;
        let grid = &mut ctx.accounts.grid;

        require!(
            args.width * args.height == 10_000_000_000,
            LandError::InvalidDimensions
        );

        country.authority = ctx.accounts.authority.key();
        country.width = args.width;
        country.height = args.height;
        country.total_units = args.width * args.height;
        country.units_sold = 0;
        country.payment_mint = ctx.accounts.payment_mint.key();
        country.price_per_unit = args.price_per_unit;
        country.treasury = ctx.accounts.treasury.key();
        country.regions = vec![];

        // Initialize empty vectors for grid state
        grid.occupied_coordinates = vec![];
        grid.region_plots = vec![];

        emit!(CountryInitialized {
            authority: country.authority,
            width: country.width,
            height: country.height,
            payment_mint: country.payment_mint,
        });

        Ok(())
    }

    pub fn purchase_land(ctx: Context<PurchaseLand>, args: PurchaseLandArgs) -> Result<()> {
        let country = &mut ctx.accounts.country;
        let grid = &mut ctx.accounts.grid;
        let plot = &mut ctx.accounts.land_plot;

        // Verify land availability and bounds
        require!(
            is_valid_plot(country, args.start_x, args.start_y, args.width, args.height)?,
            LandError::InvalidPlot
        );

        require!(
            !is_land_occupied(grid, args.start_x, args.start_y, args.width, args.height)?,
            LandError::LandOccupied
        );

        // Calculate payment
        let total_units = args.width * args.height;
        let payment_amount = total_units
            .checked_mul(country.price_per_unit)
            .ok_or(LandError::CalculationError)?;

        // Process payment
        process_payment(
            payment_amount,
            &ctx.accounts.buyer_token,
            &ctx.accounts.treasury_token,
            &ctx.accounts.buyer,
            &ctx.accounts.token_program,
        )?;

        // Create the plot
        plot.owner = ctx.accounts.buyer.key();
        plot.start_x = args.start_x;
        plot.start_y = args.start_y;
        plot.width = args.width;
        plot.height = args.height;
        plot.is_listed = false;
        plot.price_per_unit = 0;
        plot.timestamp = Clock::get()?.unix_timestamp;
        plot.neighbors =
            find_neighboring_plots(grid, args.start_x, args.start_y, args.width, args.height)?;
        plot.region_id = calculate_region_id(args.start_x, args.start_y);

        // Update grid state
        update_grid_state(
            grid,
            args.start_x,
            args.start_y,
            args.width,
            args.height,
            plot.key(),
        )?;

        // Update country stats
        country.units_sold = country
            .units_sold
            .checked_add(total_units)
            .ok_or(LandError::CalculationError)?;

        emit!(LandPurchased {
            buyer: ctx.accounts.buyer.key(),
            plot: plot.key(),
            start_x: args.start_x,
            start_y: args.start_y,
            width: args.width,
            height: args.height,
            price: payment_amount,
        });

        Ok(())
    }

    pub fn split_plot(ctx: Context<SplitPlot>, args: SplitPlotArgs) -> Result<()> {
        let grid = &mut ctx.accounts.grid;
        let original_plot = &mut ctx.accounts.original_plot;
        let new_plot = &mut ctx.accounts.new_plot;

        // Verify ownership and plot validity
        require!(
            original_plot.owner == ctx.accounts.owner.key(),
            LandError::NotOwner
        );

        require!(
            is_within_plot(
                original_plot,
                args.split_x,
                args.split_y,
                args.width,
                args.height
            )?,
            LandError::InvalidSplit
        );

        // Create new plot
        new_plot.owner = ctx.accounts.owner.key();
        new_plot.start_x = args.split_x;
        new_plot.start_y = args.split_y;
        new_plot.width = args.width;
        new_plot.height = args.height;
        new_plot.is_listed = false;
        new_plot.price_per_unit = 0;
        new_plot.timestamp = Clock::get()?.unix_timestamp;
        new_plot.neighbors =
            find_neighboring_plots(grid, args.split_x, args.split_y, args.width, args.height)?;
        new_plot.region_id = calculate_region_id(args.split_x, args.split_y);

        // Update original plot dimensions
        update_original_plot_after_split(
            original_plot,
            args.split_x,
            args.split_y,
            args.width,
            args.height,
        )?;

        // Update grid state
        update_grid_state(
            grid,
            args.split_x,
            args.split_y,
            args.width,
            args.height,
            new_plot.key(),
        )?;

        emit!(PlotSplit {
            original_plot: original_plot.key(),
            new_plot: new_plot.key(),
            split_x: args.split_x,
            split_y: args.split_y,
            width: args.width,
            height: args.height,
        });

        Ok(())
    }

    pub fn merge_plots(ctx: Context<MergePlots>) -> Result<()> {
        let grid = &mut ctx.accounts.grid;
        let plot_a = &mut ctx.accounts.plot_a;
        let plot_b = &mut ctx.accounts.plot_b;

        // Verify ownership and adjacency
        require!(
            plot_a.owner == plot_b.owner && plot_a.owner == ctx.accounts.owner.key(),
            LandError::NotOwner
        );

        require!(
            are_plots_adjacent(plot_a, plot_b)?,
            LandError::PlotsNotAdjacent
        );

        // Calculate new dimensions
        let (new_x, new_y, new_width, new_height) = calculate_merged_dimensions(plot_a, plot_b)?;

        // Update plot_a with merged dimensions
        plot_a.owner = ctx.accounts.owner.key();
        plot_a.start_x = new_x;
        plot_a.start_y = new_y;
        plot_a.width = new_width;
        plot_a.height = new_height;
        plot_a.is_listed = false;
        plot_a.price_per_unit = 0;
        plot_a.timestamp = Clock::get()?.unix_timestamp;
        plot_a.neighbors = find_neighboring_plots(grid, new_x, new_y, new_width, new_height)?;
        plot_a.region_id = calculate_region_id(new_x, new_y);

        // Update grid state
        update_grid_after_merge(
            grid,
            plot_a.key(),
            plot_b.key(),
            new_x,
            new_y,
            new_width,
            new_height,
        )?;

        emit!(PlotsMerged {
            plot_a: plot_a.key(),
            plot_b: plot_b.key(),
            new_x: new_x,
            new_y: new_y,
            new_width: new_width,
            new_height: new_height,
        });

        Ok(())
    }
}
