//state.rs
use anchor_lang::prelude::*;

#[account]
#[derive(Default)]
pub struct CountryState {
    pub authority: Pubkey,
    pub width: u64,
    pub height: u64,
    pub total_units: u64,
    pub units_sold: u64,
    pub payment_mint: Pubkey,
    pub price_per_unit: u64,
    pub treasury: Pubkey,
    pub regions: Vec<Region>,
}

#[account]
#[derive(Default)]
pub struct GridState {
    pub occupied_coordinates: Vec<CoordinateMapping>,
    pub region_plots: Vec<RegionMapping>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default)]
pub struct CoordinateMapping {
    pub x: u64,
    pub y: u64,
    pub plot: Pubkey,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default)]
pub struct RegionMapping {
    pub region_id: u64,
    pub plots: Vec<Pubkey>,
}

#[account]
#[derive(Default)]
pub struct LandPlot {
    pub owner: Pubkey,
    pub start_x: u64,
    pub start_y: u64,
    pub width: u64,
    pub height: u64,
    pub is_listed: bool,
    pub price_per_unit: u64,
    pub timestamp: i64,
    pub neighbors: Vec<Pubkey>,
    pub region_id: u64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default)]
pub struct Region {
    pub id: u64,
    pub name: String,
    pub plots: Vec<Pubkey>,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct InitializeCountryArgs {
    pub width: u64,
    pub height: u64,
    pub price_per_unit: u64,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct PurchaseLandArgs {
    pub start_x: u64,
    pub start_y: u64,
    pub width: u64,
    pub height: u64,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct SplitPlotArgs {
    pub split_x: u64,
    pub split_y: u64,
    pub width: u64,
    pub height: u64,
}

#[event]
pub struct CountryInitialized {
    pub authority: Pubkey,
    pub width: u64,
    pub height: u64,
    pub payment_mint: Pubkey,
}

#[event]
pub struct LandPurchased {
    pub buyer: Pubkey,
    pub plot: Pubkey,
    pub start_x: u64,
    pub start_y: u64,
    pub width: u64,
    pub height: u64,
    pub price: u64,
}

#[event]
pub struct PlotSplit {
    pub original_plot: Pubkey,
    pub new_plot: Pubkey,
    pub split_x: u64,
    pub split_y: u64,
    pub width: u64,
    pub height: u64,
}

#[event]
pub struct PlotsMerged {
    pub plot_a: Pubkey,
    pub plot_b: Pubkey,
    pub new_x: u64,
    pub new_y: u64,
    pub new_width: u64,
    pub new_height: u64,
}
