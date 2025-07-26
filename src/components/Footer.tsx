'use client';

import { motion } from 'framer-motion';
import { Heart, ExternalLink, Github } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-t from-[#0a0a0a] to-[#121212] border-t border-gray-600/20 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* 브랜드 섹션 */}
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true, margin: "-50px" }}
          >
            <motion.h3 
              className="text-2xl font-bold text-white cursor-pointer"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
              onClick={() => window.location.href = '/'}
            >
              토독
              <span className="text-[#FFD700] text-lg ml-2">(Todok)</span>
            </motion.h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              찾고, 발견하고, 즐기세요. 모든 OTT 플랫폼의 콘텐츠를 한 번에 검색하고, 
              당신만을 위한 완벽한 시청 경험을 제공합니다.
            </p>
            <div className="flex items-center space-x-2 text-gray-500 text-xs">
              <Heart className="w-4 h-4 text-red-500" />
              <span>Made with passion for discovery</span>
            </div>
          </motion.div>

          {/* 빠른 링크 */}
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
            viewport={{ once: true, margin: "-50px" }}
          >
            <h4 className="text-white font-semibold mb-4">빠른 링크</h4>
            <div className="space-y-2">
              <motion.a 
                href="/popular" 
                className="block text-gray-400 hover:text-[#FFD700] transition-colors duration-200 text-sm"
                whileHover={{ x: 3 }}
                transition={{ duration: 0.2 }}
              >
                인기 영화
              </motion.a>
              <motion.a 
                href="/tv" 
                className="block text-gray-400 hover:text-[#FFD700] transition-colors duration-200 text-sm"
                whileHover={{ x: 3 }}
                transition={{ duration: 0.2 }}
              >
                최신 드라마
              </motion.a>
              <motion.a 
                href="/latest" 
                className="block text-gray-400 hover:text-[#FFD700] transition-colors duration-200 text-sm"
                whileHover={{ x: 3 }}
                transition={{ duration: 0.2 }}
              >
                추천 콘텐츠
              </motion.a>
              <motion.a 
                href="/search" 
                className="block text-gray-400 hover:text-[#FFD700] transition-colors duration-200 text-sm"
                whileHover={{ x: 3 }}
                transition={{ duration: 0.2 }}
              >
                OTT 비교
              </motion.a>
            </div>
          </motion.div>

          {/* 소셜 & API */}
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            viewport={{ once: true, margin: "-50px" }}
          >
            <h4 className="text-white font-semibold mb-4">연결</h4>
            <div className="flex space-x-4 mb-4">
              <motion.a 
                href="https://github.com" 
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white/10 rounded-full hover:bg-[#FFD700] hover:text-black transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Github className="w-5 h-5" />
              </motion.a>
              <motion.a 
                href="https://www.themoviedb.org" 
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white/10 rounded-full hover:bg-[#FFD700] hover:text-black transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ExternalLink className="w-5 h-5" />
              </motion.a>
            </div>
            <div className="flex items-center space-x-2">
              <img 
                src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_short-8e7b30f73a4020692ccca9c88bafe5dcb6f8a62a4c6bc55cd9ba82bb2cd95f6c.svg"
                alt="TMDB"
                className="h-6 w-auto opacity-60"
              />
              <span className="text-gray-500 text-xs">
                Powered by TMDB API
              </span>
            </div>
          </motion.div>
        </div>
        
        <motion.div 
          className="pt-8 border-t border-gray-600/20 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          viewport={{ once: true, margin: "-50px" }}
        >
          <div className="flex flex-col md:flex-row items-center justify-between text-gray-400 text-sm">
            <p>© 2024 Cinema Search. All rights reserved.</p>
            <div className="flex items-center space-x-4 mt-2 md:mt-0">
              <motion.a 
                href="/privacy" 
                className="hover:text-[#FFD700] transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                개인정보처리방침
              </motion.a>
              <span>•</span>
              <motion.a 
                href="/terms" 
                className="hover:text-[#FFD700] transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                이용약관
              </motion.a>
              <span>•</span>
              <motion.a 
                href="/contact" 
                className="hover:text-[#FFD700] transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                문의하기
              </motion.a>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
} 