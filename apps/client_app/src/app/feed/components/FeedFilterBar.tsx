'use client';
import React, { useEffect, useRef, useState } from 'react';
import { SlidersHorizontal, TrendingUp, Calendar, ChevronDown } from 'lucide-react';

type SortBy = 'date' | 'likes';
type SortOrder = 'asc' | 'desc';
interface FeedFilterBarProps {
  sortBy: SortBy;
  sortOrder: SortOrder;
  onChangeSortBy: (value: SortBy) => void;
  onChangeSortOrder: (value: SortOrder) => void;
}

export default function FeedFilterBar({
  sortBy,
  sortOrder,
  onChangeSortBy,
  onChangeSortOrder,
}: FeedFilterBarProps) {
  const [orderOpen, setOrderOpen] = useState(false);
  const orderRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!orderOpen) return;
    const onDocMouseDown = (e: MouseEvent) => {
      const root = orderRef.current;
      if (!root) return;
      if (root.contains(e.target as Node)) return;
      setOrderOpen(false);
    };
    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, [orderOpen]);

  

  return (
    <div className="w-full bg-white border border-gray-300 rounded-none md:rounded-lg mb-4 md:mb-6 overflow-hidden">
      <div className="flex items-center gap-2 px-3 md:px-4 py-2.5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <SlidersHorizontal className="w-4 h-4 text-gray-600" />
        <span className="text-sm font-semibold text-gray-700">Filters</span>
      </div>

      <div className="p-3 md:p-4">
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
            <div className="relative" ref={orderRef}>
              <button
                type="button"
                aria-label="Sort order"
                aria-haspopup="menu"
                aria-expanded={orderOpen}
                onClick={() => setOrderOpen((v) => !v)}
                className="flex items-center gap-2 text-xs font-medium border border-gray-300 rounded-lg px-3 py-1.5 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
              >
                <span>{sortOrder === 'desc' ? '↓ Descending' : '↑ Ascending'}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${orderOpen ? 'rotate-180' : ''}`} />
              </button>

              {orderOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 min-w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-20"
                >
                  <button
                    type="button"
                    role="menuitem"
                    className={`w-full text-left px-3 py-2 text-xs font-medium hover:bg-gray-50 transition-colors ${
                      sortOrder === 'desc' ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => {
                      onChangeSortOrder('desc');
                      setOrderOpen(false);
                    }}
                  >
                    ↓ Descending
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    className={`w-full text-left px-3 py-2 text-xs font-medium hover:bg-gray-50 transition-colors ${
                      sortOrder === 'asc' ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => {
                      onChangeSortOrder('asc');
                      setOrderOpen(false);
                    }}
                  >
                    ↑ Ascending
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        
      </div>
    </div>
  );
}
