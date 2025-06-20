use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer, Mint};

declare_id!("AstroDeFi111111111111111111111111111111111111");

#[program]
pub mod defi_integration {
    use super::*;

    pub fn initialize_yield_farm(
        ctx: Context<InitializeYieldFarm>,
        reward_rate: u64,
        lock_period: u32,
    ) -> Result<()> {
        let yield_farm = &mut ctx.accounts.yield_farm;
        yield_farm.authority = ctx.accounts.authority.key();
        yield_farm.reward_token_mint = ctx.accounts.reward_token_mint.key();
        yield_farm.staking_token_mint = ctx.accounts.staking_token_mint.key();
        yield_farm.reward_rate = reward_rate;
        yield_farm.lock_period = lock_period;
        yield_farm.total_staked = 0;
        yield_farm.total_rewards_distributed = 0;
        yield_farm.is_active = true;

        msg!("Yield farm initialized with reward rate: {} per second", reward_rate);
        Ok(())
    }

    pub fn stake_for_yield(
        ctx: Context<StakeForYield>,
        amount: u64,
    ) -> Result<()> {
        require!(amount > 0, ErrorCode::InvalidAmount);
        require!(ctx.accounts.yield_farm.is_active, ErrorCode::FarmNotActive);

        // Transfer staking tokens to farm vault
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.user_staking_account.to_account_info(),
                to: ctx.accounts.farm_vault.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
            },
        );
        token::transfer(transfer_ctx, amount)?;

        // Update user stake
        let user_stake = &mut ctx.accounts.user_stake;
        let current_time = Clock::get()?.unix_timestamp;

        // Calculate pending rewards before updating stake
        let pending_rewards = calculate_pending_rewards(user_stake, current_time, ctx.accounts.yield_farm.reward_rate);
        user_stake.pending_rewards += pending_rewards;

        user_stake.owner = ctx.accounts.user.key();
        user_stake.amount += amount;
        user_stake.last_update_time = current_time;
        user_stake.lock_end_time = current_time + ctx.accounts.yield_farm.lock_period as i64;

        // Update farm totals
        let yield_farm = &mut ctx.accounts.yield_farm;
        yield_farm.total_staked += amount;

        emit!(TokensStakedForYield {
            user: ctx.accounts.user.key(),
            amount,
            total_staked: user_stake.amount,
            lock_end_time: user_stake.lock_end_time,
        });

        Ok(())
    }

    pub fn claim_yield_rewards(ctx: Context<ClaimYieldRewards>) -> Result<()> {
        let user_stake = &mut ctx.accounts.user_stake;
        let current_time = Clock::get()?.unix_timestamp;

        // Calculate total rewards
        let pending_rewards = calculate_pending_rewards(user_stake, current_time, ctx.accounts.yield_farm.reward_rate);
        let total_rewards = user_stake.pending_rewards + pending_rewards;

        require!(total_rewards > 0, ErrorCode::NoRewardsToClaim);

        // Transfer rewards to user
        let seeds = &[
            b"farm_vault",
            ctx.accounts.yield_farm.staking_token_mint.as_ref(),
            &[ctx.bumps.farm_vault],
        ];
        let signer = &[&seeds[..]];

        let transfer_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.reward_vault.to_account_info(),
                to: ctx.accounts.user_reward_account.to_account_info(),
                authority: ctx.accounts.farm_vault.to_account_info(),
            },
            signer,
        );
        token::transfer(transfer_ctx, total_rewards)?;

        // Update user stake
        user_stake.pending_rewards = 0;
        user_stake.last_update_time = current_time;
        user_stake.total_claimed += total_rewards;

        // Update farm stats
        let yield_farm = &mut ctx.accounts.yield_farm;
        yield_farm.total_rewards_distributed += total_rewards;

        emit!(YieldRewardsClaimed {
            user: ctx.accounts.user.key(),
            amount: total_rewards,
            total_claimed: user_stake.total_claimed,
        });

        Ok(())
    }

    pub fn unstake_from_yield(
        ctx: Context<UnstakeFromYield>,
        amount: u64,
    ) -> Result<()> {
        let user_stake = &mut ctx.accounts.user_stake;
        let current_time = Clock::get()?.unix_timestamp;

        require!(user_stake.amount >= amount, ErrorCode::InsufficientStake);
        require!(current_time >= user_stake.lock_end_time, ErrorCode::StillLocked);

        // Calculate and add pending rewards
        let pending_rewards = calculate_pending_rewards(user_stake, current_time, ctx.accounts.yield_farm.reward_rate);
        user_stake.pending_rewards += pending_rewards;

        // Transfer staking tokens back to user
        let seeds = &[
            b"farm_vault",
            ctx.accounts.yield_farm.staking_token_mint.as_ref(),
            &[ctx.bumps.farm_vault],
        ];
        let signer = &[&seeds[..]];

        let transfer_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.farm_vault.to_account_info(),
                to: ctx.accounts.user_staking_account.to_account_info(),
                authority: ctx.accounts.farm_vault.to_account_info(),
            },
            signer,
        );
        token::transfer(transfer_ctx, amount)?;

        // Update user stake
        user_stake.amount -= amount;
        user_stake.last_update_time = current_time;

        // Update farm totals
        let yield_farm = &mut ctx.accounts.yield_farm;
        yield_farm.total_staked -= amount;

        emit!(TokensUnstakedFromYield {
            user: ctx.accounts.user.key(),
            amount,
            remaining_staked: user_stake.amount,
        });

        Ok(())
    }

    pub fn create_liquidity_pool(
        ctx: Context<CreateLiquidityPool>,
        fee_rate: u16,
    ) -> Result<()> {
        let liquidity_pool = &mut ctx.accounts.liquidity_pool;
        liquidity_pool.authority = ctx.accounts.authority.key();
        liquidity_pool.token_a_mint = ctx.accounts.token_a_mint.key();
        liquidity_pool.token_b_mint = ctx.accounts.token_b_mint.key();
        liquidity_pool.fee_rate = fee_rate;
        liquidity_pool.total_liquidity = 0;
        liquidity_pool.reserve_a = 0;
        liquidity_pool.reserve_b = 0;
        liquidity_pool.is_active = true;

        msg!("Liquidity pool created with fee rate: {}%", fee_rate as f64 / 100.0);
        Ok(())
    }

    pub fn add_liquidity(
        ctx: Context<AddLiquidity>,
        amount_a: u64,
        amount_b: u64,
        min_liquidity: u64,
    ) -> Result<()> {
        require!(amount_a > 0 && amount_b > 0, ErrorCode::InvalidAmount);
        require!(ctx.accounts.liquidity_pool.is_active, ErrorCode::PoolNotActive);

        let liquidity_pool = &mut ctx.accounts.liquidity_pool;
        
        // Calculate liquidity tokens to mint
        let liquidity_tokens = if liquidity_pool.total_liquidity == 0 {
            // First liquidity provision
            (amount_a * amount_b).integer_sqrt()
        } else {
            // Subsequent provisions - maintain ratio
            let liquidity_a = (amount_a * liquidity_pool.total_liquidity) / liquidity_pool.reserve_a;
            let liquidity_b = (amount_b * liquidity_pool.total_liquidity) / liquidity_pool.reserve_b;
            std::cmp::min(liquidity_a, liquidity_b)
        };

        require!(liquidity_tokens >= min_liquidity, ErrorCode::InsufficientLiquidity);

        // Transfer tokens to pool
        let transfer_a_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.user_token_a_account.to_account_info(),
                to: ctx.accounts.pool_token_a_vault.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
            },
        );
        token::transfer(transfer_a_ctx, amount_a)?;

        let transfer_b_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.user_token_b_account.to_account_info(),
                to: ctx.accounts.pool_token_b_vault.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
            },
        );
        token::transfer(transfer_b_ctx, amount_b)?;

        // Update pool reserves
        liquidity_pool.reserve_a += amount_a;
        liquidity_pool.reserve_b += amount_b;
        liquidity_pool.total_liquidity += liquidity_tokens;

        // Update user liquidity position
        let user_liquidity = &mut ctx.accounts.user_liquidity;
        user_liquidity.owner = ctx.accounts.user.key();
        user_liquidity.pool = liquidity_pool.key();
        user_liquidity.liquidity_tokens += liquidity_tokens;

        emit!(LiquidityAdded {
            user: ctx.accounts.user.key(),
            amount_a,
            amount_b,
            liquidity_tokens,
        });

        Ok(())
    }

    pub fn swap_tokens(
        ctx: Context<SwapTokens>,
        amount_in: u64,
        min_amount_out: u64,
        a_to_b: bool,
    ) -> Result<()> {
        require!(amount_in > 0, ErrorCode::InvalidAmount);
        require!(ctx.accounts.liquidity_pool.is_active, ErrorCode::PoolNotActive);

        let liquidity_pool = &mut ctx.accounts.liquidity_pool;
        
        // Calculate swap output using constant product formula
        let (reserve_in, reserve_out) = if a_to_b {
            (liquidity_pool.reserve_a, liquidity_pool.reserve_b)
        } else {
            (liquidity_pool.reserve_b, liquidity_pool.reserve_a)
        };

        let amount_in_with_fee = amount_in * (10000 - liquidity_pool.fee_rate as u64) / 10000;
        let amount_out = (amount_in_with_fee * reserve_out) / (reserve_in + amount_in_with_fee);

        require!(amount_out >= min_amount_out, ErrorCode::SlippageTooHigh);

        // Perform swap
        if a_to_b {
            // Transfer token A from user to pool
            let transfer_in_ctx = CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.user_token_a_account.to_account_info(),
                    to: ctx.accounts.pool_token_a_vault.to_account_info(),
                    authority: ctx.accounts.user.to_account_info(),
                },
            );
            token::transfer(transfer_in_ctx, amount_in)?;

            // Transfer token B from pool to user
            let seeds = &[
                b"pool_vault_b",
                liquidity_pool.token_b_mint.as_ref(),
                &[ctx.bumps.pool_token_b_vault],
            ];
            let signer = &[&seeds[..]];

            let transfer_out_ctx = CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.pool_token_b_vault.to_account_info(),
                    to: ctx.accounts.user_token_b_account.to_account_info(),
                    authority: ctx.accounts.pool_token_b_vault.to_account_info(),
                },
                signer,
            );
            token::transfer(transfer_out_ctx, amount_out)?;

            // Update reserves
            liquidity_pool.reserve_a += amount_in;
            liquidity_pool.reserve_b -= amount_out;
        } else {
            // Similar logic for B to A swap
            // ... (implementation details)
        }

        emit!(TokensSwapped {
            user: ctx.accounts.user.key(),
            amount_in,
            amount_out,
            a_to_b,
        });

        Ok(())
    }
}

