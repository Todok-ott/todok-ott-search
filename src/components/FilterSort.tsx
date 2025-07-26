'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Filter, SortAsc, SortDesc } from 'lucide-react';

interface FilterSortProps {
  onSortChange: (sortBy: string) => void;
  onFilterChange: (filterBy: string) => void;
}

export default function FilterSort({ onSortChange, onFilterChange }: FilterSortProps) {
  const [isOpen, setIsOpen] = useState(false);

  const sortOptions = [
    { value: 'popularity', label: '인기도순' },
    { value: 'rating', label: '평점순' },
    { value: 'date', label: '최신순' },
    { value: 'title', label: '제목순' }
  ];

  const filterOptions = [
    { value: 'all', label: '전체' },
    { value: 'movie', label: '영화' },
    { value: 'tv', label: '드라마' },
    { value: 'action', label: '액션' },
    { value: 'drama', label: '드라마' },
    { value: 'comedy', label: '코미디' }
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-black/20 backdrop-blur-sm border border-gray-600/30 rounded-lg px-4 py-2 text-white hover:bg-black/30 transition-colors"
      >
        <Filter className="w-4 h-4" />
        <span className="text-sm">필터 & 정렬</span>
      </button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-full left-0 mt-2 bg-black/90 backdrop-blur-md border border-gray-600/30 rounded-xl shadow-2xl z-50 min-w-48"
        >
          <div className="p-4">
            {/* 정렬 옵션 */}
            <div className="mb-4">
              <h4 className="text-white font-medium text-sm mb-2 flex items-center">
                <SortAsc className="w-4 h-4 mr-2" />
                정렬
              </h4>
              <div className="space-y-1">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      onSortChange(option.value);
                      setIsOpen(false);
                    }}
                    className="block w-full text-left text-gray-300 hover:text-white text-sm py-1 px-2 rounded transition-colors"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 필터 옵션 */}
            <div>
              <h4 className="text-white font-medium text-sm mb-2 flex items-center">
                <Filter className="w-4 h-4 mr-2" />
                필터
              </h4>
              <div className="space-y-1">
                {filterOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      onFilterChange(option.value);
                      setIsOpen(false);
                    }}
                    className="block w-full text-left text-gray-300 hover:text-white text-sm py-1 px-2 rounded transition-colors"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
} 