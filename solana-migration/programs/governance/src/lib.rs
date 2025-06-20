use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("AstroGov1111111111111111111111111111111111111");

#[program]
pub mod governance {
    use super::*;

    pub fn initialize_dao(
        ctx: Context<InitializeDAO>,
        voting_period: u32,
        min_proposal_threshold: u64,
        quorum_threshold: u8,
    ) -> Result<()> {
        let dao_state = &mut ctx.accounts.dao_state;
        dao_state.authority = ctx.accounts.authority.key();
        dao_state.voting_period = voting_period;
        dao_state.min_proposal_threshold = min_proposal_threshold;
        dao_state.quorum_threshold = quorum_threshold;
        dao_state.total_proposals = 0;
        dao_state.treasury_balance = 0;
        dao_state.total_members = 0;

        msg!("AstroFi DAO initialized");
        Ok(())
    }

    pub fn create_proposal(
        ctx: Context<CreateProposal>,
        proposal_id: u64,
        title: String,
        description: String,
        proposal_type: ProposalType,
        execution_data: Option<Vec<u8>>,
    ) -> Result<()> {
        let dao_state = &ctx.accounts.dao_state;
        
        // Check if proposer has enough tokens
        require!(
            ctx.accounts.proposer_token_account.amount >= dao_state.min_proposal_threshold,
            ErrorCode::InsufficientTokens
        );

        let proposal = &mut ctx.accounts.proposal;
        proposal.proposal_id = proposal_id;
        proposal.proposer = ctx.accounts.proposer.key();
        proposal.title = title;
        proposal.description = description;
        proposal.proposal_type = proposal_type;
        proposal.execution_data = execution_data;
        proposal.votes_for = 0;
        proposal.votes_against = 0;
        proposal.status = ProposalStatus::Active;
        proposal.created_at = Clock::get()?.unix_timestamp;
        proposal.voting_ends_at = Clock::get()?.unix_timestamp + dao_state.voting_period as i64;

        // Update DAO stats
        let dao_state = &mut ctx.accounts.dao_state;
        dao_state.total_proposals += 1;

        emit!(ProposalCreated {
            proposal_id,
            proposer: ctx.accounts.proposer.key(),
            title: proposal.title.clone(),
            proposal_type: proposal.proposal_type.clone(),
        });

        Ok(())
    }

    pub fn vote_on_proposal(
        ctx: Context<VoteOnProposal>,
        vote: Vote,
    ) -> Result<()> {
        let proposal = &mut ctx.accounts.proposal;
        let current_time = Clock::get()?.unix_timestamp;

        require!(proposal.status == ProposalStatus::Active, ErrorCode::ProposalNotActive);
        require!(current_time <= proposal.voting_ends_at, ErrorCode::VotingPeriodEnded);

        let voter_key = ctx.accounts.voter.key();
        let voting_power = ctx.accounts.voter_token_account.amount;

        // Check if already voted
        require!(
            !proposal.voters.iter().any(|v| v.voter == voter_key),
            ErrorCode::AlreadyVoted
        );

        // Record vote
        proposal.voters.push(VoteRecord {
            voter: voter_key,
            vote: vote.clone(),
            voting_power,
            timestamp: current_time,
        });

        // Update vote counts
        match vote {
            Vote::For => proposal.votes_for += voting_power,
            Vote::Against => proposal.votes_against += voting_power,
        }

        emit!(VoteCast {
            proposal_id: proposal.proposal_id,
            voter: voter_key,
            vote,
            voting_power,
        });

        Ok(())
    }

    pub fn execute_proposal(ctx: Context<ExecuteProposal>) -> Result<()> {
        let proposal = &mut ctx.accounts.proposal;
        let dao_state = &ctx.accounts.dao_state;
        let current_time = Clock::get()?.unix_timestamp;

        require!(proposal.status == ProposalStatus::Active, ErrorCode::ProposalNotActive);
        require!(current_time > proposal.voting_ends_at, ErrorCode::VotingStillActive);

        let total_votes = proposal.votes_for + proposal.votes_against;
        let total_supply = ctx.accounts.token_mint.supply;
        let quorum_required = (total_supply * dao_state.quorum_threshold as u64) / 100;

        require!(total_votes >= quorum_required, ErrorCode::QuorumNotMet);
        require!(proposal.votes_for > proposal.votes_against, ErrorCode::ProposalRejected);

        proposal.status = ProposalStatus::Executed;
        proposal.executed_at = Some(current_time);

        // Execute proposal based on type
        match proposal.proposal_type {
            ProposalType::FundingAllocation => {
                // Handle funding allocation logic
                execute_funding_allocation(ctx, proposal)?;
            },
            ProposalType::ParameterChange => {
                // Handle parameter changes
                execute_parameter_change(ctx, proposal)?;
            },
            ProposalType::PartnershipApproval => {
                // Handle partnership approvals
                execute_partnership_approval(ctx, proposal)?;
            },
            ProposalType::ResearchPriority => {
                // Handle research priority changes
                execute_research_priority(ctx, proposal)?;
            },
        }

        emit!(ProposalExecuted {
            proposal_id: proposal.proposal_id,
            executed_by: ctx.accounts.executor.key(),
        });

        Ok(())
    }

