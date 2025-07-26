import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('=== Movie API 호출 시작 ===');
  console.log('요청 URL:', request.url);
  console.log('요청 메서드:', request.method);
  
  try {
    const { id } = await params;
    console.log('받은 ID:', id);
    
    // URL에서 제목 파라미터 추출
    const url = new URL(request.url);
    const titleParam = url.searchParams.get('title');
    console.log('제목 파라미터:', titleParam);
    
    // 간단한 테스트 응답
    return NextResponse.json({
      id: id,
      title: titleParam || '테스트 영화',
      message: 'Movie API is working!',
      timestamp: new Date().toISOString(),
      params: { id, titleParam }
    });
    
  } catch (error) {
    console.error('Movie API error:', error);
    return NextResponse.json(
      { error: 'Movie API error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 