use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("AstroFi1111111111111111111111111111111111111");

#[program]
pub mod research_funding {
    use super::*;

    pub fn initialize_platform(
        ctx: Context<InitializePlatform>,
        platform_fee: u16,
        min_funding_amount: u64,
    ) -> Result<()> {
        let platform_state = &mut ctx.accounts.platform_state;
        platform_state.authority = ctx.accounts.authority.key();
        platform_state.platform_fee = platform_fee;
        platform_state.min_funding_amount = min_funding_amount;
        platform_state.total_projects = 0;
        platform_state.total_funding = 0;
        platform_state.is_paused = false;
        
        msg!("AstroFi platform initialized with fee: {}%", platform_fee);
        Ok(())
    }

    pub fn create_research_project(
        ctx: Context<CreateResearchProject>,
        project_id: u64,
        title: String,
        description: String,
        funding_goal: u64,
        duration_days: u32,
        milestones: Vec<Milestone>,
    ) -> Result<()> {
        require!(!ctx.accounts.platform_state.is_paused, ErrorCode::PlatformPaused);
        require!(funding_goal >= ctx.accounts.platform_state.min_funding_amount, ErrorCode::FundingTooLow);
        require!(milestones.len() > 0 && milestones.len() <= 10, ErrorCode::InvalidMilestones);

        let project = &mut ctx.accounts.research_project;
        project.project_id = project_id;
        project.creator = ctx.accounts.creator.key();
        project.title = title;
        project.description = description;
        project.funding_goal = funding_goal;
        project.current_funding = 0;
        project.duration_days = duration_days;
        project.milestones = milestones;
        project.status = ProjectStatus::Active;
        project.created_at = Clock::get()?.unix_timestamp;
        project.contributors = Vec::new();

        // Update platform stats
        let platform_state = &mut ctx.accounts.platform_state;
        platform_state.total_projects += 1;

        emit!(ProjectCreated {
            project_id,
            creator: ctx.accounts.creator.key(),
            funding_goal,
            title: project.title.clone(),
        });

        Ok(())
    }

