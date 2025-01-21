//utils.rs
use anchor_lang::prelude::*;
use crate::state::*;

pub fn is_valid_plot(
    country: &CountryState,
    start_x: u64,
    start_y: u64,
    width: u64,
    height: u64,
) -> Result<bool> {
    Ok(start_x + width <= country.width
        && start_y + height <= country.height
        && width > 0
        && height > 0)
}

pub fn is_land_occupied(
    grid: &GridState,
    start_x: u64,
    start_y: u64,
    width: u64,
    height: u64,
) -> Result<bool> {
    for x in start_x..start_x + width {
        for y in start_y..start_y + height {
            if grid
                .occupied_coordinates
                .iter()
                .any(|coord| coord.x == x && coord.y == y)
            {
                return Ok(true);
            }
        }
    }
    Ok(false)
}

pub fn update_grid_state(
    grid: &mut GridState,
    start_x: u64,
    start_y: u64,
    width: u64,
    height: u64,
    plot: Pubkey,
) -> Result<()> {
    // Add coordinates for the plot
    for x in start_x..start_x + width {
        for y in start_y..start_y + height {
            grid.occupied_coordinates
                .push(CoordinateMapping { x, y, plot });
        }
    }

    // Update region mapping
    let region_id = calculate_region_id(start_x, start_y);
    if let Some(region) = grid
        .region_plots
        .iter_mut()
        .find(|r| r.region_id == region_id)
    {
        region.plots.push(plot);
    } else {
        grid.region_plots.push(RegionMapping {
            region_id,
            plots: vec![plot],
        });
    }

    Ok(())
}

pub fn find_neighboring_plots(
    grid: &GridState,
    start_x: u64,
    start_y: u64,
    width: u64,
    height: u64,
) -> Result<Vec<Pubkey>> {
    let mut neighbors = Vec::new();
    let directions = [
        (-1, 0),
        (1, 0),
        (0, -1),
        (0, 1),
        (-1, -1),
        (-1, 1),
        (1, -1),
        (1, 1),
    ];

    for x in start_x..start_x + width {
        for y in start_y..start_y + height {
            for (dx, dy) in directions.iter() {
                let new_x = x as i64 + dx;
                let new_y = y as i64 + dy;

                if new_x >= 0 && new_y >= 0 {
                    if let Some(coord) = grid
                        .occupied_coordinates
                        .iter()
                        .find(|c| c.x == new_x as u64 && c.y == new_y as u64)
                    {
                        if !neighbors.contains(&coord.plot) {
                            neighbors.push(coord.plot);
                        }
                    }
                }
            }
        }
    }

    Ok(neighbors)
}

pub fn calculate_region_id(x: u64, y: u64) -> u64 {
    const REGION_SIZE: u64 = 1000;
    (x / REGION_SIZE) + ((y / REGION_SIZE) * REGION_SIZE)
}

pub fn are_plots_adjacent(plot_a: &LandPlot, plot_b: &LandPlot) -> Result<bool> {
    let a_right = plot_a.start_x + plot_a.width;
    let a_bottom = plot_a.start_y + plot_a.height;
    let b_right = plot_b.start_x + plot_b.width;
    let b_bottom = plot_b.start_y + plot_b.height;

    let horizontal_adjacent = (plot_a.start_x == b_right || a_right == plot_b.start_x)
        && !(a_bottom < plot_b.start_y || plot_a.start_y > b_bottom);

    let vertical_adjacent = (plot_a.start_y == b_bottom || a_bottom == plot_b.start_y)
        && !(a_right < plot_b.start_x || plot_a.start_x > b_right);

    Ok(horizontal_adjacent || vertical_adjacent)
}

pub fn calculate_merged_dimensions(
    plot_a: &LandPlot,
    plot_b: &LandPlot,
) -> Result<(u64, u64, u64, u64)> {
    let start_x = std::cmp::min(plot_a.start_x, plot_b.start_x);
    let start_y = std::cmp::min(plot_a.start_y, plot_b.start_y);
    let end_x = std::cmp::max(plot_a.start_x + plot_a.width, plot_b.start_x + plot_b.width);
    let end_y = std::cmp::max(
        plot_a.start_y + plot_a.height,
        plot_b.start_y + plot_b.height,
    );

    Ok((start_x, start_y, end_x - start_x, end_y - start_y))
}

pub fn update_grid_after_merge(
    grid: &mut GridState,
    plot_a: Pubkey,
    plot_b: Pubkey,
    new_x: u64,
    new_y: u64,
    new_width: u64,
    new_height: u64,
) -> Result<()> {
    // Remove old plot_b references
    grid.occupied_coordinates
        .retain(|coord| coord.plot != plot_b);

    // Update coordinates for merged plot
    grid.occupied_coordinates
        .retain(|coord| coord.plot != plot_a);
    for x in new_x..new_x + new_width {
        for y in new_y..new_y + new_height {
            grid.occupied_coordinates
                .push(CoordinateMapping { x, y, plot: plot_a });
        }
    }

    // Update region mappings
    for region in grid.region_plots.iter_mut() {
        region.plots.retain(|&p| p != plot_b);
    }

    Ok(())
}

pub fn is_within_plot(plot: &LandPlot, x: u64, y: u64, width: u64, height: u64) -> Result<bool> {
    Ok(x >= plot.start_x
        && y >= plot.start_y
        && x + width <= plot.start_x + plot.width
        && y + height <= plot.start_y + plot.height)
}

pub fn update_original_plot_after_split(
    plot: &mut LandPlot,
    split_x: u64,
    split_y: u64,
    width: u64,
    height: u64,
) -> Result<()> {
    if split_x == plot.start_x {
        plot.start_x += width;
        plot.width -= width;
    } else if split_y == plot.start_y {
        plot.start_y += height;
        plot.height -= height;
    }
    Ok(())
}
