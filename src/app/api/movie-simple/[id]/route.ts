import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    console.log('=== Simple Movie API 호출 ===');
    console.log('ID:', id);
    console.log('URL:', request.url);
    
    // 간단한 응답
    return NextResponse.json({
      id: id,
      title: '테스트 영화',
      message: 'Simple API is working!',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Simple Movie API error:', error);
    return NextResponse.json(
      { error: 'Simple API error' },
      { status: 500 }
    );
  }
} 