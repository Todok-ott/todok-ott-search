'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Star, ArrowRight, TrendingUp, Calendar, Film, Tv, Flame, Clock } from 'lucide-react';
import Link from 'next/link';
import SearchBar from '@/components/SearchBar';
import Footer from '@/components/Footer';
import GoogleAdSense from '@/components/GoogleAdSense';
import AmazonAssociates from '@/components/AmazonAssociates';
import { getAdsByPosition } from '@/lib/adUtils';

interface PopularContent {
  id: number;
  title: string;
  name?: string;
  overview: string;
  poster_path: string;
  vote_average: number;
  release_date: string;
  first_air_date?: string;
  media_type: 'movie' | 'tv';
}

// 임시 데이터
const fallbackMovies: PopularContent[] = [
  {
    id: 1,
    title: "인터스텔라",
    overview: "우주를 배경으로 한 SF 영화",
    poster_path: "/placeholder-poster.jpg",
    vote_average: 8.6,
    release_date: "2014",
    media_type: "movie"
  },
  {
    id: 2,
    title: "듄",
    overview: "사막 행성 아라키스의 이야기",
    poster_path: "/placeholder-poster.jpg",
    vote_average: 8.0,
    release_date: "2021",
    media_type: "movie"
  },
  {
    id: 3,
    title: "오펜하이머",
    overview: "원자폭탄 개발의 역사",
    poster_path: "/placeholder-poster.jpg",
    vote_average: 8.4,
    release_date: "2023",
    media_type: "movie"
  }
];

const fallbackTVShows: PopularContent[] = [
  {
    id: 4,
    title: "스트레인저 씽즈",
    name: "스트레인저 씽즈",
    overview: "초자연적 현상을 다루는 드라마",
    poster_path: "/placeholder-poster.jpg",
    vote_average: 8.7,
    release_date: "2016",
    first_air_date: "2016",
    media_type: "tv"
  },
  {
    id: 5,
    title: "브레이킹 배드",
    name: "브레이킹 배드",
    overview: "화학 교사의 범죄 이야기",
    poster_path: "/placeholder-poster.jpg",
    vote_average: 9.5,
    release_date: "2008",
    first_air_date: "2008",
    media_type: "tv"
  },
  {
    id: 6,
    title: "게임 오브 스론즈",
    name: "게임 오브 스론즈",
    overview: "판타지 세계의 권력 다툼",
    poster_path: "/placeholder-poster.jpg",
    vote_average: 9.3,
    release_date: "2011",
    first_air_date: "2011",
    media_type: "tv"
  }
];

export default function Home() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>토독 (Todok) OTT 검색</h1>
      <p>사이트가 정상적으로 배포되었습니다!</p>
      <p>현재 시간: {new Date().toLocaleString('ko-KR')}</p>
      <p>커밋: 0879dd6</p>
    </div>
  );
}
