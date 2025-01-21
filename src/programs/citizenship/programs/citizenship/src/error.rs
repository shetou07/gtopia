// error.rs
use anchor_lang::prelude::*;

#[error_code]
pub enum LandError {
    #[msg("Invalid country dimensions")]
    InvalidDimensions,

    #[msg("Land coordinates out of bounds")]
    OutOfBounds,

    #[msg("Land is already occupied")]
    LandOccupied,

    #[msg("Not the land owner")]
    NotOwner,

    #[msg("Invalid plot dimensions")]
    InvalidPlot,

    #[msg("Calculation error")]
    CalculationError,

    #[msg("Invalid split parameters")]
    InvalidSplit,

    #[msg("Plots are not adjacent")]
    PlotsNotAdjacent,

    #[msg("Plot is not contiguous")]
    NonContiguousPlot,

    #[msg("Invalid payment amount")]
    InvalidPayment,

    #[msg("Insufficient funds")]
    InsufficientFunds,

    #[msg("Invalid region")]
    InvalidRegion,

    #[msg("Plot is already listed")]
    AlreadyListed,

    #[msg("Plot is not listed")]
    NotListed,

    #[msg("Invalid price")]
    InvalidPrice,
}
