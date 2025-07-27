import { NextResponse } from 'next/server';
import { streamingAvailabilityClient } from '@/lib/streamingAvailability';
import { debugOTTInfo, hasOTT, hasAnyOTT } from '@/lib/ottUtils';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const title = url.searchParams.get('title');
    
    console.log('=== OTT 테스트 시작 ===');
    
    const results = [];
    
    // Streaming Availability API 테스트
    if (title) {
      console.log(`Streaming Availability 테스트 (제목: ${title})`);
      try {
        const streamingData = await streamingAvailabilityClient.searchByTitle(title);
        
        if (streamingData && streamingData.result) {
          const ottProviders = streamingAvailabilityClient.convertToOTTProviders(streamingData);
          
          const testResult = {
            id: `streaming_${Date.now()}`,
            media_type: streamingData.result.type === 'movie' ? 'movie' : 'tv',
            title: streamingData.result.title,
            ott_providers: ottProviders
          };
          
          debugOTTInfo(testResult);
          
          results.push({
            type: 'streaming_availability',
            title: streamingData.result.title,
            ott_providers: ottProviders,
            hasOTT: hasOTT(testResult),
            hasAnyOTT: hasAnyOTT(testResult),
            year: streamingData.result.year,
            content_type: streamingData.result.type
          });
        } else {
          console.log(`"${title}" 검색 결과 없음`);
          results.push({
            type: 'streaming_availability',
            title: title,
            error: '검색 결과가 없습니다'
          });
        }
      } catch (error) {
        console.error('Streaming Availability API 오류:', error);
        results.push({
          type: 'streaming_availability',
          title: title,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    // 로컬 데이터 테스트
    const localTestData = {
      id: 1,
      title: '기생충',
      ottPlatforms: ['넷플릭스', '티빙'],
      local_data: true
    };
    
    debugOTTInfo(localTestData);
    
    results.push({
      type: 'local',
      title: '기생충',
      ottPlatforms: ['넷플릭스', '티빙'],
      hasOTT: hasOTT(localTestData),
      hasAnyOTT: hasAnyOTT(localTestData)
    });
    
    console.log('=== OTT 테스트 완료 ===');
    
    return NextResponse.json({
      results,
      summary: {
        total: results.length,
        withOTT: results.filter(r => r.hasOTT).length,
        withAnyOTT: results.filter(r => r.hasAnyOTT).length
      },
      api_credits: {
        streaming_availability: 'Powered by Streaming Availability API via RapidAPI'
      }
    });
    
  } catch (error) {
    console.error('OTT 테스트 에러:', error);
    return NextResponse.json(
      { error: '테스트 중 오류가 발생했습니다', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 