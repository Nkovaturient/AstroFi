import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { Program, AnchorProvider, web3, BN } from '@project-serum/anchor';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from '@solana/spl-token';
import { useMemo } from 'react';
import { ResearchFundingIDL } from '../idl/research_funding';
import { GovernanceIDL } from '../idl/governance';
import { DeFiIntegrationIDL } from '../idl/defi_integration';

// Program IDs
const RESEARCH_FUNDING_PROGRAM_ID = new PublicKey('AstroFi1111111111111111111111111111111111111');
const GOVERNANCE_PROGRAM_ID = new PublicKey('AstroGov1111111111111111111111111111111111111');
const DEFI_PROGRAM_ID = new PublicKey('AstroDeFi111111111111111111111111111111111111');

export const useSolanaPrograms = () => {
  const { connection } = useConnection();
  const wallet = useWallet();

  const provider = useMemo(() => {
    if (!wallet.publicKey) return null;
    return new AnchorProvider(connection, wallet as any, {
      commitment: 'confirmed',
    });
  }, [connection, wallet]);

  const researchProgram = useMemo(() => {
    if (!provider) return null;
    return new Program(ResearchFundingIDL, RESEARCH_FUNDING_PROGRAM_ID, provider);
  }, [provider]);

  const governanceProgram = useMemo(() => {
    if (!provider) return null;
    return new Program(GovernanceIDL, GOVERNANCE_PROGRAM_ID, provider);
  }, [provider]);

  const defiProgram = useMemo(() => {
    if (!provider) return null;
    return new Program(DeFiIntegrationIDL, DEFI_PROGRAM_ID, provider);
  }, [provider]);

  // Research Funding Functions
  const createResearchProject = async (
    projectId: number,
    title: string,
    description: string,
    fundingGoal: number,
    durationDays: number,
    milestones: any[]
  ) => {
    if (!researchProgram || !wallet.publicKey) throw new Error('Program not initialized');

    const [projectPDA] = await PublicKey.findProgramAddress(
      [Buffer.from('research_project'), new BN(projectId).toArrayLike(Buffer, 'le', 8)],
      RESEARCH_FUNDING_PROGRAM_ID
    );

    const [platformStatePDA] = await PublicKey.findProgramAddress(
      [Buffer.from('platform_state')],
      RESEARCH_FUNDING_PROGRAM_ID
    );

    const tx = await researchProgram.methods
      .createResearchProject(
        new BN(projectId),
        title,
        description,
        new BN(fundingGoal),
        durationDays,
        milestones
      )
      .accounts({
        researchProject: projectPDA,
        platformState: platformStatePDA,
        creator: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return { signature: tx, projectPDA };
  };

  const fundProject = async (projectId: number, amount: number) => {
    if (!researchProgram || !wallet.publicKey) throw new Error('Program not initialized');

    const [projectPDA] = await PublicKey.findProgramAddress(
      [Buffer.from('research_project'), new BN(projectId).toArrayLike(Buffer, 'le', 8)],
      RESEARCH_FUNDING_PROGRAM_ID
    );

    const [platformStatePDA] = await PublicKey.findProgramAddress(
      [Buffer.from('platform_state')],
      RESEARCH_FUNDING_PROGRAM_ID
    );

    const [projectVaultPDA] = await PublicKey.findProgramAddress(
      [Buffer.from('project_vault'), new BN(projectId).toArrayLike(Buffer, 'le', 8)],
      RESEARCH_FUNDING_PROGRAM_ID
    );

    // Get user's token account
    const userTokenAccount = await getAssociatedTokenAddress(
      new PublicKey('ASTRO_TOKEN_MINT'), // Replace with actual ASTRO token mint
      wallet.publicKey
    );

    const tx = await researchProgram.methods
      .fundProject(new BN(amount))
      .accounts({
        researchProject: projectPDA,
        platformState: platformStatePDA,
        contributor: wallet.publicKey,
        contributorTokenAccount: userTokenAccount,
        projectVault: projectVaultPDA,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    return tx;
  };

  const mintContributionNFT = async (projectId: number) => {
    if (!researchProgram || !wallet.publicKey) throw new Error('Program not initialized');

    const [projectPDA] = await PublicKey.findProgramAddress(
      [Buffer.from('research_project'), new BN(projectId).toArrayLike(Buffer, 'le', 8)],
      RESEARCH_FUNDING_PROGRAM_ID
    );

    const [nftAccountPDA] = await PublicKey.findProgramAddress(
      [
        Buffer.from('contribution_nft'),
        new BN(projectId).toArrayLike(Buffer, 'le', 8),
        wallet.publicKey.toBuffer(),
      ],
      RESEARCH_FUNDING_PROGRAM_ID
    );

    const tx = await researchProgram.methods
      .mintContributionNft(new BN(projectId))
      .accounts({
        researchProject: projectPDA,
        nftAccount: nftAccountPDA,
        contributor: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return { signature: tx, nftPDA: nftAccountPDA };
  };

  // Governance Functions
  const createProposal = async (
    proposalId: number,
    title: string,
    description: string,
    proposalType: any,
    executionData?: number[]
  ) => {
    if (!governanceProgram || !wallet.publicKey) throw new Error('Program not initialized');

    const [proposalPDA] = await PublicKey.findProgramAddress(
      [Buffer.from('proposal'), new BN(proposalId).toArrayLike(Buffer, 'le', 8)],
      GOVERNANCE_PROGRAM_ID
    );

    const [daoStatePDA] = await PublicKey.findProgramAddress(
      [Buffer.from('dao_state')],
      GOVERNANCE_PROGRAM_ID
    );

    const userTokenAccount = await getAssociatedTokenAddress(
      new PublicKey('ASTRO_TOKEN_MINT'),
      wallet.publicKey
    );

    const tx = await governanceProgram.methods
      .createProposal(
        new BN(proposalId),
        title,
        description,
        proposalType,
        executionData || null
      )
      .accounts({
        proposal: proposalPDA,
        daoState: daoStatePDA,
        proposer: wallet.publicKey,
        proposerTokenAccount: userTokenAccount,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return { signature: tx, proposalPDA };
  };

  const voteOnProposal = async (proposalId: number, vote: 'For' | 'Against') => {
    if (!governanceProgram || !wallet.publicKey) throw new Error('Program not initialized');

    const [proposalPDA] = await PublicKey.findProgramAddress(
      [Buffer.from('proposal'), new BN(proposalId).toArrayLike(Buffer, 'le', 8)],
      GOVERNANCE_PROGRAM_ID
    );

    const userTokenAccount = await getAssociatedTokenAddress(
      new PublicKey('ASTRO_TOKEN_MINT'),
      wallet.publicKey
    );

    const voteEnum = vote === 'For' ? { for: {} } : { against: {} };

    const tx = await governanceProgram.methods
      .voteOnProposal(voteEnum)
      .accounts({
        proposal: proposalPDA,
        voter: wallet.publicKey,
        voterTokenAccount: userTokenAccount,
      })
      .rpc();

    return tx;
  };

  const stakeTokens = async (amount: number) => {
    if (!governanceProgram || !wallet.publicKey) throw new Error('Program not initialized');

    const [stakeAccountPDA] = await PublicKey.findProgramAddress(
      [Buffer.from('stake_account'), wallet.publicKey.toBuffer()],
      GOVERNANCE_PROGRAM_ID
    );

    const [stakingVaultPDA] = await PublicKey.findProgramAddress(
      [Buffer.from('staking_vault')],
      GOVERNANCE_PROGRAM_ID
    );

    const userTokenAccount = await getAssociatedTokenAddress(
      new PublicKey('ASTRO_TOKEN_MINT'),
      wallet.publicKey
    );

    const tx = await governanceProgram.methods
      .stakeTokens(new BN(amount))
      .accounts({
        stakeAccount: stakeAccountPDA,
        user: wallet.publicKey,
        userTokenAccount: userTokenAccount,
        stakingVault: stakingVaultPDA,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return tx;
  };

  // DeFi Functions
  const stakeForYield = async (farmId: string, amount: number) => {
    if (!defiProgram || !wallet.publicKey) throw new Error('Program not initialized');

    const farmPubkey = new PublicKey(farmId);
    
    const [userStakePDA] = await PublicKey.findProgramAddress(
      [Buffer.from('user_stake'), farmPubkey.toBuffer(), wallet.publicKey.toBuffer()],
      DEFI_PROGRAM_ID
    );

    const [farmVaultPDA] = await PublicKey.findProgramAddress(
      [Buffer.from('farm_vault'), farmPubkey.toBuffer()],
      DEFI_PROGRAM_ID
    );

    const userStakingAccount = await getAssociatedTokenAddress(
      new PublicKey('ASTRO_TOKEN_MINT'),
      wallet.publicKey
    );

    const tx = await defiProgram.methods
      .stakeForYield(new BN(amount))
      .accounts({
        yieldFarm: farmPubkey,
        userStake: userStakePDA,
        user: wallet.publicKey,
        userStakingAccount: userStakingAccount,
        farmVault: farmVaultPDA,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return tx;
  };

  const claimYieldRewards = async (farmId: string) => {
    if (!defiProgram || !wallet.publicKey) throw new Error('Program not initialized');

    const farmPubkey = new PublicKey(farmId);
    
    const [userStakePDA] = await PublicKey.findProgramAddress(
      [Buffer.from('user_stake'), farmPubkey.toBuffer(), wallet.publicKey.toBuffer()],
      DEFI_PROGRAM_ID
    );

    const [farmVaultPDA] = await PublicKey.findProgramAddress(
      [Buffer.from('farm_vault'), farmPubkey.toBuffer()],
      DEFI_PROGRAM_ID
    );

    const userRewardAccount = await getAssociatedTokenAddress(
      new PublicKey('REWARD_TOKEN_MINT'), // Replace with actual reward token mint
      wallet.publicKey
    );

    const tx = await defiProgram.methods
      .claimYieldRewards()
      .accounts({
        yieldFarm: farmPubkey,
        userStake: userStakePDA,
        user: wallet.publicKey,
        userRewardAccount: userRewardAccount,
        farmVault: farmVaultPDA,
        rewardVault: new PublicKey('REWARD_VAULT'), // Replace with actual reward vault
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    return tx;
  };

  const addLiquidity = async (
    poolId: string,
    amountA: number,
    amountB: number,
    minLiquidity: number
  ) => {
    if (!defiProgram || !wallet.publicKey) throw new Error('Program not initialized');

    const poolPubkey = new PublicKey(poolId);
    
    const [userLiquidityPDA] = await PublicKey.findProgramAddress(
      [Buffer.from('user_liquidity'), poolPubkey.toBuffer(), wallet.publicKey.toBuffer()],
      DEFI_PROGRAM_ID
    );

    const tx = await defiProgram.methods
      .addLiquidity(new BN(amountA), new BN(amountB), new BN(minLiquidity))
      .accounts({
        liquidityPool: poolPubkey,
        userLiquidity: userLiquidityPDA,
        user: wallet.publicKey,
        // Add other required accounts
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return tx;
  };

  const swapTokens = async (
    poolId: string,
    amountIn: number,
    minAmountOut: number,
    aToB: boolean
  ) => {
    if (!defiProgram || !wallet.publicKey) throw new Error('Program not initialized');

    const poolPubkey = new PublicKey(poolId);

    const tx = await defiProgram.methods
      .swapTokens(new BN(amountIn), new BN(minAmountOut), aToB)
      .accounts({
        liquidityPool: poolPubkey,
        user: wallet.publicKey,
        // Add other required accounts
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    return tx;
  };

  // Utility Functions
  const getProjectData = async (projectId: number) => {
    if (!researchProgram) throw new Error('Program not initialized');

    const [projectPDA] = await PublicKey.findProgramAddress(
      [Buffer.from('research_project'), new BN(projectId).toArrayLike(Buffer, 'le', 8)],
      RESEARCH_FUNDING_PROGRAM_ID
    );

    return await researchProgram.account.researchProject.fetch(projectPDA);
  };

  const getProposalData = async (proposalId: number) => {
    if (!governanceProgram) throw new Error('Program not initialized');

    const [proposalPDA] = await PublicKey.findProgramAddress(
      [Buffer.from('proposal'), new BN(proposalId).toArrayLike(Buffer, 'le', 8)],
      GOVERNANCE_PROGRAM_ID
    );

    return await governanceProgram.account.proposal.fetch(proposalPDA);
  };

  const getUserStakeData = async (farmId: string) => {
    if (!defiProgram || !wallet.publicKey) throw new Error('Program not initialized');

    const farmPubkey = new PublicKey(farmId);
    
    const [userStakePDA] = await PublicKey.findProgramAddress(
      [Buffer.from('user_stake'), farmPubkey.toBuffer(), wallet.publicKey.toBuffer()],
      DEFI_PROGRAM_ID
    );

    try {
      return await defiProgram.account.userStake.fetch(userStakePDA);
    } catch (error) {
      return null; // User hasn't staked yet
    }
  };

  return {
    // Research Funding
    createResearchProject,
    fundProject,
    mintContributionNFT,
    getProjectData,

    // Governance
    createProposal,
    voteOnProposal,
    stakeTokens,
    getProposalData,

    // DeFi
    stakeForYield,
    claimYieldRewards,
    addLiquidity,
    swapTokens,
    getUserStakeData,

    // Program instances
    researchProgram,
    governanceProgram,
    defiProgram,
    provider,
  };
};

export default useSolanaPrograms;