    pub fn stake_tokens(ctx: Context<StakeTokens>, amount: u64) -> Result<()> {
        require!(amount > 0, ErrorCode::InvalidAmount);

        // Transfer tokens to staking vault
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.user_token_account.to_account_info(),
                to: ctx.accounts.staking_vault.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
            },
        );
        token::transfer(transfer_ctx, amount)?;

        // Update or create stake account
        let stake_account = &mut ctx.accounts.stake_account;
        stake_account.owner = ctx.accounts.user.key();
        stake_account.amount += amount;
        stake_account.last_stake_time = Clock::get()?.unix_timestamp;

        // Calculate voting power (staked tokens + time multiplier)
        let time_multiplier = calculate_time_multiplier(stake_account.last_stake_time);
        stake_account.voting_power = stake_account.amount * time_multiplier;

        emit!(TokensStaked {
            user: ctx.accounts.user.key(),
            amount,
            total_staked: stake_account.amount,
            voting_power: stake_account.voting_power,
        });

        Ok(())
    }

    pub fn unstake_tokens(ctx: Context<UnstakeTokens>, amount: u64) -> Result<()> {
        let stake_account = &mut ctx.accounts.stake_account;
        require!(stake_account.amount >= amount, ErrorCode::InsufficientStake);

        // Check unstaking period (e.g., 7 days minimum stake)
        let current_time = Clock::get()?.unix_timestamp;
        let min_stake_period = 7 * 24 * 60 * 60; // 7 days in seconds
        require!(
            current_time >= stake_account.last_stake_time + min_stake_period,
            ErrorCode::UnstakingTooEarly
        );

        // Transfer tokens back to user
        let seeds = &[
            b"staking_vault",
            &[ctx.bumps.staking_vault],
        ];
        let signer = &[&seeds[..]];

        let transfer_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.staking_vault.to_account_info(),
                to: ctx.accounts.user_token_account.to_account_info(),
                authority: ctx.accounts.staking_vault.to_account_info(),
            },
            signer,
        );
        token::transfer(transfer_ctx, amount)?;

        // Update stake account
        stake_account.amount -= amount;
        let time_multiplier = calculate_time_multiplier(stake_account.last_stake_time);
        stake_account.voting_power = stake_account.amount * time_multiplier;

        emit!(TokensUnstaked {
            user: ctx.accounts.user.key(),
            amount,
            remaining_staked: stake_account.amount,
        });

        Ok(())
    }
}

// Account Structures
#[account]
pub struct DAOState {
    pub authority: Pubkey,
    pub voting_period: u32,
    pub min_proposal_threshold: u64,
    pub quorum_threshold: u8,
    pub total_proposals: u64,
    pub treasury_balance: u64,
    pub total_members: u64,
}

#[account]
pub struct Proposal {
    pub proposal_id: u64,
    pub proposer: Pubkey,
    pub title: String,
    pub description: String,
    pub proposal_type: ProposalType,
    pub execution_data: Option<Vec<u8>>,
    pub votes_for: u64,
    pub votes_against: u64,
    pub status: ProposalStatus,
    pub created_at: i64,
    pub voting_ends_at: i64,
    pub executed_at: Option<i64>,
    pub voters: Vec<VoteRecord>,
}

#[account]
pub struct StakeAccount {
    pub owner: Pubkey,
    pub amount: u64,
    pub voting_power: u64,
    pub last_stake_time: i64,
    pub rewards_earned: u64,
}

// Data Structures
#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct VoteRecord {
    pub voter: Pubkey,
    pub vote: Vote,
    pub voting_power: u64,
    pub timestamp: i64,
}

// Enums
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum ProposalType {
    FundingAllocation,
    ParameterChange,
    PartnershipApproval,
    ResearchPriority,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum ProposalStatus {
    Active,
    Executed,
    Rejected,
    Expired,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub enum Vote {
    For,
    Against,
}

// Context Structures
#[derive(Accounts)]
pub struct InitializeDAO<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 4 + 8 + 1 + 8 + 8 + 8,
        seeds = [b"dao_state"],
        bump
    )]
    pub dao_state: Account<'info, DAOState>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(proposal_id: u64)]
