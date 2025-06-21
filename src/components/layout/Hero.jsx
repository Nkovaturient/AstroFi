import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ArrowRight, Rocket, Users, DollarSign, Star } from 'lucide-react';
import Link from 'next/link';

const Hero = () => {
  const [currentStat, setCurrentStat] = useState(0);
  
  const stats = [
    { label: 'Active Missions', value: '127', icon: Rocket },
    { label: 'Total Funded', value: '$2.4M', icon: DollarSign },
    { label: 'Contributors', value: '15.2K', icon: Users },
    { label: 'Success Rate', value: '94%', icon: Star },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % stats.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900/20 to-purple-900/20">
        <div className="absolute inset-0 bg-[url('/cosmos1.webp')] bg-cover bg-center opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="mb-8 flex justify-center">
          <Badge className="px-4 py-2 text-sm animate-in fade-in-0 slide-in-from-bottom-4 duration-1000">
            🚀 Powered by Stellar Blockchain
          </Badge>
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 animate-in fade-in-0 slide-in-from-bottom-6 duration-1000 delay-200">
          Fund the{' '}
          <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            Future
          </span>
          <br />
          of Space Research
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed animate-in fade-in-0 slide-in-from-bottom-8 duration-1000 delay-400">
          Join the decentralized revolution in space exploration. Fund groundbreaking missions, 
          earn exclusive NFTs, and be part of humanity's greatest discoveries.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-in fade-in-0 slide-in-from-bottom-10 duration-1000 delay-600">
          <Link href="/missions">
            <Button size="lg" className="group text-lg px-8 py-4">
              Explore Missions
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
            </Button>
          </Link>
          <Link href="/create">
            <Button variant="outline" size="lg" className="text-lg px-8 py-4">
              Start a Mission
            </Button>
          </Link>
        </div>

        {/* Animated Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto animate-in fade-in-0 slide-in-from-bottom-12 duration-1000 delay-800">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            const isActive = index === currentStat;
            
            return (
              <div
                key={stat.label}
                className={`p-6 rounded-xl border transition-all duration-500 ${
                  isActive 
                    ? 'bg-cyan-500/10 border-cyan-500/50 scale-105' 
                    : 'bg-slate-800/30 border-slate-700/50'
                }`}
              >
                <Icon className={`w-8 h-8 mx-auto mb-3 transition-colors duration-500 ${
                  isActive ? 'text-cyan-400' : 'text-slate-400'
                }`} />
                <div className={`text-2xl font-bold mb-1 transition-colors duration-500 ${
                  isActive ? 'text-cyan-400' : 'text-white'
                }`}>
                  {stat.value}
                </div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-slate-400 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-slate-400 rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </div>
  );
};

export default Hero;