    pub fn fund_project(
        ctx: Context<FundProject>,
        amount: u64,
    ) -> Result<()> {
        require!(!ctx.accounts.platform_state.is_paused, ErrorCode::PlatformPaused);
        require!(amount > 0, ErrorCode::InvalidAmount);

        let project = &mut ctx.accounts.research_project;
        require!(project.status == ProjectStatus::Active, ErrorCode::ProjectNotActive);
        require!(project.current_funding + amount <= project.funding_goal, ErrorCode::ExceedsFundingGoal);

        // Transfer tokens from contributor to project vault
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.contributor_token_account.to_account_info(),
                to: ctx.accounts.project_vault.to_account_info(),
                authority: ctx.accounts.contributor.to_account_info(),
            },
        );
        token::transfer(transfer_ctx, amount)?;

        // Update project funding
        project.current_funding += amount;
        
        // Add contributor if not already present
        let contributor_key = ctx.accounts.contributor.key();
        if let Some(existing) = project.contributors.iter_mut().find(|c| c.address == contributor_key) {
            existing.amount += amount;
        } else {
            project.contributors.push(Contributor {
                address: contributor_key,
                amount,
                timestamp: Clock::get()?.unix_timestamp,
            });
        }

        // Update platform stats
        let platform_state = &mut ctx.accounts.platform_state;
        platform_state.total_funding += amount;

        // Check if funding goal reached
        if project.current_funding >= project.funding_goal {
            project.status = ProjectStatus::Funded;
            emit!(ProjectFunded {
                project_id: project.project_id,
                total_funding: project.current_funding,
            });
        }

        emit!(ProjectContribution {
            project_id: project.project_id,
            contributor: contributor_key,
            amount,
            total_funding: project.current_funding,
        });

        Ok(())
    }

    pub fn complete_milestone(
        ctx: Context<CompleteMilestone>,
        milestone_index: u8,
        evidence_hash: [u8; 32],
    ) -> Result<()> {
        let project = &mut ctx.accounts.research_project;
        require!(project.creator == ctx.accounts.creator.key(), ErrorCode::Unauthorized);
        require!(project.status == ProjectStatus::Funded, ErrorCode::ProjectNotFunded);
        require!((milestone_index as usize) < project.milestones.len(), ErrorCode::InvalidMilestone);

        let milestone = &mut project.milestones[milestone_index as usize];
        require!(milestone.status == MilestoneStatus::Pending, ErrorCode::MilestoneAlreadyCompleted);

        milestone.status = MilestoneStatus::UnderReview;
        milestone.evidence_hash = Some(evidence_hash);
        milestone.submitted_at = Some(Clock::get()?.unix_timestamp);

        emit!(MilestoneSubmitted {
            project_id: project.project_id,
            milestone_index,
            evidence_hash,
        });

        Ok(())
    }

    pub fn validate_milestone(
        ctx: Context<ValidateMilestone>,
        milestone_index: u8,
        approved: bool,
    ) -> Result<()> {
        // Only authorized validators can approve milestones
        require!(ctx.accounts.validator.is_validator, ErrorCode::NotValidator);

        let project = &mut ctx.accounts.research_project;
        require!((milestone_index as usize) < project.milestones.len(), ErrorCode::InvalidMilestone);

        let milestone = &mut project.milestones[milestone_index as usize];
        require!(milestone.status == MilestoneStatus::UnderReview, ErrorCode::InvalidMilestoneStatus);

        if approved {
            milestone.status = MilestoneStatus::Completed;
            milestone.approved_at = Some(Clock::get()?.unix_timestamp);

            // Release milestone funds
            let release_amount = (project.current_funding * milestone.funding_percentage as u64) / 100;
            
            // Transfer from project vault to creator
            let seeds = &[
                b"project_vault",
                &project.project_id.to_le_bytes(),
                &[ctx.bumps.project_vault],
            ];
            let signer = &[&seeds[..]];

            let transfer_ctx = CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.project_vault.to_account_info(),
                    to: ctx.accounts.creator_token_account.to_account_info(),
                    authority: ctx.accounts.project_vault.to_account_info(),
                },
                signer,
            );
            token::transfer(transfer_ctx, release_amount)?;

            emit!(MilestoneCompleted {
                project_id: project.project_id,
                milestone_index,
                funds_released: release_amount,
            });
        } else {
            milestone.status = MilestoneStatus::Rejected;
        }

        Ok(())
    }

    pub fn mint_contribution_nft(
        ctx: Context<MintContributionNFT>,
        project_id: u64,
    ) -> Result<()> {
        let project = &ctx.accounts.research_project;
        let contributor_key = ctx.accounts.contributor.key();

        // Verify contributor has funded this project
        let contribution = project.contributors.iter()
            .find(|c| c.address == contributor_key)
            .ok_or(ErrorCode::NotContributor)?;

        // Mint NFT with metadata including contribution details
        let nft_metadata = ContributionNFT {
            project_id,
            contributor: contributor_key,
            amount: contribution.amount,
            timestamp: contribution.timestamp,
            project_title: project.title.clone(),
            rarity: calculate_rarity(contribution.amount, project.funding_goal),
        };

        // Store NFT metadata
        let nft_account = &mut ctx.accounts.nft_account;
        nft_account.metadata = nft_metadata;

        emit!(NFTMinted {
            project_id,
            contributor: contributor_key,
            amount: contribution.amount,
        });

        Ok(())
    }
}

// Account Structures
#[account]
pub struct PlatformState {
    pub authority: Pubkey,
    pub platform_fee: u16,
    pub min_funding_amount: u64,
    pub total_projects: u64,
    pub total_funding: u64,
    pub is_paused: bool,
}

#[account]
pub struct ResearchProject {
    pub project_id: u64,
    pub creator: Pubkey,
    pub title: String,
    pub description: String,
    pub funding_goal: u64,
    pub current_funding: u64,
    pub duration_days: u32,
    pub milestones: Vec<Milestone>,
    pub status: ProjectStatus,
    pub created_at: i64,
    pub contributors: Vec<Contributor>,
}

#[account]
pub struct ValidatorAccount {
    pub authority: Pubkey,
    pub is_validator: bool,
    pub reputation_score: u32,
    pub validations_completed: u64,
}

#[account]
pub struct ContributionNFTAccount {
    pub metadata: ContributionNFT,
}

