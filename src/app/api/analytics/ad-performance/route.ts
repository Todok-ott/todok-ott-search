import { NextResponse } from 'next/server';

interface AdPerformanceRecord {
  adId: string;
  metric: string;
  value: number;
  timestamp: string;
  createdAt: string;
}

interface MetricStats {
  count: number;
  total: number;
}

interface Stats {
  totalRecords: number;
  averageValue: number;
  byMetric: Record<string, MetricStats>;
}

// 광고 성능 데이터 저장 (실제로는 데이터베이스에 저장)
let adPerformanceData: AdPerformanceRecord[] = [];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { adId, metric, value, timestamp } = body;

    // 데이터 유효성 검사
    if (!adId || !metric || value === undefined) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 광고 성능 데이터 저장
    const performanceRecord: AdPerformanceRecord = {
      adId,
      metric,
      value,
      timestamp: timestamp || new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    adPerformanceData.push(performanceRecord);

    // 데이터가 너무 많아지면 오래된 것부터 삭제
    if (adPerformanceData.length > 1000) {
      adPerformanceData = adPerformanceData.slice(-500);
    }

    console.log('Ad performance tracked:', performanceRecord);

    return NextResponse.json({ 
      success: true, 
      message: '광고 성능 데이터가 저장되었습니다.' 
    });

  } catch (error) {
    console.error('Ad performance tracking error:', error);
    return NextResponse.json(
      { error: '광고 성능 추적 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const adId = searchParams.get('adId');
    const metric = searchParams.get('metric');
    const days = parseInt(searchParams.get('days') || '7');

    let filteredData = adPerformanceData;

    // 필터링
    if (adId) {
      filteredData = filteredData.filter(record => record.adId === adId);
    }

    if (metric) {
      filteredData = filteredData.filter(record => record.metric === metric);
    }

    // 날짜 필터링
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    filteredData = filteredData.filter(record => 
      new Date(record.timestamp) >= cutoffDate
    );

    // 통계 계산
    const stats: Stats = {
      totalRecords: filteredData.length,
      averageValue: filteredData.length > 0 
        ? filteredData.reduce((sum, record) => sum + record.value, 0) / filteredData.length 
        : 0,
      byMetric: filteredData.reduce((acc, record) => {
        if (!acc[record.metric]) {
          acc[record.metric] = { count: 0, total: 0 };
        }
        acc[record.metric].count++;
        acc[record.metric].total += record.value;
        return acc;
      }, {} as Record<string, MetricStats>)
    };

    return NextResponse.json({
      success: true,
      data: filteredData,
      stats
    });

  } catch (error) {
    console.error('Ad performance retrieval error:', error);
    return NextResponse.json(
      { error: '광고 성능 데이터 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 