// Account Structures
#[account]
pub struct YieldFarm {
    pub authority: Pubkey,
    pub reward_token_mint: Pubkey,
    pub staking_token_mint: Pubkey,
    pub reward_rate: u64,
    pub lock_period: u32,
    pub total_staked: u64,
    pub total_rewards_distributed: u64,
    pub is_active: bool,
}

#[account]
pub struct UserStake {
    pub owner: Pubkey,
    pub amount: u64,
    pub pending_rewards: u64,
    pub last_update_time: i64,
    pub lock_end_time: i64,
    pub total_claimed: u64,
}

#[account]
pub struct LiquidityPool {
    pub authority: Pubkey,
    pub token_a_mint: Pubkey,
    pub token_b_mint: Pubkey,
    pub fee_rate: u16,
    pub total_liquidity: u64,
    pub reserve_a: u64,
    pub reserve_b: u64,
    pub is_active: bool,
}

#[account]
pub struct UserLiquidity {
    pub owner: Pubkey,
    pub pool: Pubkey,
    pub liquidity_tokens: u64,
}

// Context Structures
#[derive(Accounts)]
pub struct InitializeYieldFarm<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 32 + 32 + 8 + 4 + 8 + 8 + 1,
        seeds = [b"yield_farm", staking_token_mint.key().as_ref()],
        bump
    )]
    pub yield_farm: Account<'info, YieldFarm>,
    pub reward_token_mint: Account<'info, Mint>,
    pub staking_token_mint: Account<'info, Mint>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct StakeForYield<'info> {
    #[account(mut)]
    pub yield_farm: Account<'info, YieldFarm>,
    #[account(
        init_if_needed,
        payer = user,
        space = 8 + 32 + 8 + 8 + 8 + 8 + 8,
        seeds = [b"user_stake", yield_farm.key().as_ref(), user.key().as_ref()],
        bump
    )]
    pub user_stake: Account<'info, UserStake>,
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut)]
    pub user_staking_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        seeds = [b"farm_vault", yield_farm.staking_token_mint.as_ref()],
        bump
    )]
    pub farm_vault: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ClaimYieldRewards<'info> {
    pub yield_farm: Account<'info, YieldFarm>,
    #[account(mut)]
    pub user_stake: Account<'info, UserStake>,
    pub user: Signer<'info>,
    #[account(mut)]
    pub user_reward_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        seeds = [b"farm_vault", yield_farm.staking_token_mint.as_ref()],
        bump
    )]
    pub farm_vault: Account<'info, TokenAccount>,
    #[account(mut)]
    pub reward_vault: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct UnstakeFromYield<'info> {
    pub yield_farm: Account<'info, YieldFarm>,
    #[account(mut)]
    pub user_stake: Account<'info, UserStake>,
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut)]
    pub user_staking_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        seeds = [b"farm_vault", yield_farm.staking_token_mint.as_ref()],
        bump
    )]
    pub farm_vault: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct CreateLiquidityPool<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 32 + 32 + 2 + 8 + 8 + 8 + 1,
        seeds = [b"liquidity_pool", token_a_mint.key().as_ref(), token_b_mint.key().as_ref()],
        bump
    )]
    pub liquidity_pool: Account<'info, LiquidityPool>,
    pub token_a_mint: Account<'info, Mint>,
    pub token_b_mint: Account<'info, Mint>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AddLiquidity<'info> {
    #[account(mut)]
    pub liquidity_pool: Account<'info, LiquidityPool>,
    #[account(
        init_if_needed,
        payer = user,
        space = 8 + 32 + 32 + 8,
        seeds = [b"user_liquidity", liquidity_pool.key().as_ref(), user.key().as_ref()],
        bump
    )]
    pub user_liquidity: Account<'info, UserLiquidity>,
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut)]
    pub user_token_a_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub user_token_b_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub pool_token_a_vault: Account<'info, TokenAccount>,
    #[account(mut)]
    pub pool_token_b_vault: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SwapTokens<'info> {
    #[account(mut)]
    pub liquidity_pool: Account<'info, LiquidityPool>,
    pub user: Signer<'info>,
    #[account(mut)]
    pub user_token_a_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub user_token_b_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub pool_token_a_vault: Account<'info, TokenAccount>,
    #[account(
        mut,
        seeds = [b"pool_vault_b", liquidity_pool.token_b_mint.as_ref()],
        bump
    )]
    pub pool_token_b_vault: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

