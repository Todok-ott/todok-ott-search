import { NextResponse } from 'next/server';
import { tmdbClient } from '@/lib/tmdb';

export async function GET() {
  try {
    const trendingData = await tmdbClient.getTrending('week');
    return NextResponse.json(trendingData);
  } catch (error) {
    console.error('Error fetching trending data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trending data' },
      { status: 500 }
    );
  }
} 