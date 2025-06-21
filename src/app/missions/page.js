'use client';

import React, { useState, useEffect } from 'react';
import MissionGrid from '@/components/missions/MissionGrid';
import { Badge } from '@/components/ui/Badge';
import { Rocket } from 'lucide-react';

// Mock data - replace with actual API calls
const mockMissions = [
  {
    id: 1,
    title: "Mars Habitat Construction Research",
    description: "Developing sustainable living solutions for future Mars colonies through advanced materials research and environmental systems.",
    currentFunding: 125000,
    fundingGoal: 200000,
    backers: 342,
    deadline: "2024-06-15",
    imageUrl: "/cosmos1.webp",
    category: "space-exploration",
    trending: true,
    rating: 4.9,
    creator: {
      name: "Dr. Sarah Chen",
      organization: "Mars Research Institute",
      avatar: "/default-avatar.png"
    },
    status: "active",
    createdAt: "2024-01-15"
  },
  {
    id: 2,
    title: "Exoplanet Detection Array",
    description: "Building next-generation telescopes to discover Earth-like planets in nearby star systems using advanced spectroscopy.",
    currentFunding: 89000,
    fundingGoal: 150000,
    backers: 256,
    deadline: "2024-07-20",
    imageUrl: "/cosmos2.webp",
    category: "research",
    trending: false,
    rating: 4.7,
    creator: {
      name: "Prof. Michael Rodriguez",
      organization: "Stellar Observatory",
      avatar: "/default-avatar.png"
    },
    status: "active",
    createdAt: "2024-02-01"
  },
  {
    id: 3,
    title: "Asteroid Mining Technology",
    description: "Developing robotic systems for extracting valuable resources from near-Earth asteroids to support space exploration.",
    currentFunding: 67000,
    fundingGoal: 100000,
    backers: 189,
    deadline: "2024-08-10",
    imageUrl: "/cosmos1.webp",
    category: "technology",
    trending: true,
    rating: 4.8,
    creator: {
      name: "Dr. Alex Thompson",
      organization: "Space Mining Corp",
      avatar: "/default-avatar.png"
    },
    status: "active",
    createdAt: "2024-01-20"
  },
  {
    id: 4,
    title: "Lunar Base Life Support Systems",
    description: "Creating closed-loop life support systems for sustainable lunar habitation including air recycling and water purification.",
    currentFunding: 156000,
    fundingGoal: 250000,
    backers: 423,
    deadline: "2024-09-15",
    imageUrl: "/cosmos2.webp",
    category: "space-exploration",
    trending: false,
    rating: 4.6,
    creator: {
      name: "Dr. Emily Watson",
      organization: "Lunar Research Foundation",
      avatar: "/default-avatar.png"
    },
    status: "active",
    createdAt: "2024-01-10"
  },
  {
    id: 5,
    title: "Deep Space Communication Network",
    description: "Establishing a robust communication infrastructure for deep space missions using quantum entanglement technology.",
    currentFunding: 234000,
    fundingGoal: 300000,
    backers: 567,
    deadline: "2024-10-30",
    imageUrl: "/cosmos1.webp",
    category: "technology",
    trending: true,
    rating: 4.9,
    creator: {
      name: "Dr. James Park",
      organization: "Quantum Communications Lab",
      avatar: "/default-avatar.png"
    },
    status: "active",
    createdAt: "2024-02-15"
  },
  {
    id: 6,
    title: "Space Debris Cleanup Mission",
    description: "Developing autonomous spacecraft to remove dangerous space debris and protect operational satellites.",
    currentFunding: 78000,
    fundingGoal: 120000,
    backers: 234,
    deadline: "2024-11-20",
    imageUrl: "/cosmos2.webp",
    category: "space-exploration",
    trending: false,
    rating: 4.5,
    creator: {
      name: "Dr. Lisa Chang",
      organization: "Orbital Cleanup Initiative",
      avatar: "/default-avatar.png"
    },
    status: "active",
    createdAt: "2024-02-20"
  }
];

export default function MissionsPage() {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const fetchMissions = async () => {
      setLoading(true);
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMissions(mockMissions);
      setLoading(false);
    };

    fetchMissions();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Badge className="px-4 py-2">
              <Rocket className="w-4 h-4 mr-2" />
              Space Missions
            </Badge>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Explore Active{' '}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Research Missions
            </span>
          </h1>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Discover groundbreaking space research projects that need your support. 
            From Mars colonization to deep space exploration, find missions that inspire you.
          </p>
        </div>

        {/* Mission Grid */}
        <MissionGrid missions={missions} loading={loading} />
      </div>
    </div>
  );
}