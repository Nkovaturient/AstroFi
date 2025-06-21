'use client';

import React from 'react';
import CreateMissionForm from '@/components/create/CreateMissionForm';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { Plus, Shield, Clock, Award } from 'lucide-react';

const benefits = [
  {
    icon: Shield,
    title: "Secure Funding",
    description: "Your funds are protected by smart contracts and released based on milestone completion."
  },
  {
    icon: Clock,
    title: "Fast Approval",
    description: "Get your mission reviewed and approved within 24-48 hours by our expert team."
  },
  {
    icon: Award,
    title: "Global Reach",
    description: "Access a worldwide community of space enthusiasts and potential backers."
  }
];

export default function CreatePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Badge className="px-4 py-2">
              <Plus className="w-4 h-4 mr-2" />
              Create Mission
            </Badge>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Launch Your{' '}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Research Mission
            </span>
          </h1>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-8">
            Turn your space research ideas into reality. Create a mission, set your funding goals, 
            and connect with supporters who believe in your vision.
          </p>

          {/* Benefits */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <Card key={index} className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{benefit.title}</h3>
                  <p className="text-slate-400 text-sm">{benefit.description}</p>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Form */}
        <CreateMissionForm />
      </div>
    </div>
  );
}