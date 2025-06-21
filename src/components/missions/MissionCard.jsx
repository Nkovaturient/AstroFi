import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { 
  Users, 
  Target, 
  Clock, 
  Star, 
  ExternalLink,
  Heart,
  Share2,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';

const MissionCard = ({ mission, loading = false }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  if (loading) {
    return <MissionCardSkeleton />;
  }

  const fundingProgress = (mission.currentFunding / mission.fundingGoal) * 100;
  const daysRemaining = Math.max(0, Math.floor((new Date(mission.deadline) - new Date()) / (1000 * 60 * 60 * 24)));

  const handleShare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: mission.title,
        text: mission.description,
        url: `/missions/${mission.id}`,
      });
    }
  };

  const handleLike = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  return (
    <Link href={`/missions/${mission.id}`}>
      <Card 
        className="group cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-cyan-500/10 overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image Container */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={mission.imageUrl || '/cosmos2.webp'}
            alt={mission.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Action Buttons */}
          <div className={`absolute top-4 right-4 flex space-x-2 transition-all duration-300 ${
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
          }`}>
            <Button
              variant="ghost"
              size="icon"
              className="bg-black/20 backdrop-blur-sm hover:bg-black/40"
              onClick={handleLike}
            >
              <Heart className={`w-4 h-4 transition-colors duration-200 ${
                isLiked ? 'text-red-400 fill-current' : 'text-white'
              }`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="bg-black/20 backdrop-blur-sm hover:bg-black/40"
              onClick={handleShare}
            >
              <Share2 className="w-4 h-4 text-white" />
            </Button>
          </div>

          {/* Status Badge */}
          <div className="absolute top-4 left-4">
            <Badge variant={mission.status === 'active' ? 'default' : 'secondary'}>
              {mission.status === 'active' ? 'Active' : 'Completed'}
            </Badge>
          </div>

          {/* Trending Badge */}
          {mission.trending && (
            <div className="absolute bottom-4 left-4">
              <Badge variant="success" className="flex items-center space-x-1">
                <TrendingUp className="w-3 h-3" />
                <span>Trending</span>
              </Badge>
            </div>
          )}
        </div>

        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg font-semibold text-white group-hover:text-cyan-400 transition-colors duration-200 line-clamp-2">
              {mission.title}
            </CardTitle>
            <div className="flex items-center space-x-1 text-yellow-400 ml-2">
              <Star className="w-4 h-4 fill-current" />
              <span className="text-sm font-medium">{mission.rating || '4.8'}</span>
            </div>
          </div>
          
          <p className="text-slate-400 text-sm line-clamp-2 mt-2">
            {mission.description}
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Progress Section */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Progress</span>
              <span className="text-cyan-400 font-medium">{fundingProgress.toFixed(1)}%</span>
            </div>
            <Progress value={fundingProgress} className="h-2" />
            <div className="flex justify-between text-sm">
              <span className="text-white font-medium">
                ${mission.currentFunding?.toLocaleString() || '0'}
              </span>
              <span className="text-slate-400">
                of ${mission.fundingGoal?.toLocaleString() || '0'}
              </span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 pt-2">
            <div className="text-center">
              <Users className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
              <div className="text-sm font-medium text-white">{mission.backers || 0}</div>
              <div className="text-xs text-slate-400">Backers</div>
            </div>
            <div className="text-center">
              <Clock className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
              <div className="text-sm font-medium text-white">{daysRemaining}</div>
              <div className="text-xs text-slate-400">Days left</div>
            </div>
            <div className="text-center">
              <Target className="w-4 h-4 text-green-400 mx-auto mb-1" />
              <div className="text-sm font-medium text-white">{mission.milestones?.length || 0}</div>
              <div className="text-xs text-slate-400">Milestones</div>
            </div>
          </div>

          {/* Creator Info */}
          <div className="flex items-center space-x-3 pt-2 border-t border-slate-700">
            <img
              src={mission.creator?.avatar || '/default-avatar.png'}
              alt={mission.creator?.name}
              className="w-8 h-8 rounded-full"
              loading="lazy"
            />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">
                {mission.creator?.name || 'Anonymous'}
              </div>
              <div className="text-xs text-slate-400">
                {mission.creator?.organization || 'Independent Researcher'}
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 transition-colors duration-200" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

const MissionCardSkeleton = () => {
  return (
    <Card className="overflow-hidden">
      <div className="h-48 bg-slate-800 animate-pulse" />
      <CardHeader className="pb-4">
        <div className="space-y-2">
          <div className="h-6 bg-slate-800 rounded animate-pulse" />
          <div className="h-4 bg-slate-800 rounded w-3/4 animate-pulse" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="h-2 bg-slate-800 rounded animate-pulse" />
          <div className="flex justify-between">
            <div className="h-4 bg-slate-800 rounded w-20 animate-pulse" />
            <div className="h-4 bg-slate-800 rounded w-20 animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="text-center space-y-1">
              <div className="h-4 w-4 bg-slate-800 rounded mx-auto animate-pulse" />
              <div className="h-4 bg-slate-800 rounded animate-pulse" />
              <div className="h-3 bg-slate-800 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MissionCard;