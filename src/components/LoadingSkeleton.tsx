'use client';

import { motion } from 'framer-motion';

export default function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="group cursor-pointer"
        >
          <div className="relative overflow-hidden rounded-lg">
            <div className="w-full h-48 bg-gray-800 animate-pulse rounded-lg" />
            <div className="absolute top-2 right-2 bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-full font-medium">
              <div className="w-8 h-3 bg-gray-600 rounded animate-pulse" />
            </div>
          </div>
          <div className="mt-2">
            <div className="w-3/4 h-4 bg-gray-800 rounded animate-pulse mb-2" />
            <div className="w-1/2 h-3 bg-gray-800 rounded animate-pulse" />
          </div>
        </motion.div>
      ))}
    </div>
  );
} 