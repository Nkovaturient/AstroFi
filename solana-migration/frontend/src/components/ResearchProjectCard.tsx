import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Rocket, Users, Target, Clock, Award } from 'lucide-react';
import { useSolanaPrograms } from '@/hooks/useSolanaPrograms';
import { useWallet } from '@solana/wallet-adapter-react';
import { toast } from 'react-hot-toast';

interface Milestone {
  title: string;
  description: string;
  fundingPercentage: number;
  status: 'Pending' | 'UnderReview' | 'Completed' | 'Rejected';
}

interface ResearchProject {
  projectId: number;
  creator: string;
  title: string;
  description: string;
  fundingGoal: number;
  currentFunding: number;
  durationDays: number;
  milestones: Milestone[];
  status: 'Active' | 'Funded' | 'Completed' | 'Cancelled';
  createdAt: number;
  contributors: Array<{
    address: string;
    amount: number;
    timestamp: number;
  }>;
}

interface ResearchProjectCardProps {
  project: ResearchProject;
  onUpdate?: () => void;
}

export const ResearchProjectCard: React.FC<ResearchProjectCardProps> = ({ 
  project, 
  onUpdate 
}) => {
  const { fundProject, mintContributionNFT } = useSolanaPrograms();
  const { publicKey, connected } = useWallet();
  const [fundingAmount, setFundingAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showFundingDialog, setShowFundingDialog] = useState(false);

  const fundingProgress = (project.currentFunding / project.fundingGoal) * 100;
  const remainingFunding = project.fundingGoal - project.currentFunding;
  const daysRemaining = Math.max(0, project.durationDays - Math.floor((Date.now() / 1000 - project.createdAt) / (24 * 60 * 60)));

  const handleFundProject = async () => {
    if (!connected || !publicKey) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!fundingAmount || parseFloat(fundingAmount) <= 0) {
      toast.error('Please enter a valid funding amount');
      return;
    }

    const amount = parseFloat(fundingAmount) * 1e6; // Convert to token decimals

    if (amount > remainingFunding * 1e6) {
      toast.error('Funding amount exceeds remaining goal');
      return;
    }

    setIsLoading(true);
    try {
      // Fund the project
      const fundTx = await fundProject(project.projectId, amount);
      toast.success('Project funded successfully!');

      // Mint contribution NFT
      try {
        const { signature: nftTx } = await mintContributionNFT(project.projectId);
        toast.success('Contribution NFT minted!');
      } catch (nftError) {
        console.error('NFT minting failed:', nftError);
        toast.error('Funding successful, but NFT minting failed');
      }

      setFundingAmount('');
      setShowFundingDialog(false);
      onUpdate?.();
    } catch (error) {
      console.error('Funding failed:', error);
      toast.error('Failed to fund project');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-500';
      case 'Funded': return 'bg-blue-500';
      case 'Completed': return 'bg-purple-500';
      case 'Cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getMilestoneStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-500';
      case 'UnderReview': return 'bg-yellow-500';
      case 'Rejected': return 'bg-red-500';
      default: return 'bg-gray-300';
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 text-white">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-xl font-bold text-cyan-400 mb-2">
              {project.title}
            </CardTitle>
            <Badge className={`${getStatusColor(project.status)} text-white`}>
              {project.status}
            </Badge>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-400">
              {(project.currentFunding / 1e6).toLocaleString()} ASTRO
            </div>
            <div className="text-sm text-gray-400">
              of {(project.fundingGoal / 1e6).toLocaleString()} ASTRO
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Description */}
        <p className="text-gray-300 leading-relaxed">
          {project.description}
        </p>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Funding Progress</span>
            <span>{fundingProgress.toFixed(1)}%</span>
          </div>
          <Progress value={fundingProgress} className="h-3 bg-slate-700">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
              style={{ width: `${fundingProgress}%` }}
            />
          </Progress>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-slate-800 rounded-lg">
            <Users className="w-5 h-5 mx-auto mb-1 text-cyan-400" />
            <div className="text-lg font-semibold">{project.contributors.length}</div>
            <div className="text-xs text-gray-400">Contributors</div>
          </div>
          
          <div className="text-center p-3 bg-slate-800 rounded-lg">
            <Target className="w-5 h-5 mx-auto mb-1 text-green-400" />
            <div className="text-lg font-semibold">
              {(remainingFunding / 1e6).toLocaleString()}
            </div>
            <div className="text-xs text-gray-400">ASTRO Remaining</div>
          </div>
          
          <div className="text-center p-3 bg-slate-800 rounded-lg">
            <Clock className="w-5 h-5 mx-auto mb-1 text-yellow-400" />
            <div className="text-lg font-semibold">{daysRemaining}</div>
            <div className="text-xs text-gray-400">Days Left</div>
          </div>
          
          <div className="text-center p-3 bg-slate-800 rounded-lg">
            <Award className="w-5 h-5 mx-auto mb-1 text-purple-400" />
            <div className="text-lg font-semibold">{project.milestones.length}</div>
            <div className="text-xs text-gray-400">Milestones</div>
          </div>
        </div>

        {/* Milestones */}
        <div className="space-y-3">
          <h4 className="font-semibold text-cyan-400">Research Milestones</h4>
          <div className="space-y-2">
            {project.milestones.map((milestone, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-slate-800 rounded-lg">
                <div className={`w-3 h-3 rounded-full ${getMilestoneStatusColor(milestone.status)}`} />
                <div className="flex-1">
                  <div className="font-medium">{milestone.title}</div>
                  <div className="text-sm text-gray-400">{milestone.description}</div>
                </div>
                <div className="text-sm text-cyan-400">
                  {milestone.fundingPercentage}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          {project.status === 'Active' && (
            <Dialog open={showFundingDialog} onOpenChange={setShowFundingDialog}>
              <DialogTrigger asChild>
                <Button 
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                  disabled={!connected}
                >
                  <Rocket className="w-4 h-4 mr-2" />
                  Fund Mission
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-slate-700 text-white">
                <DialogHeader>
                  <DialogTitle className="text-cyan-400">Fund Research Project</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Funding Amount (ASTRO)
                    </label>
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      value={fundingAmount}
                      onChange={(e) => setFundingAmount(e.target.value)}
                      className="bg-slate-800 border-slate-600 text-white"
                      min="0"
                      max={remainingFunding / 1e6}
                      step="0.1"
                    />
                    <div className="text-sm text-gray-400 mt-1">
                      Maximum: {(remainingFunding / 1e6).toLocaleString()} ASTRO
                    </div>
                  </div>
                  
                  <div className="bg-slate-800 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Contribution Benefits:</h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• Exclusive research updates</li>
                      <li>• Contribution NFT certificate</li>
                      <li>• Voting rights on project decisions</li>
                      <li>• Access to research data and publications</li>
                    </ul>
                  </div>

                  <Button 
                    onClick={handleFundProject}
                    disabled={isLoading || !fundingAmount}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                  >
                    {isLoading ? 'Processing...' : 'Confirm Funding'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
          
          <Button 
            variant="outline" 
            className="border-slate-600 text-slate-300 hover:bg-slate-800"
          >
            View Details
          </Button>
        </div>

        {/* Creator Info */}
        <div className="pt-4 border-t border-slate-700">
          <div className="text-sm text-gray-400">
            Created by: <span className="text-cyan-400 font-mono">
              {project.creator.slice(0, 8)}...{project.creator.slice(-8)}
            </span>
          </div>
          <div className="text-sm text-gray-400">
            Created: {new Date(project.createdAt * 1000).toLocaleDateString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResearchProjectCard;