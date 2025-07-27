import { NextResponse } from 'next/server';

export async function GET() {
  const tmdbKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  const streamingKey = process.env.STREAMING_AVAILABILITY_API_KEY;
  
  return NextResponse.json({
    tmdb_api_key: tmdbKey ? '설정됨' : '설정되지 않음',
    streaming_availability_api_key: streamingKey ? '설정됨' : '설정되지 않음',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
} 