// Data Structures
#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct Milestone {
    pub title: String,
    pub description: String,
    pub funding_percentage: u8,
    pub status: MilestoneStatus,
    pub evidence_hash: Option<[u8; 32]>,
    pub submitted_at: Option<i64>,
    pub approved_at: Option<i64>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct Contributor {
    pub address: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct ContributionNFT {
    pub project_id: u64,
    pub contributor: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
    pub project_title: String,
    pub rarity: NFTRarity,
}

// Enums
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum ProjectStatus {
    Active,
    Funded,
    Completed,
    Cancelled,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum MilestoneStatus {
    Pending,
    UnderReview,
    Completed,
    Rejected,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub enum NFTRarity {
    Common,
    Rare,
    Epic,
    Legendary,
}

// Context Structures
#[derive(Accounts)]
pub struct InitializePlatform<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 2 + 8 + 8 + 8 + 1,
        seeds = [b"platform_state"],
        bump
    )]
    pub platform_state: Account<'info, PlatformState>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(project_id: u64)]
pub struct CreateResearchProject<'info> {
    #[account(
        init,
        payer = creator,
        space = 8 + 8 + 32 + 256 + 512 + 8 + 8 + 4 + 1000 + 1 + 8 + 500,
        seeds = [b"research_project", &project_id.to_le_bytes()],
        bump
    )]
    pub research_project: Account<'info, ResearchProject>,
    #[account(mut)]
    pub platform_state: Account<'info, PlatformState>,
    #[account(mut)]
    pub creator: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct FundProject<'info> {
    #[account(mut)]
    pub research_project: Account<'info, ResearchProject>,
    #[account(mut)]
    pub platform_state: Account<'info, PlatformState>,
    #[account(mut)]
    pub contributor: Signer<'info>,
    #[account(mut)]
    pub contributor_token_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        seeds = [b"project_vault", &research_project.project_id.to_le_bytes()],
        bump
    )]
    pub project_vault: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct CompleteMilestone<'info> {
    #[account(mut)]
    pub research_project: Account<'info, ResearchProject>,
    pub creator: Signer<'info>,
}

#[derive(Accounts)]
pub struct ValidateMilestone<'info> {
    #[account(mut)]
    pub research_project: Account<'info, ResearchProject>,
    pub validator: Account<'info, ValidatorAccount>,
    #[account(mut)]
    pub project_vault: Account<'info, TokenAccount>,
    #[account(mut)]
    pub creator_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct MintContributionNFT<'info> {
    pub research_project: Account<'info, ResearchProject>,
    #[account(
        init,
        payer = contributor,
        space = 8 + 200,
        seeds = [b"contribution_nft", &research_project.project_id.to_le_bytes(), contributor.key().as_ref()],
        bump
    )]
    pub nft_account: Account<'info, ContributionNFTAccount>,
    #[account(mut)]
    pub contributor: Signer<'info>,
    pub system_program: Program<'info, System>,
}

// Events
#[event]
pub struct ProjectCreated {
    pub project_id: u64,
    pub creator: Pubkey,
    pub funding_goal: u64,
    pub title: String,
}

#[event]
pub struct ProjectContribution {
    pub project_id: u64,
    pub contributor: Pubkey,
    pub amount: u64,
    pub total_funding: u64,
}

#[event]
pub struct ProjectFunded {
    pub project_id: u64,
    pub total_funding: u64,
}

#[event]
pub struct MilestoneSubmitted {
    pub project_id: u64,
    pub milestone_index: u8,
    pub evidence_hash: [u8; 32],
}

#[event]
pub struct MilestoneCompleted {
    pub project_id: u64,
    pub milestone_index: u8,
    pub funds_released: u64,
}

#[event]
pub struct NFTMinted {
    pub project_id: u64,
    pub contributor: Pubkey,
    pub amount: u64,
}

// Error Codes
#[error_code]
pub enum ErrorCode {
    #[msg("Platform is currently paused")]
    PlatformPaused,
    #[msg("Funding amount is below minimum")]
    FundingTooLow,
    #[msg("Invalid number of milestones")]
    InvalidMilestones,
    #[msg("Invalid amount")]
    InvalidAmount,
    #[msg("Project is not active")]
    ProjectNotActive,
    #[msg("Funding exceeds goal")]
    ExceedsFundingGoal,
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("Project is not funded")]
    ProjectNotFunded,
    #[msg("Invalid milestone index")]
    InvalidMilestone,
    #[msg("Milestone already completed")]
    MilestoneAlreadyCompleted,
    #[msg("Not a validator")]
    NotValidator,
    #[msg("Invalid milestone status")]
    InvalidMilestoneStatus,
    #[msg("Not a contributor")]
    NotContributor,
}

// Helper Functions
fn calculate_rarity(contribution: u64, total_goal: u64) -> NFTRarity {
    let percentage = (contribution * 100) / total_goal;
    match percentage {
        0..=1 => NFTRarity::Common,
        2..=5 => NFTRarity::Rare,
        6..=15 => NFTRarity::Epic,
        _ => NFTRarity::Legendary,
    }
}