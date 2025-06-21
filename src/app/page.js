import React from 'react';
import Hero from '@/components/layout/Hero';
import MissionGrid from '@/components/missions/MissionGrid';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  Rocket, 
  Users, 
  Globe, 
  Shield, 
  Zap, 
  Award,
  ArrowRight,
  Star
} from 'lucide-react';
import Link from 'next/link';

// Mock data for featured missions
const featuredMissions = [
  {
    id: 1,
    title: "Mars Habitat Construction Research",
    description: "Developing sustainable living solutions for future Mars colonies through advanced materials research.",
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
    }
  },
  {
    id: 2,
    title: "Exoplanet Detection Array",
    description: "Building next-generation telescopes to discover Earth-like planets in nearby star systems.",
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
    }
  },
  {
    id: 3,
    title: "Asteroid Mining Technology",
    description: "Developing robotic systems for extracting valuable resources from near-Earth asteroids.",
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
    }
  }
];

const features = [
  {
    icon: Shield,
    title: "Secure & Transparent",
    description: "All transactions are secured by blockchain technology with complete transparency."
  },
  {
    icon: Zap,
    title: "Fast Funding",
    description: "Get your research funded quickly with our streamlined approval process."
  },
  {
    icon: Globe,
    title: "Global Community",
    description: "Connect with researchers and backers from around the world."
  },
  {
    icon: Award,
    title: "NFT Rewards",
    description: "Earn unique NFT certificates for your contributions to space research."
  }
];

const stats = [
  { label: "Total Funded", value: "$12.4M", icon: Rocket },
  { label: "Active Missions", value: "247", icon: Star },
  { label: "Global Contributors", value: "28.5K", icon: Users },
  { label: "Success Rate", value: "94%", icon: Award }
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <Hero />

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="text-center p-6 hover:scale-105 transition-transform duration-300">
                  <Icon className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-slate-400">{stat.label}</div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Missions */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-4">Featured Missions</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Groundbreaking Research Awaits Your Support
            </h2>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto">
              Discover cutting-edge space research projects that need your backing to push the boundaries of human knowledge.
            </p>
          </div>

          <MissionGrid missions={featuredMissions} />

          <div className="text-center mt-12">
            <Link href="/missions">
              <Button size="lg" className="group">
                Explore All Missions
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-800/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Why Choose AstroFi?
            </h2>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto">
              We're revolutionizing how space research gets funded with cutting-edge blockchain technology.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="p-6 text-center hover:scale-105 transition-transform duration-300">
                  <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-slate-400 text-sm">{feature.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Fund the Future?
          </h2>
          <p className="text-xl text-slate-400 mb-8">
            Join thousands of contributors supporting groundbreaking space research projects.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/missions">
              <Button size="lg" className="px-8">
                Start Contributing
              </Button>
            </Link>
            <Link href="/create">
              <Button variant="outline" size="lg" className="px-8">
                Submit Your Research
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}