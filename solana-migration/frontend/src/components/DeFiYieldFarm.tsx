import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Coins, Clock, Award, ArrowUpDown, Droplets } from 'lucide-react';
import { useSolanaPrograms } from '@/hooks/useSolanaPrograms';
import { useWallet } from '@solana/wallet-adapter-react';
import { toast } from 'react-hot-toast';

interface YieldFarm {
  id: string;
  name: string;
  stakingToken: string;
  rewardToken: string;
  apr: number;
  totalStaked: number;
  lockPeriod: number; // in days
  isActive: boolean;
}

interface UserStake {
  amount: number;
  pendingRewards: number;
  lastUpdateTime: number;
  lockEndTime: number;
  totalClaimed: number;
}

interface LiquidityPool {
  id: string;
  tokenA: string;
  tokenB: string;
  reserveA: number;
  reserveB: number;
  totalLiquidity: number;
  feeRate: number;
  apr: number;
}

interface DeFiYieldFarmProps {
  farm?: YieldFarm;
  pool?: LiquidityPool;
  type: 'farm' | 'pool';
}

export const DeFiYieldFarm: React.FC<DeFiYieldFarmProps> = ({ farm, pool, type }) => {
  const { 
    stakeForYield, 
    claimYieldRewards, 
    addLiquidity, 
    swapTokens, 
    getUserStakeData 
  } = useSolanaPrograms();
  const { publicKey, connected } = useWallet();
  
  const [userStake, setUserStake] = useState<UserStake | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showStakeDialog, setShowStakeDialog] = useState(false);
  const [showLiquidityDialog, setShowLiquidityDialog] = useState(false);
  const [showSwapDialog, setShowSwapDialog] = useState(false);

  // Form states
  const [stakeAmount, setStakeAmount] = useState('');
  const [liquidityAmountA, setLiquidityAmountA] = useState('');
  const [liquidityAmountB, setLiquidityAmountB] = useState('');
  const [swapAmountIn, setSwapAmountIn] = useState('');
  const [swapMinOut, setSwapMinOut] = useState('');
  const [swapDirection, setSwapDirection] = useState<'AtoB' | 'BtoA'>('AtoB');

  useEffect(() => {
    if (connected && publicKey && farm) {
      loadUserStakeData();
    }
  }, [connected, publicKey, farm]);

  const loadUserStakeData = async () => {
    if (!farm) return;
    
    try {
      const stakeData = await getUserStakeData(farm.id);
      setUserStake(stakeData);
    } catch (error) {
      console.error('Failed to load user stake data:', error);
    }
  };

  const handleStake = async () => {
    if (!connected || !publicKey || !farm) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      toast.error('Please enter a valid stake amount');
      return;
    }

    setIsLoading(true);
    try {
      const amount = parseFloat(stakeAmount) * 1e6; // Convert to token decimals
      await stakeForYield(farm.id, amount);
      toast.success('Tokens staked successfully!');
      setStakeAmount('');
      setShowStakeDialog(false);
      await loadUserStakeData();
    } catch (error) {
      console.error('Staking failed:', error);
      toast.error('Failed to stake tokens');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaimRewards = async () => {
    if (!connected || !publicKey || !farm) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!userStake || userStake.pendingRewards <= 0) {
      toast.error('No rewards to claim');
      return;
    }

    setIsLoading(true);
    try {
      await claimYieldRewards(farm.id);
      toast.success('Rewards claimed successfully!');
      await loadUserStakeData();
    } catch (error) {
      console.error('Claiming rewards failed:', error);
      toast.error('Failed to claim rewards');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddLiquidity = async () => {
    if (!connected || !publicKey || !pool) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!liquidityAmountA || !liquidityAmountB || 
        parseFloat(liquidityAmountA) <= 0 || parseFloat(liquidityAmountB) <= 0) {
      toast.error('Please enter valid amounts for both tokens');
      return;
    }

    setIsLoading(true);
    try {
      const amountA = parseFloat(liquidityAmountA) * 1e6;
      const amountB = parseFloat(liquidityAmountB) * 1e6;
      const minLiquidity = Math.min(amountA, amountB) * 0.95; // 5% slippage tolerance

      await addLiquidity(pool.id, amountA, amountB, minLiquidity);
      toast.success('Liquidity added successfully!');
      setLiquidityAmountA('');
      setLiquidityAmountB('');
      setShowLiquidityDialog(false);
    } catch (error) {
      console.error('Adding liquidity failed:', error);
      toast.error('Failed to add liquidity');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwap = async () => {
    if (!connected || !publicKey || !pool) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!swapAmountIn || !swapMinOut || 
        parseFloat(swapAmountIn) <= 0 || parseFloat(swapMinOut) <= 0) {
      toast.error('Please enter valid swap amounts');
      return;
    }

    setIsLoading(true);
    try {
      const amountIn = parseFloat(swapAmountIn) * 1e6;
      const minAmountOut = parseFloat(swapMinOut) * 1e6;
      const aToB = swapDirection === 'AtoB';

      await swapTokens(pool.id, amountIn, minAmountOut, aToB);
      toast.success('Swap completed successfully!');
      setSwapAmountIn('');
      setSwapMinOut('');
      setShowSwapDialog(false);
    } catch (error) {
      console.error('Swap failed:', error);
      toast.error('Failed to complete swap');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateEstimatedRewards = () => {
    if (!userStake || !farm) return 0;
    const dailyReward = (userStake.amount * farm.apr) / (365 * 100);
    return dailyReward;
  };

  const isStakeLocked = () => {
    if (!userStake) return false;
    return Date.now() / 1000 < userStake.lockEndTime;
  };

  if (type === 'farm' && farm) {
    return (
      <Card className="w-full max-w-lg bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 text-white">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold text-cyan-400 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            {farm.name}
          </CardTitle>
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold text-green-400">{farm.apr}% APR</span>
            <span className="text-sm text-gray-400">
              Lock: {farm.lockPeriod} days
            </span>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Farm Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-slate-800 rounded-lg">
              <Coins className="w-5 h-5 mx-auto mb-1 text-cyan-400" />
              <div className="text-lg font-semibold">
                {(farm.totalStaked / 1e6).toLocaleString()}
              </div>
              <div className="text-xs text-gray-400">Total Staked</div>
            </div>
            
            <div className="text-center p-3 bg-slate-800 rounded-lg">
              <Clock className="w-5 h-5 mx-auto mb-1 text-yellow-400" />
              <div className="text-lg font-semibold">{farm.lockPeriod}d</div>
              <div className="text-xs text-gray-400">Lock Period</div>
            </div>
          </div>

          {/* User Position */}
          {userStake && (
            <div className="bg-slate-800 p-4 rounded-lg space-y-3">
              <h4 className="font-semibold text-cyan-400">Your Position</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-400">Staked</div>
                  <div className="font-semibold">
                    {(userStake.amount / 1e6).toLocaleString()} {farm.stakingToken}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400">Pending Rewards</div>
                  <div className="font-semibold text-green-400">
                    {(userStake.pendingRewards / 1e6).toFixed(4)} {farm.rewardToken}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400">Total Claimed</div>
                  <div className="font-semibold">
                    {(userStake.totalClaimed / 1e6).toLocaleString()} {farm.rewardToken}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400">Daily Rewards</div>
                  <div className="font-semibold text-purple-400">
                    {calculateEstimatedRewards().toFixed(4)} {farm.rewardToken}
                  </div>
                </div>
              </div>
              
              {isStakeLocked() && (
                <div className="text-sm text-yellow-400 flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  Locked until {new Date(userStake.lockEndTime * 1000).toLocaleDateString()}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <Dialog open={showStakeDialog} onOpenChange={setShowStakeDialog}>
              <DialogTrigger asChild>
                <Button 
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                  disabled={!connected || !farm.isActive}
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Stake Tokens
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-slate-700 text-white">
                <DialogHeader>
                  <DialogTitle className="text-cyan-400">Stake {farm.stakingToken}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Amount to Stake
                    </label>
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                      className="bg-slate-800 border-slate-600 text-white"
                    />
                  </div>
                  
                  <div className="bg-slate-800 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Staking Details:</h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• APR: {farm.apr}%</li>
                      <li>• Lock Period: {farm.lockPeriod} days</li>
                      <li>• Reward Token: {farm.rewardToken}</li>
                      <li>• Estimated Daily Rewards: {stakeAmount ? ((parseFloat(stakeAmount) * farm.apr) / (365 * 100)).toFixed(4) : '0'} {farm.rewardToken}</li>
                    </ul>
                  </div>

                  <Button 
                    onClick={handleStake}
                    disabled={isLoading || !stakeAmount}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                  >
                    {isLoading ? 'Staking...' : 'Confirm Stake'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {userStake && userStake.pendingRewards > 0 && (
              <Button 
                onClick={handleClaimRewards}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              >
                <Award className="w-4 h-4 mr-2" />
                {isLoading ? 'Claiming...' : `Claim ${(userStake.pendingRewards / 1e6).toFixed(4)} ${farm.rewardToken}`}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (type === 'pool' && pool) {
    return (
      <Card className="w-full max-w-lg bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 text-white">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold text-purple-400 flex items-center">
            <Droplets className="w-5 h-5 mr-2" />
            {pool.tokenA}/{pool.tokenB} Pool
          </CardTitle>
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold text-green-400">{pool.apr}% APR</span>
            <span className="text-sm text-gray-400">
              Fee: {pool.feeRate / 100}%
            </span>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Pool Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-slate-800 rounded-lg">
              <div className="text-lg font-semibold">
                {(pool.reserveA / 1e6).toLocaleString()}
              </div>
              <div className="text-xs text-gray-400">{pool.tokenA} Reserve</div>
            </div>
            
            <div className="text-center p-3 bg-slate-800 rounded-lg">
              <div className="text-lg font-semibold">
                {(pool.reserveB / 1e6).toLocaleString()}
              </div>
              <div className="text-xs text-gray-400">{pool.tokenB} Reserve</div>
            </div>
          </div>

          {/* Action Tabs */}
          <Tabs defaultValue="liquidity" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-slate-800">
              <TabsTrigger value="liquidity" className="data-[state=active]:bg-purple-600">
                Add Liquidity
              </TabsTrigger>
              <TabsTrigger value="swap" className="data-[state=active]:bg-cyan-600">
                Swap
              </TabsTrigger>
            </TabsList>

            <TabsContent value="liquidity" className="space-y-3">
              <Dialog open={showLiquidityDialog} onOpenChange={setShowLiquidityDialog}>
                <DialogTrigger asChild>
                  <Button 
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    disabled={!connected}
                  >
                    <Droplets className="w-4 h-4 mr-2" />
                    Add Liquidity
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-900 border-slate-700 text-white">
                  <DialogHeader>
                    <DialogTitle className="text-purple-400">Add Liquidity</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {pool.tokenA} Amount
                      </label>
                      <Input
                        type="number"
                        placeholder="0.0"
                        value={liquidityAmountA}
                        onChange={(e) => setLiquidityAmountA(e.target.value)}
                        className="bg-slate-800 border-slate-600 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {pool.tokenB} Amount
                      </label>
                      <Input
                        type="number"
                        placeholder="0.0"
                        value={liquidityAmountB}
                        onChange={(e) => setLiquidityAmountB(e.target.value)}
                        className="bg-slate-800 border-slate-600 text-white"
                      />
                    </div>

                    <Button 
                      onClick={handleAddLiquidity}
                      disabled={isLoading || !liquidityAmountA || !liquidityAmountB}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    >
                      {isLoading ? 'Adding...' : 'Add Liquidity'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </TabsContent>

            <TabsContent value="swap" className="space-y-3">
              <Dialog open={showSwapDialog} onOpenChange={setShowSwapDialog}>
                <DialogTrigger asChild>
                  <Button 
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                    disabled={!connected}
                  >
                    <ArrowUpDown className="w-4 h-4 mr-2" />
                    Swap Tokens
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-900 border-slate-700 text-white">
                  <DialogHeader>
                    <DialogTitle className="text-cyan-400">Swap Tokens</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        From ({swapDirection === 'AtoB' ? pool.tokenA : pool.tokenB})
                      </label>
                      <Input
                        type="number"
                        placeholder="0.0"
                        value={swapAmountIn}
                        onChange={(e) => setSwapAmountIn(e.target.value)}
                        className="bg-slate-800 border-slate-600 text-white"
                      />
                    </div>

                    <div className="flex justify-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSwapDirection(swapDirection === 'AtoB' ? 'BtoA' : 'AtoB')}
                        className="border-slate-600 text-slate-300 hover:bg-slate-800"
                      >
                        <ArrowUpDown className="w-4 h-4" />
                      </Button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        To ({swapDirection === 'AtoB' ? pool.tokenB : pool.tokenA}) (minimum)
                      </label>
                      <Input
                        type="number"
                        placeholder="0.0"
                        value={swapMinOut}
                        onChange={(e) => setSwapMinOut(e.target.value)}
                        className="bg-slate-800 border-slate-600 text-white"
                      />
                    </div>

                    <Button 
                      onClick={handleSwap}
                      disabled={isLoading || !swapAmountIn || !swapMinOut}
                      className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                    >
                      {isLoading ? 'Swapping...' : 'Swap'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    );
  }

  return null;
};

export default DeFiYieldFarm;