// Events
#[event]
pub struct TokensStakedForYield {
    pub user: Pubkey,
    pub amount: u64,
    pub total_staked: u64,
    pub lock_end_time: i64,
}

#[event]
pub struct YieldRewardsClaimed {
    pub user: Pubkey,
    pub amount: u64,
    pub total_claimed: u64,
}

#[event]
pub struct TokensUnstakedFromYield {
    pub user: Pubkey,
    pub amount: u64,
    pub remaining_staked: u64,
}

#[event]
pub struct LiquidityAdded {
    pub user: Pubkey,
    pub amount_a: u64,
    pub amount_b: u64,
    pub liquidity_tokens: u64,
}

#[event]
pub struct TokensSwapped {
    pub user: Pubkey,
    pub amount_in: u64,
    pub amount_out: u64,
    pub a_to_b: bool,
}

// Error Codes
#[error_code]
pub enum ErrorCode {
    #[msg("Invalid amount")]
    InvalidAmount,
    #[msg("Farm is not active")]
    FarmNotActive,
    #[msg("No rewards to claim")]
    NoRewardsToClaim,
    #[msg("Insufficient stake")]
    InsufficientStake,
    #[msg("Tokens are still locked")]
    StillLocked,
    #[msg("Pool is not active")]
    PoolNotActive,
    #[msg("Insufficient liquidity")]
    InsufficientLiquidity,
    #[msg("Slippage too high")]
    SlippageTooHigh,
}

// Helper Functions
fn calculate_pending_rewards(user_stake: &UserStake, current_time: i64, reward_rate: u64) -> u64 {
    let time_elapsed = current_time - user_stake.last_update_time;
    (user_stake.amount * reward_rate * time_elapsed as u64) / (365 * 24 * 60 * 60) // Annual rate
}

trait IntegerSqrt {
    fn integer_sqrt(self) -> Self;
}

impl IntegerSqrt for u64 {
    fn integer_sqrt(self) -> Self {
        if self < 2 {
            return self;
        }
        
        let mut x = self;
        let mut y = (x + 1) / 2;
        
        while y < x {
            x = y;
            y = (x + self / x) / 2;
        }
        
        x
    }
}