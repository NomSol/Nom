use anchor_lang::prelude::*;
use anchor_spl::token::{self, Burn, CloseAccount, Mint, Token, TokenAccount, Transfer};
use anchor_spl::associated_token::AssociatedToken;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod token_recycle {
    use super::*;

    pub fn initialize_station(
        ctx: Context<InitializeStation>,
        station_name: String,
        station_description: String,
        latitude: f64,
        longitude: f64,
    ) -> Result<()> {
        let station = &mut ctx.accounts.station;
        let owner = &ctx.accounts.owner;

        station.owner = owner.key();
        station.name = station_name;
        station.description = station_description;
        station.latitude = latitude;
        station.longitude = longitude;
        station.recycled_count = 0;
        station.is_active = true;
        station.created_at = Clock::get()?.unix_timestamp;

        Ok(())
    }

    pub fn dispose_dead_coin(
        ctx: Context<DisposeDeadCoin>,
        amount: u64,
        death_index: u8,
    ) -> Result<()> {
        // Validate input parameters
        require!(amount > 0, ErrorCode::InvalidAmount);
        require!(death_index > 0 && death_index <= 100, ErrorCode::InvalidDeathIndex);

        // Calculate rewards based on death index and amount
        let nom_tokens_reward = calculate_nom_reward(amount, death_index);
        let xp_points = calculate_xp_points(amount, death_index);

        // Burn the dead coin tokens by transferring them to the program
        token::burn(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Burn {
                    mint: ctx.accounts.dead_coin_mint.to_account_info(),
                    from: ctx.accounts.user_dead_coin_account.to_account_info(),
                    authority: ctx.accounts.user.to_account_info(),
                },
            ),
            amount,
        )?;

        // Transfer NOM tokens to the user
        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.program_nom_account.to_account_info(),
                    to: ctx.accounts.user_nom_account.to_account_info(),
                    authority: ctx.accounts.program_authority.to_account_info(),
                },
                &[&[
                    b"program-authority".as_ref(),
                    &[ctx.accounts.program_authority_bump],
                ]],
            ),
            nom_tokens_reward,
        )?;

        // Update the recycling station statistics
        let station = &mut ctx.accounts.station;
        station.recycled_count += 1;

        // Create a record of this transaction
        let record = &mut ctx.accounts.recycle_record;
        record.user = ctx.accounts.user.key();
        record.station = station.key();
        record.dead_coin_mint = ctx.accounts.dead_coin_mint.key();
        record.amount = amount;
        record.death_index = death_index;
        record.nom_tokens_reward = nom_tokens_reward;
        record.xp_points = xp_points;
        record.timestamp = Clock::get()?.unix_timestamp;

        // Emit event
        emit!(RecycleEvent {
            user: ctx.accounts.user.key(),
            station: station.key(),
            dead_coin_mint: ctx.accounts.dead_coin_mint.key(),
            amount,
            nom_tokens_reward,
            xp_points,
            timestamp: record.timestamp,
        });

        Ok(())
    }

    pub fn claim_xp(ctx: Context<ClaimXP>) -> Result<()> {
        // Implementation for claiming XP points would go here
        // This would typically update a user profile or game state
        Ok(())
    }
}

// Helper functions for reward calculations
fn calculate_nom_reward(amount: u64, death_index: u8) -> u64 {
    // The higher the death index and amount, the more NOM tokens rewarded
    // This is a simplified calculation for demonstration
    let base_reward = amount / 1_000_000; // 1 NOM per 1,000,000 dead tokens
    let death_multiplier = (death_index as u64).max(50) / 50; // 1-2x multiplier based on death index
    base_reward * death_multiplier
}

fn calculate_xp_points(amount: u64, death_index: u8) -> u64 {
    // XP points calculation - 10x the NOM token reward
    calculate_nom_reward(amount, death_index) * 10
}

#[derive(Accounts)]
pub struct InitializeStation<'info> {
    #[account(
        init,
        payer = owner,
        space = 8 + 32 + 100 + 200 + 8 + 8 + 8 + 1 + 8
    )]
    pub station: Account<'info, RecyclingStation>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DisposeDeadCoin<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(mut)]
    pub station: Account<'info, RecyclingStation>,
    
    pub dead_coin_mint: Account<'info, Mint>,
    
    #[account(
        mut,
        associated_token::mint = dead_coin_mint,
        associated_token::authority = user
    )]
    pub user_dead_coin_account: Account<'info, TokenAccount>,
    
    pub nom_mint: Account<'info, Mint>,
    
    #[account(
        mut,
        associated_token::mint = nom_mint,
        associated_token::authority = user
    )]
    pub user_nom_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        associated_token::mint = nom_mint,
        associated_token::authority = program_authority
    )]
    pub program_nom_account: Account<'info, TokenAccount>,
    
    #[account(
        seeds = [b"program-authority"],
        bump = program_authority_bump
    )]
    pub program_authority: AccountInfo<'info>,
    
    #[account(
        init,
        payer = user,
        space = 8 + 32 + 32 + 32 + 8 + 1 + 8 + 8 + 8
    )]
    pub recycle_record: Account<'info, RecycleRecord>,
    
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct ClaimXP<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    // Additional accounts would be needed based on implementation
    pub system_program: Program<'info, System>,
}

#[account]
pub struct RecyclingStation {
    pub owner: Pubkey,
    pub name: String,
    pub description: String,
    pub latitude: f64,
    pub longitude: f64,
    pub recycled_count: u64,
    pub is_active: bool,
    pub created_at: i64,
}

#[account]
pub struct RecycleRecord {
    pub user: Pubkey,
    pub station: Pubkey,
    pub dead_coin_mint: Pubkey,
    pub amount: u64,
    pub death_index: u8,
    pub nom_tokens_reward: u64,
    pub xp_points: u64,
    pub timestamp: i64,
}

#[event]
pub struct RecycleEvent {
    pub user: Pubkey,
    pub station: Pubkey,
    pub dead_coin_mint: Pubkey,
    pub amount: u64,
    pub nom_tokens_reward: u64,
    pub xp_points: u64,
    pub timestamp: i64,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Amount must be greater than zero")]
    InvalidAmount,
    #[msg("Death index must be between 1 and 100")]
    InvalidDeathIndex,
} 