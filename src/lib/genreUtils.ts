// TMDB 장르 ID 기반 태그 생성 유틸리티

export function getContentTag(genreIds: number[], mediaType?: 'movie' | 'tv'): string {
  if (!genreIds || genreIds.length === 0) {
    return mediaType === 'movie' ? '영화' : '드라마';
  }

  // 애니메이션 (장르 ID: 16)
  if (genreIds.includes(16)) {
    return '애니메이션';
  }

  // 다큐멘터리 (장르 ID: 99)
  if (genreIds.includes(99)) {
    return '다큐멘터리';
  }

  // 뉴스 (장르 ID: 10763)
  if (genreIds.includes(10763)) {
    return '뉴스';
  }

  // 리얼리티 (장르 ID: 10764)
  if (genreIds.includes(10764)) {
    return '리얼리티';
  }

  // 토크쇼 (장르 ID: 10767)
  if (genreIds.includes(10767)) {
    return '토크쇼';
  }

  // 게임쇼 (장르 ID: 10768)
  if (genreIds.includes(10768)) {
    return '게임쇼';
  }

  // 기본값
  return mediaType === 'movie' ? '영화' : '드라마';
}

// 장르 ID별 상세 정보
export const GENRE_INFO = {
  16: '애니메이션',
  99: '다큐멘터리',
  10763: '뉴스',
  10764: '리얼리티',
  10767: '토크쇼',
  10768: '게임쇼',
  28: '액션',
  12: '모험',
  35: '코미디',
  80: '범죄',
  18: '드라마',
  10751: '가족',
  14: '판타지',
  36: '역사',
  27: '공포',
  10402: '음악',
  9648: '미스터리',
  10749: '로맨스',
  878: 'SF',
  10770: 'TV 영화',
  53: '스릴러',
  10752: '전쟁',
  37: '서부'
}; 