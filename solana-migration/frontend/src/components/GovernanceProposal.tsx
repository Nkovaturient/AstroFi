import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Vote, Clock, Users, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useSolanaPrograms } from '@/hooks/useSolanaPrograms';
import { useWallet } from '@solana/wallet-adapter-react';
import { toast } from 'react-hot-toast';

interface VoteRecord {
  voter: string;
  vote: 'For' | 'Against';
  votingPower: number;
  timestamp: number;
}

interface Proposal {
  proposalId: number;
  proposer: string;
  title: string;
  description: string;
  proposalType: 'FundingAllocation' | 'ParameterChange' | 'PartnershipApproval' | 'ResearchPriority';
  executionData?: number[];
  votesFor: number;
  votesAgainst: number;
  status: 'Active' | 'Executed' | 'Rejected' | 'Expired';
  createdAt: number;
  votingEndsAt: number;
  executedAt?: number;
  voters: VoteRecord[];
}

interface GovernanceProposalProps {
  proposal?: Proposal;
  isCreateMode?: boolean;
  onUpdate?: () => void;
}

export const GovernanceProposal: React.FC<GovernanceProposalProps> = ({ 
  proposal, 
  isCreateMode = false,
  onUpdate 
}) => {
  const { createProposal, voteOnProposal } = useSolanaPrograms();
  const { publicKey, connected } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [showVoteDialog, setShowVoteDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Create proposal form state
  const [newProposal, setNewProposal] = useState({
    title: '',
    description: '',
    proposalType: 'FundingAllocation' as const,
    executionData: ''
  });

  const totalVotes = proposal ? proposal.votesFor + proposal.votesAgainst : 0;
  const forPercentage = totalVotes > 0 ? (proposal!.votesFor / totalVotes) * 100 : 0;
  const againstPercentage = totalVotes > 0 ? (proposal!.votesAgainst / totalVotes) * 100 : 0;

  const timeRemaining = proposal ? Math.max(0, proposal.votingEndsAt - Math.floor(Date.now() / 1000)) : 0;
  const daysRemaining = Math.floor(timeRemaining / (24 * 60 * 60));
  const hoursRemaining = Math.floor((timeRemaining % (24 * 60 * 60)) / (60 * 60));

  const hasUserVoted = proposal?.voters.some(v => v.voter === publicKey?.toString()) || false;

  const handleCreateProposal = async () => {
    if (!connected || !publicKey) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!newProposal.title || !newProposal.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      const proposalId = Date.now(); // Simple ID generation
      const executionData = newProposal.executionData 
        ? newProposal.executionData.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n))
        : undefined;

      const proposalTypeEnum = { [newProposal.proposalType.toLowerCase()]: {} };

      const { signature } = await createProposal(
        proposalId,
        newProposal.title,
        newProposal.description,
        proposalTypeEnum,
        executionData
      );

      toast.success('Proposal created successfully!');
      setNewProposal({ title: '', description: '', proposalType: 'FundingAllocation', executionData: '' });
      setShowCreateDialog(false);
      onUpdate?.();
    } catch (error) {
      console.error('Failed to create proposal:', error);
      toast.error('Failed to create proposal');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVote = async (vote: 'For' | 'Against') => {
    if (!connected || !publicKey || !proposal) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (hasUserVoted) {
      toast.error('You have already voted on this proposal');
      return;
    }

    if (proposal.status !== 'Active') {
      toast.error('Voting is not active for this proposal');
      return;
    }

    setIsLoading(true);
    try {
      await voteOnProposal(proposal.proposalId, vote);
      toast.success(`Vote cast: ${vote}`);
      setShowVoteDialog(false);
      onUpdate?.();
    } catch (error) {
      console.error('Failed to vote:', error);
      toast.error('Failed to cast vote');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-500';
      case 'Executed': return 'bg-blue-500';
      case 'Rejected': return 'bg-red-500';
      case 'Expired': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getProposalTypeColor = (type: string) => {
    switch (type) {
      case 'FundingAllocation': return 'bg-purple-500';
      case 'ParameterChange': return 'bg-orange-500';
      case 'PartnershipApproval': return 'bg-cyan-500';
      case 'ResearchPriority': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  if (isCreateMode) {
    return (
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogTrigger asChild>
          <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
            <Vote className="w-4 h-4 mr-2" />
            Create Proposal
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-purple-400">Create New Governance Proposal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <Input
                placeholder="Proposal title"
                value={newProposal.title}
                onChange={(e) => setNewProposal(prev => ({ ...prev, title: e.target.value }))}
                className="bg-slate-800 border-slate-600 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Proposal Type</label>
              <Select 
                value={newProposal.proposalType} 
                onValueChange={(value: any) => setNewProposal(prev => ({ ...prev, proposalType: value }))}
              >
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="FundingAllocation">Funding Allocation</SelectItem>
                  <SelectItem value="ParameterChange">Parameter Change</SelectItem>
                  <SelectItem value="PartnershipApproval">Partnership Approval</SelectItem>
                  <SelectItem value="ResearchPriority">Research Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Textarea
                placeholder="Detailed description of the proposal"
                value={newProposal.description}
                onChange={(e) => setNewProposal(prev => ({ ...prev, description: e.target.value }))}
                className="bg-slate-800 border-slate-600 text-white min-h-[120px]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Execution Data (optional)
              </label>
              <Input
                placeholder="Comma-separated numbers for execution"
                value={newProposal.executionData}
                onChange={(e) => setNewProposal(prev => ({ ...prev, executionData: e.target.value }))}
                className="bg-slate-800 border-slate-600 text-white"
              />
              <div className="text-sm text-gray-400 mt-1">
                Optional execution parameters for the proposal
              </div>
            </div>

            <Button 
              onClick={handleCreateProposal}
              disabled={isLoading || !newProposal.title || !newProposal.description}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {isLoading ? 'Creating...' : 'Create Proposal'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!proposal) return null;

  return (
    <Card className="w-full max-w-3xl mx-auto bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 text-white">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-xl font-bold text-purple-400 mb-2">
              {proposal.title}
            </CardTitle>
            <div className="flex space-x-2">
              <Badge className={`${getStatusColor(proposal.status)} text-white`}>
                {proposal.status}
              </Badge>
              <Badge className={`${getProposalTypeColor(proposal.proposalType)} text-white`}>
                {proposal.proposalType.replace(/([A-Z])/g, ' $1').trim()}
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">Proposal #{proposal.proposalId}</div>
            {proposal.status === 'Active' && (
              <div className="text-sm text-yellow-400">
                {daysRemaining}d {hoursRemaining}h remaining
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Description */}
        <p className="text-gray-300 leading-relaxed">
          {proposal.description}
        </p>

        {/* Voting Results */}
        <div className="space-y-4">
          <h4 className="font-semibold text-purple-400">Voting Results</h4>
          
          <div className="space-y-3">
            {/* For Votes */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 font-medium">For</span>
                </div>
                <span className="text-green-400 font-bold">
                  {(proposal.votesFor / 1e6).toLocaleString()} ASTRO ({forPercentage.toFixed(1)}%)
                </span>
              </div>
              <Progress value={forPercentage} className="h-2 bg-slate-700">
                <div 
                  className="h-full bg-green-500 transition-all duration-300"
                  style={{ width: `${forPercentage}%` }}
                />
              </Progress>
            </div>

            {/* Against Votes */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <XCircle className="w-4 h-4 text-red-400" />
                  <span className="text-red-400 font-medium">Against</span>
                </div>
                <span className="text-red-400 font-bold">
                  {(proposal.votesAgainst / 1e6).toLocaleString()} ASTRO ({againstPercentage.toFixed(1)}%)
                </span>
              </div>
              <Progress value={againstPercentage} className="h-2 bg-slate-700">
                <div 
                  className="h-full bg-red-500 transition-all duration-300"
                  style={{ width: `${againstPercentage}%` }}
                />
              </Progress>
            </div>
          </div>

          {/* Voting Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-slate-800 rounded-lg">
              <Users className="w-5 h-5 mx-auto mb-1 text-purple-400" />
              <div className="text-lg font-semibold">{proposal.voters.length}</div>
              <div className="text-xs text-gray-400">Voters</div>
            </div>
            
            <div className="text-center p-3 bg-slate-800 rounded-lg">
              <Vote className="w-5 h-5 mx-auto mb-1 text-cyan-400" />
              <div className="text-lg font-semibold">
                {(totalVotes / 1e6).toLocaleString()}
              </div>
              <div className="text-xs text-gray-400">Total ASTRO</div>
            </div>
            
            <div className="text-center p-3 bg-slate-800 rounded-lg">
              <Clock className="w-5 h-5 mx-auto mb-1 text-yellow-400" />
              <div className="text-lg font-semibold">
                {proposal.status === 'Active' ? `${daysRemaining}d` : 'Ended'}
              </div>
              <div className="text-xs text-gray-400">Time Left</div>
            </div>
          </div>
        </div>

        {/* Voting Actions */}
        {proposal.status === 'Active' && connected && (
          <div className="space-y-3">
            {hasUserVoted ? (
              <div className="flex items-center justify-center space-x-2 p-3 bg-slate-800 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-green-400">You have already voted on this proposal</span>
              </div>
            ) : (
              <Dialog open={showVoteDialog} onOpenChange={setShowVoteDialog}>
                <DialogTrigger asChild>
                  <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                    <Vote className="w-4 h-4 mr-2" />
                    Cast Your Vote
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-900 border-slate-700 text-white">
                  <DialogHeader>
                    <DialogTitle className="text-purple-400">Cast Your Vote</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="bg-slate-800 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">{proposal.title}</h4>
                      <p className="text-sm text-gray-300">{proposal.description}</p>
                    </div>

                    <div className="flex space-x-3">
                      <Button 
                        onClick={() => handleVote('For')}
                        disabled={isLoading}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Vote For
                      </Button>
                      <Button 
                        onClick={() => handleVote('Against')}
                        disabled={isLoading}
                        className="flex-1 bg-red-600 hover:bg-red-700"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Vote Against
                      </Button>
                    </div>

                    {isLoading && (
                      <div className="text-center text-gray-400">
                        Processing your vote...
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        )}

        {/* Proposal Info */}
        <div className="pt-4 border-t border-slate-700 space-y-2">
          <div className="text-sm text-gray-400">
            Proposed by: <span className="text-purple-400 font-mono">
              {proposal.proposer.slice(0, 8)}...{proposal.proposer.slice(-8)}
            </span>
          </div>
          <div className="text-sm text-gray-400">
            Created: {new Date(proposal.createdAt * 1000).toLocaleDateString()}
          </div>
          {proposal.executedAt && (
            <div className="text-sm text-gray-400">
              Executed: {new Date(proposal.executedAt * 1000).toLocaleDateString()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default GovernanceProposal;