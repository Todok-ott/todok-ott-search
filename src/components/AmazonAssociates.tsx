'use client';

import { motion } from 'framer-motion';
import { ExternalLink, ShoppingCart } from 'lucide-react';
import Image from 'next/image';

interface AmazonAssociatesProps {
  productTitle: string;
  productImage: string;
  productPrice: string;
  amazonUrl: string;
  className?: string;
}

export default function AmazonAssociates({ 
  productTitle, 
  productImage, 
  productPrice, 
  amazonUrl, 
  className = '' 
}: AmazonAssociatesProps) {
  // 아마존 제휴 링크 생성 (실제 태그 ID로 교체 필요)
  const affiliateUrl = `${amazonUrl}?tag=your-tag-id-20`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`bg-black/20 border border-gray-600/20 rounded-lg p-4 hover:border-yellow-500/30 transition-colors ${className}`}
    >
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0">
          <Image
            src={productImage}
            alt={productTitle}
            width={64}
            height={64}
            className="w-16 h-16 rounded object-cover"
          />
        </div>
        
        <div className="flex-1">
          <h4 className="text-white font-medium text-sm mb-1 line-clamp-2">
            {productTitle}
          </h4>
          <p className="text-yellow-500 font-semibold text-lg mb-2">
            {productPrice}
          </p>
          
          <a
            href={affiliateUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>아마존에서 구매</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
      
      <div className="mt-3 text-xs text-gray-400">
        <p>※ 제휴 링크를 통해 구매하시면 수수료 없이 추가 혜택을 받으실 수 있습니다.</p>
      </div>
    </motion.div>
  );
} 