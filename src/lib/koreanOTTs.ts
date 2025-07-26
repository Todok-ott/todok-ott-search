// 국내 OTT 정보 데이터
export interface KoreanOTT {
  id: string;
  name: string;
  logo: string;
  description: string;
  features: string[];
  strengths: string[];
  weaknesses: string[];
  availableContent: string[];
}

export const koreanOTTs: KoreanOTT[] = [
  {
    id: 'netflix',
    name: 'Netflix',
    logo: '/ott-logos/netflix.svg',
    description: '글로벌 스트리밍 서비스의 대표주자',
    features: ['4K 화질', '다중 프로필', '오프라인 시청', '다국어 자막'],
    strengths: ['다양한 오리지널 콘텐츠', '글로벌 콘텐츠', '고품질 화질'],
    weaknesses: ['한국 콘텐츠 상대적으로 적음', '가격이 비쌈'],
    availableContent: ['인터스텔라', '듄', '오펜하이머', '브레이킹 배드', '스트레인저 씽즈', '케이팝 데몬 헌터스', '인셉션', '다크 나이트', '포레스트 검프', '쇼생크 탈출']
  },
  {
    id: 'disney-plus',
    name: 'Disney+',
    logo: '/ott-logos/disney-plus.svg',
    description: '디즈니, 마블, 스타워즈 콘텐츠 전문',
    features: ['4K HDR', '다중 프로필', '오프라인 시청', 'IMAX Enhanced'],
    strengths: ['디즈니/마블/스타워즈 콘텐츠', '가족 친화적', '고품질 오리지널'],
    weaknesses: ['한국 콘텐츠 부족', '성인 콘텐츠 제한적'],
    availableContent: ['듄', '인터스텔라', '게임 오브 스론즈', '인셉션', '다크 나이트', '포레스트 검프', '쇼생크 탈출']
  },
  {
    id: 'wavve',
    name: 'Wavve',
    logo: '/ott-logos/wavve.svg',
    description: 'KBS, MBC, SBS 방송 콘텐츠 전문',
    features: ['실시간 방송', 'VOD 서비스', '다중 프로필', '오프라인 시청'],
    strengths: ['한국 방송 콘텐츠', '실시간 방송', '합리적인 가격'],
    weaknesses: ['해외 콘텐츠 부족', '영화 라이브러리 제한적'],
    availableContent: ['브레이킹 배드', '스트레인저 씽즈', '게임 오브 스론즈']
  },
  {
    id: 'tving',
    name: 'Tving',
    logo: '/ott-logos/tving.svg',
    description: 'tvN, JTBC 등 케이블 방송 콘텐츠',
    features: ['실시간 방송', 'VOD 서비스', '다중 프로필', '오프라인 시청'],
    strengths: ['한국 드라마 전문', '실시간 방송', '다양한 예능'],
    weaknesses: ['영화 콘텐츠 부족', '해외 콘텐츠 제한적'],
    availableContent: ['브레이킹 배드', '게임 오브 스론즈', '스트레인저 씽즈']
  },
  {
    id: 'watcha',
    name: 'Watcha',
    logo: '/ott-logos/watcha.svg',
    description: '독립 영화와 예술 영화 전문',
    features: ['다양한 장르', '독립 영화', '다중 프로필', '오프라인 시청'],
    strengths: ['독립 영화', '다양한 장르', '합리적인 가격'],
    weaknesses: ['메이저 영화 부족', '해외 콘텐츠 제한적'],
    availableContent: ['인터스텔라', '오펜하이머', '인셉션', '다크 나이트', '포레스트 검프', '쇼생크 탈출']
  },
  {
    id: 'laftel',
    name: 'Laftel',
    logo: '/ott-logos/laftel.svg',
    description: '애니메이션 전문 스트리밍 서비스',
    features: ['애니메이션 전문', '다중 프로필', '오프라인 시청', '자막 옵션'],
    strengths: ['애니메이션 전문', '다양한 장르', '합리적인 가격'],
    weaknesses: ['실사 영화/드라마 부족', '일본 애니 중심'],
    availableContent: ['스트레인저 씽즈', '케이팝 데몬 헌터스']
  },
  {
    id: 'apple-tv',
    name: 'Apple TV+',
    logo: '/ott-logos/apple-tv.svg',
    description: '애플 오리지널 콘텐츠 전문',
    features: ['4K HDR', '다중 프로필', '오프라인 시청', 'Spatial Audio'],
    strengths: ['고품질 오리지널', '합리적인 가격', '애플 생태계 연동'],
    weaknesses: ['콘텐츠 수량 적음', '한국 콘텐츠 부족'],
    availableContent: ['인터스텔라', '듄', '인셉션', '다크 나이트', '포레스트 검프', '쇼생크 탈출']
  },
  {
    id: 'amazon-prime',
    name: 'Amazon Prime',
    logo: '/ott-logos/amazon-prime.svg',
    description: '아마존 오리지널과 다양한 콘텐츠',
    features: ['4K HDR', '다중 프로필', '오프라인 시청', 'Prime 배송 혜택'],
    strengths: ['다양한 콘텐츠', '합리적인 가격', '배송 혜택'],
    weaknesses: ['한국 콘텐츠 부족', '인터페이스 복잡'],
    availableContent: ['인터스텔라', '듄', '브레이킹 배드', '게임 오브 스론즈', '인셉션', '다크 나이트', '포레스트 검프', '쇼생크 탈출', '케이팝 데몬 헌터스']
  }
];

// 최신 개봉 영화 목록 (스트리밍 불가능)
export const recentTheaterMovies = [
  '슈퍼맨',
  'Superman',
  'Man of Steel',
  'Batman v Superman',
  'Justice League',
  'The Flash',
  'Aquaman',
  'Wonder Woman',
  'Black Adam',
  'Shazam',
  'Blue Beetle',
  'The Marvels',
  'Ant-Man',
  'Black Panther',
  'Thor',
  'Spider-Man',
  'Doctor Strange',
  'Captain Marvel',
  'Avengers',
  'Iron Man'
];

// 스트리밍 가능한 영화 목록
export const streamingAvailableMovies = [
  '인터스텔라',
  'Interstellar',
  '듄',
  'Dune',
  '오펜하이머',
  'Oppenheimer',
  '브레이킹 배드',
  'Breaking Bad',
  '스트레인저 씽즈',
  'Stranger Things',
  '게임 오브 스론즈',
  'Game of Thrones',
  '인셉션',
  'Inception',
  '다크 나이트',
  'The Dark Knight',
  '포레스트 검프',
  'Forrest Gump',
  '쇼생크 탈출',
  'The Shawshank Redemption',
  '케이팝 데몬 헌터스',
  'K-pop Demon Hunters'
]; 