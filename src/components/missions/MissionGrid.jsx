import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import MissionCard from './MissionCard';
import { Search, Filter, SortAsc, Grid, List } from 'lucide-react';

const MissionGrid = ({ missions = [], loading = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('trending');
  const [viewMode, setViewMode] = useState('grid');
  const [filteredMissions, setFilteredMissions] = useState([]);

  const categories = [
    { id: 'all', label: 'All Missions', count: missions.length },
    { id: 'space-exploration', label: 'Space Exploration', count: 45 },
    { id: 'research', label: 'Research', count: 32 },
    { id: 'technology', label: 'Technology', count: 28 },
    { id: 'education', label: 'Education', count: 22 },
  ];

  const sortOptions = [
    { id: 'trending', label: 'Trending' },
    { id: 'newest', label: 'Newest' },
    { id: 'funding', label: 'Most Funded' },
    { id: 'deadline', label: 'Ending Soon' },
  ];

  useEffect(() => {
    let filtered = missions;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(mission =>
        mission.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mission.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(mission => mission.category === selectedCategory);
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'funding':
        filtered.sort((a, b) => b.currentFunding - a.currentFunding);
        break;
      case 'deadline':
        filtered.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
        break;
      default:
        // Trending - could be based on recent activity, funding velocity, etc.
        filtered.sort((a, b) => (b.trending ? 1 : 0) - (a.trending ? 1 : 0));
    }

    setFilteredMissions(filtered);
  }, [missions, searchTerm, selectedCategory, sortBy]);

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search missions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-4">
          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-slate-800 border border-slate-600 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            {sortOptions.map(option => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>

          {/* View Mode */}
          <div className="flex items-center space-x-1 bg-slate-800 rounded-md p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        {categories.map(category => (
          <Badge
            key={category.id}
            variant={selectedCategory === category.id ? 'default' : 'secondary'}
            className="cursor-pointer hover:scale-105 transition-transform duration-200"
            onClick={() => setSelectedCategory(category.id)}
          >
            {category.label} ({category.count})
          </Badge>
        ))}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-slate-400 text-sm">
          {loading ? 'Loading...' : `${filteredMissions.length} missions found`}
        </p>
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSearchTerm('')}
          >
            Clear search
          </Button>
        )}
      </div>

      {/* Mission Grid */}
      <div className={`grid gap-6 ${
        viewMode === 'grid' 
          ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
          : 'grid-cols-1'
      }`}>
        {loading ? (
          // Loading skeletons
          [...Array(6)].map((_, i) => (
            <MissionCard key={i} loading={true} />
          ))
        ) : filteredMissions.length > 0 ? (
          filteredMissions.map(mission => (
            <MissionCard key={mission.id} mission={mission} />
          ))
        ) : (
          // Empty state
          <div className="col-span-full text-center py-12">
            <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No missions found</h3>
            <p className="text-slate-400 mb-4">
              Try adjusting your search terms or filters
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
            >
              Clear all filters
            </Button>
          </div>
        )}
      </div>

      {/* Load More */}
      {!loading && filteredMissions.length > 0 && (
        <div className="text-center pt-8">
          <Button variant="outline" size="lg">
            Load More Missions
          </Button>
        </div>
      )}
    </div>
  );
};

export default MissionGrid;