pub struct CreateProposal<'info> {
    #[account(
        init,
        payer = proposer,
        space = 8 + 8 + 32 + 256 + 1024 + 1 + 500 + 8 + 8 + 1 + 8 + 8 + 8 + 1000,
        seeds = [b"proposal", &proposal_id.to_le_bytes()],
        bump
    )]
    pub proposal: Account<'info, Proposal>,
    pub dao_state: Account<'info, DAOState>,
    #[account(mut)]
    pub proposer: Signer<'info>,
    pub proposer_token_account: Account<'info, TokenAccount>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct VoteOnProposal<'info> {
    #[account(mut)]
    pub proposal: Account<'info, Proposal>,
    pub voter: Signer<'info>,
    pub voter_token_account: Account<'info, TokenAccount>,
}

#[derive(Accounts)]
pub struct ExecuteProposal<'info> {
    #[account(mut)]
    pub proposal: Account<'info, Proposal>,
    pub dao_state: Account<'info, DAOState>,
    pub executor: Signer<'info>,
    pub token_mint: Account<'info, anchor_spl::token::Mint>,
}

#[derive(Accounts)]
pub struct StakeTokens<'info> {
    #[account(
        init_if_needed,
        payer = user,
        space = 8 + 32 + 8 + 8 + 8 + 8,
        seeds = [b"stake_account", user.key().as_ref()],
        bump
    )]
    pub stake_account: Account<'info, StakeAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        seeds = [b"staking_vault"],
        bump
    )]
    pub staking_vault: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UnstakeTokens<'info> {
    #[account(mut)]
    pub stake_account: Account<'info, StakeAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        seeds = [b"staking_vault"],
        bump
    )]
    pub staking_vault: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

// Events
#[event]
pub struct ProposalCreated {
    pub proposal_id: u64,
    pub proposer: Pubkey,
    pub title: String,
    pub proposal_type: ProposalType,
}

#[event]
pub struct VoteCast {
    pub proposal_id: u64,
    pub voter: Pubkey,
    pub vote: Vote,
    pub voting_power: u64,
}

#[event]
pub struct ProposalExecuted {
    pub proposal_id: u64,
    pub executed_by: Pubkey,
}

#[event]
pub struct TokensStaked {
    pub user: Pubkey,
    pub amount: u64,
    pub total_staked: u64,
    pub voting_power: u64,
}

#[event]
pub struct TokensUnstaked {
    pub user: Pubkey,
    pub amount: u64,
    pub remaining_staked: u64,
}

// Error Codes
#[error_code]
pub enum ErrorCode {
    #[msg("Insufficient tokens to create proposal")]
    InsufficientTokens,
    #[msg("Proposal is not active")]
    ProposalNotActive,
    #[msg("Voting period has ended")]
    VotingPeriodEnded,
    #[msg("Already voted on this proposal")]
    AlreadyVoted,
    #[msg("Voting is still active")]
    VotingStillActive,
    #[msg("Quorum not met")]
    QuorumNotMet,
    #[msg("Proposal was rejected")]
    ProposalRejected,
    #[msg("Invalid amount")]
    InvalidAmount,
    #[msg("Insufficient stake")]
    InsufficientStake,
    #[msg("Unstaking too early")]
    UnstakingTooEarly,
}

// Helper Functions
fn calculate_time_multiplier(stake_time: i64) -> u64 {
    let current_time = Clock::get().unwrap().unix_timestamp;
    let days_staked = (current_time - stake_time) / (24 * 60 * 60);
    
    // Multiplier increases with time staked (max 2x after 365 days)
    std::cmp::min(100 + days_staked as u64, 200)
}

fn execute_funding_allocation(_ctx: Context<ExecuteProposal>, _proposal: &mut Account<Proposal>) -> Result<()> {
    // Implementation for funding allocation
    msg!("Executing funding allocation proposal");
    Ok(())
}

fn execute_parameter_change(_ctx: Context<ExecuteProposal>, _proposal: &mut Account<Proposal>) -> Result<()> {
    // Implementation for parameter changes
    msg!("Executing parameter change proposal");
    Ok(())
}

fn execute_partnership_approval(_ctx: Context<ExecuteProposal>, _proposal: &mut Account<Proposal>) -> Result<()> {
    // Implementation for partnership approval
    msg!("Executing partnership approval proposal");
    Ok(())
}

fn execute_research_priority(_ctx: Context<ExecuteProposal>, _proposal: &mut Account<Proposal>) -> Result<()> {
    // Implementation for research priority changes
    msg!("Executing research priority proposal");
    Ok(())
}