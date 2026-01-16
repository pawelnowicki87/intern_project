'use client';
import React from 'react';
import { SlidersHorizontal, TrendingUp, Calendar, Image, Film, Grid3x3 } from 'lucide-react';

type SortBy = 'date' | 'likes';
type SortOrder = 'asc' | 'desc';
type FilterType = 'ALL' | 'IMAGE' | 'CAROUSEL' | 'REEL';

interface FeedFilterBarProps {
  sortBy: SortBy;
  sortOrder: SortOrder;
  filterType: FilterType;
  onChangeSortBy: (value: SortBy) => void;
  onChangeSortOrder: (value: SortOrder) => void;
  onChangeFilterType: (value: FilterType) => void;
}

export default function FeedFilterBar({
  sortBy,
  sortOrder,
  filterType,
  onChangeSortBy,
  onChangeSortOrder,
  onChangeFilterType,
}: FeedFilterBarProps) {
  const filterTypes = [
    { value: 'ALL' as FilterType, label: 'All', icon: Grid3x3 },
    { value: 'IMAGE' as FilterType, label: 'Images', icon: Image },
    { value: 'CAROUSEL' as FilterType, label: 'Carousels', icon: Grid3x3 },
    { value: 'REEL' as FilterType, label: 'Reels', icon: Film },
  ];

  return (
    <div className="w-full bg-white border border-gray-300 rounded-none md:rounded-lg mb-4 md:mb-6 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 md:px-4 py-2.5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <SlidersHorizontal className="w-4 h-4 text-gray-600" />
        <span className="text-sm font-semibold text-gray-700">Filters</span>
      </div>

      {/* Filter Content */}
      <div className="p-3 md:p-4">
        {/* Sort & Order Section */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Sort by</span>
            <div className="flex rounded-lg overflow-hidden border border-gray-300">
              <button
                onClick={() => onChangeSortBy('date')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
                  sortBy === 'date'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                Newest
              </button>
              <button
                onClick={() => onChangeSortBy('likes')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border-l border-gray-300 transition-colors ${
                  sortBy === 'likes'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                Top Liked
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Order</span>
            <select
              aria-label="Sort order"
              value={sortOrder}
              onChange={(e) => onChangeSortOrder(e.target.value as SortOrder)}
              className="text-xs font-medium border border-gray-300 rounded-lg px-3 py-1.5 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
            >
              <option value="desc">↓ Descending</option>
              <option value="asc">↑ Ascending</option>
            </select>
          </div>
        </div>

        {/* Content Type Filter */}
        <div>
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">Content Type</span>
          <div className="flex flex-wrap gap-2">
            {filterTypes.map((type) => {
              const Icon = type.icon;
              const isActive = filterType === type.value;
              return (
                <button
                  key={type.value}
                  onClick={() => onChangeFilterType(type.value)}
                  className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-102'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {type.label}
                </button> 
              ); 
            })}
          </div>
        </div>
      </div>
    </div>
  );
}