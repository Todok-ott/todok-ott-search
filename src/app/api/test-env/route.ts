import { NextResponse } from 'next/server';

export async function GET() {
  const streamingKey = process.env.STREAMING_AVAILABILITY_API_KEY;
  
  return NextResponse.json({
    streaming_availability_api_key: streamingKey ? '설정됨' : '설정되지 않음',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    note: 'TMDB API는 더 이상 사용하지 않습니다. Streaming Availability API만 사용합니다.'
  });
} 