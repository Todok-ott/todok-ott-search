import { NextRequest, NextResponse } from 'next/server';

interface Inquiry {
  id: string;
  name: string;
  email: string;
  type: string;
  message: string;
  createdAt: string;
  status: 'pending' | 'read' | 'replied';
}

// 간단한 인메모리 저장소 (실제로는 데이터베이스를 사용해야 함)
const inquiries: Inquiry[] = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, type, message } = body;

    // 기본적인 유효성 검사
    if (!name || !email || !type || !message) {
      return NextResponse.json(
        { error: '모든 필드를 입력해주세요.' },
        { status: 400 }
      );
    }

    // 이메일 형식 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: '올바른 이메일 형식을 입력해주세요.' },
        { status: 400 }
      );
    }

    // 새 문의 생성
    const inquiry: Inquiry = {
      id: Date.now().toString(),
      name,
      email,
      type,
      message,
      createdAt: new Date().toISOString(),
      status: 'pending' // pending, read, replied
    };

    // 문의 저장
    inquiries.push(inquiry);

    // 실제 운영에서는 여기서 이메일 발송 로직을 추가할 수 있습니다
    console.log('새 문의가 접수되었습니다:', inquiry);

    return NextResponse.json({
      success: true,
      message: '문의가 성공적으로 접수되었습니다.',
      inquiryId: inquiry.id
    });

  } catch (error) {
    console.error('문의 접수 오류:', error);
    return NextResponse.json(
      { error: '문의 접수 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 관리자용 문의 목록 조회 API
export async function GET(request: NextRequest) {
  try {
    // 실제 운영에서는 인증/인가 로직을 추가해야 합니다
    const url = new URL(request.url);
    const adminKey = url.searchParams.get('adminKey');
    
    // 간단한 관리자 키 검증 (실제로는 더 안전한 인증을 사용해야 함)
    if (adminKey !== 'cinemasearch2024') {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      inquiries: inquiries.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    });

  } catch (error) {
    console.error('문의 목록 조회 오류:', error);
    return NextResponse.json(
      { error: '문의 목록을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 