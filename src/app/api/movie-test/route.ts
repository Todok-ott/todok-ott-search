import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  console.log('=== Movie Test API 호출 ===');
  console.log('URL:', request.url);
  
  return NextResponse.json({
    message: 'Movie Test API is working!',
    timestamp: new Date().toISOString(),
    url: request.url
  });
} 