import { NextRequest, NextResponse } from 'next/server';
import { streamingAvailabilityClient } from '@/lib/streamingAvailability';

// 한국 OTT 플랫폼 정보
const KOREAN_OTT_PLATFORMS = [
  { name: '넷플릭스', logo: '/ott-logos/netflix.svg' },
  { name: '디즈니플러스', logo: '/ott-logos/disney-plus.svg' },
  { name: '웨이브', logo: '/ott-logos/wavve.svg' },
  { name: '티빙', logo: '/ott-logos/tving.svg' },
  { name: '왓챠', logo: '/ott-logos/watcha.svg' },
  { name: '라프텔', logo: '/ott-logos/laftel.svg' },
  { name: '애플TV', logo: '/ott-logos/apple-tv.svg' },
  { name: '아마존프라임', logo: '/ott-logos/amazon-prime.svg' }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get('title');
    const type = searchParams.get('type') || 'all';

    if (!title) {
      return NextResponse.json({
        error: '제목 파라미터가 필요합니다.',
        platforms: KOREAN_OTT_PLATFORMS
      });
    }

    console.log('한국 OTT API 호출:', { title, type });

    // Streaming Availability API로 OTT 정보 검색
    let providers: Array<{ name: string; logo: string; type: string }> = [];
    try {
      const streamingData = await streamingAvailabilityClient.searchByTitle(title);
      
      if (streamingData && streamingData.results && streamingData.results.length > 0) {
        const firstResult = streamingData.results[0];
        const ottProviders = streamingAvailabilityClient.convertResultsToOTTProviders([firstResult]);
        
        if (ottProviders && ottProviders.KR) {
          // flatrate, buy, rent를 하나의 배열로 합치기
          const allProviders = [
            ...(ottProviders.KR.flatrate || []),
            ...(ottProviders.KR.buy || []),
            ...(ottProviders.KR.rent || [])
          ];
          
          providers = allProviders.map(provider => ({
            name: provider.provider_name,
            logo: provider.logo_path,
            type: 'streaming'
          }));
        }
      }
    } catch (error) {
      console.error('Streaming Availability API 오류:', error);
    }
    
    // 타입별 필터링
    let filteredProviders = providers;
    if (type !== 'all') {
      filteredProviders = providers.filter(provider => {
        switch (type) {
          case 'movie':
            return ['넷플릭스', '디즈니플러스', '웨이브', '왓챠'].includes(provider.name);
          case 'drama':
            return ['넷플릭스', '디즈니플러스', '웨이브', '티빙', '왓챠'].includes(provider.name);
          case 'variety':
            return ['티빙', '웨이브', '왓챠'].includes(provider.name);
          case 'animation':
            return ['라프텔', '넷플릭스', '디즈니플러스'].includes(provider.name);
          default:
            return true;
        }
      });
    }

    const response = {
      title,
      type,
      providers: filteredProviders,
      all_platforms: KOREAN_OTT_PLATFORMS,
      total_providers: filteredProviders.length,
      search_success: filteredProviders.length > 0,
      api_credits: {
        streaming_availability: 'Powered by Streaming Availability API via RapidAPI'
      }
    };

    console.log('한국 OTT API 응답:', response);
    return NextResponse.json(response);
  } catch (error) {
    console.error('Korean OTT API error:', error);
    return NextResponse.json(
      { 
        error: '한국 OTT 정보를 불러오는 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 