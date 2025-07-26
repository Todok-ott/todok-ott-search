# 🎬 Cinema Search - 시네마틱 다크 OTT 검색 서비스

모든 OTT 플랫폼의 콘텐츠를 한 번에 검색하고, 당신만을 위한 완벽한 시청 경험을 제공하는 영화 큐레이션 서비스입니다.

## ✨ 주요 특징

### 🎨 시네마틱 다크 디자인
- **다크 모드 기본 채택**: 눈의 피로를 덜어주고 영화 포스터를 돋보이게 하는 어두운 배경
- **미니멀리즘**: 불필요한 요소 제거와 충분한 여백으로 각 콘텐츠가 주인공이 되도록 설계
- **고급스러운 타이포그래피**: Inter 폰트를 사용한 세련된 텍스트 디자인
- **마이크로 인터랙션**: 부드럽고 미세한 애니메이션으로 살아있는 듯한 느낌

### 🔍 스마트 검색 기능
- **실시간 검색**: 타이핑과 동시에 관련 작품 목록 표시
- **OTT 플랫폼 정보**: 각 작품이 어떤 플랫폼에서 시청 가능한지 표시
- **고급 필터링**: 평점, 연도, 제목별 정렬 및 영화/드라마 타입 필터링

### 🎯 사용자 경험
- **직관적인 네비게이션**: 스크롤에 반응하는 헤더와 부드러운 페이지 전환
- **반응형 디자인**: 모든 디바이스에서 최적화된 경험
- **접근성**: 키보드 네비게이션과 스크린 리더 지원

## 🎨 디자인 시스템

### 컬러 팔레트
- **배경**: `#121212` (깊고 부드러운 차콜 그레이)
- **주요 텍스트**: `#FFFFFF` (순수한 흰색)
- **보조 텍스트**: `#E0E0E0` (밝은 회색)
- **포인트 컬러**: `#FFD700` (세련된 골드)

### 애니메이션
- **Framer Motion**을 활용한 부드러운 페이지 전환
- **호버 효과**: 카드 확대, 색상 변화, 그림자 효과
- **로딩 애니메이션**: 시네마틱한 스피너와 페이드 인 효과

## 🚀 시작하기

### 필수 요구사항
- Node.js 18.0.0 이상
- npm 또는 yarn

### 설치 및 실행

```bash
# 저장소 클론
git clone [repository-url]
cd ott-search

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 결과를 확인하세요.

## 🛠️ 기술 스택

- **프레임워크**: Next.js 14 (App Router)
- **언어**: TypeScript
- **스타일링**: Tailwind CSS
- **애니메이션**: Framer Motion
- **아이콘**: Lucide React
- **폰트**: Inter (Google Fonts)
- **API**: TMDB (The Movie Database)

## 📁 프로젝트 구조

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # 메인 랜딩 페이지
│   ├── search/            # 검색 결과 페이지
│   ├── movie/[id]/        # 영화 상세 페이지
│   └── api/               # API 라우트
├── components/            # 재사용 가능한 컴포넌트
│   ├── SearchBar.tsx     # 검색바 컴포넌트
│   ├── Footer.tsx        # 푸터 컴포넌트
│   └── ...
├── lib/                  # 유틸리티 및 설정
│   └── tmdb.ts          # TMDB API 설정
└── styles/              # 전역 스타일
    └── globals.css      # 시네마틱 다크 테마
```

## 🎯 주요 기능

### 1. 메인 랜딩 페이지
- **동적 배경**: 8초마다 전환되는 영화 스틸컷
- **중앙 검색바**: 실시간 검색 제안과 드롭다운
- **인기 콘텐츠**: 현재 인기 있는 영화/드라마 표시

### 2. 검색 결과 페이지
- **고급 필터링**: 정렬 및 타입 필터
- **OTT 정보**: 시청 가능한 플랫폼 표시
- **상세 정보**: 평점, 연도, 줄거리 미리보기

### 3. 영화 상세 페이지
- **상세 정보**: 출연진, 감독, 줄거리
- **OTT 링크**: 직접 시청 페이지로 이동
- **관련 작품**: 비슷한 콘텐츠 추천

## 🎨 디자인 철학

### "시네마틱 다크 (Cinematic Dark)"
단순한 검색 도구가 아닌, 마치 잘 만들어진 영화 큐레이션 서비스에 들어온 듯한 경험을 제공하는 것을 목표로 합니다.

**핵심 요소:**
- **다크 모드 기본**: 어두운 배경으로 영화 포스터를 돋보이게 함
- **미니멀리즘**: 충분한 여백과 불필요한 요소 제거
- **타이포그래피**: 가독성 높은 Inter 폰트 사용
- **마이크로 인터랙션**: 부드러운 애니메이션으로 살아있는 느낌

## 🔧 개발 가이드

### 새로운 컴포넌트 추가
```typescript
// components/NewComponent.tsx
'use client';

import { motion } from 'framer-motion';

export default function NewComponent() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-black/20 backdrop-blur-sm rounded-xl"
    >
      {/* 컴포넌트 내용 */}
    </motion.div>
  );
}
```

### 스타일 가이드
- **배경**: `bg-[#121212]` 또는 `bg-black/20`
- **텍스트**: `text-white`, `text-gray-300`, `text-[#FFD700]`
- **버튼**: `bg-[#FFD700] text-black hover:bg-[#FFA500]`
- **카드**: `bg-black/30 backdrop-blur-md border border-gray-600/30`

## 📱 반응형 디자인

- **모바일**: 320px 이상
- **태블릿**: 768px 이상
- **데스크톱**: 1024px 이상
- **대형 화면**: 1280px 이상

## 🚀 배포

### Vercel 배포 (권장)
```bash
npm run build
npm run start
```

### 환경 변수 설정
```env
NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key
NEXT_PUBLIC_TMDB_BASE_URL=https://api.themoviedb.org/3
```

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 🙏 감사의 말

- [TMDB](https://www.themoviedb.org/) - 영화 데이터 제공
- [Next.js](https://nextjs.org/) - React 프레임워크
- [Framer Motion](https://www.framer.com/motion/) - 애니메이션 라이브러리
- [Tailwind CSS](https://tailwindcss.com/) - CSS 프레임워크

---

**Made with ❤️ for cinema lovers**
