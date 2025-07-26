# 토독 (Todok) - OTT 검색 서비스

영화, 드라마, 애니메이션 등 다양한 콘텐츠가 어떤 OTT 플랫폼에서 시청 가능한지 한눈에 확인할 수 있는 서비스입니다.

## 🚀 배포 상태

- **배포 URL**: https://todok-ott-search.vercel.app/
- **최종 업데이트**: 2024년 12월 (인터페이스 이름 수정 완료)
- **상태**: 배포 중 - 연결 확인 필요

## ✨ 주요 기능

- **OTT 정보 검색**: 영화/드라마 제목으로 시청 가능한 플랫폼 검색
- **국내/해외 OTT 통합**: Netflix, Disney+, Wavve, Tving, Watcha, Laftel 등
- **상세 정보 제공**: 가격, 특징, 장단점, 시청 가능 콘텐츠
- **실시간 검색**: TMDB API 연동으로 최신 정보 제공
- **반응형 디자인**: 모바일/데스크톱 최적화

## 🛠 기술 스택

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Animation**: Framer Motion
- **API**: TMDB (The Movie Database)
- **Deployment**: Vercel
- **Analytics**: Google Analytics
- **Advertising**: Google AdSense, Amazon Associates

## 📱 지원 OTT 서비스

### 글로벌 서비스
- **Netflix**: 다양한 오리지널 콘텐츠
- **Disney+**: 디즈니, 마블, 스타워즈 콘텐츠
- **Apple TV+**: 애플 오리지널 콘텐츠
- **Amazon Prime**: 아마존 오리지널과 다양한 콘텐츠

### 국내 서비스
- **Wavve**: KBS, MBC, SBS 방송 콘텐츠
- **Tving**: tvN, JTBC 등 케이블 방송 콘텐츠
- **Watcha**: 독립 영화와 예술 영화 전문
- **Laftel**: 애니메이션 전문 스트리밍 서비스

## 🔧 개발 환경 설정

```bash
# 저장소 클론
git clone https://github.com/Todok-ott/todok-ott-search.git
cd todok-ott-search

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env.local
# TMDB API 키 설정 필요

# 개발 서버 실행
npm run dev
```

## 🌐 배포 가이드

### Vercel 배포

1. **Vercel CLI 설치**
   ```bash
   npm i -g vercel
   ```

2. **로그인 및 배포**
   ```bash
   vercel login
   vercel
   ```

3. **환경 변수 설정**
   - Vercel 대시보드 → 프로젝트 설정 → Environment Variables
   - `NEXT_PUBLIC_TMDB_API_KEY`: TMDB API 키
   - `NEXT_PUBLIC_GA_MEASUREMENT_ID`: Google Analytics ID (선택사항)

## 📊 현재 상태

- ✅ **빌드 성공**: TypeScript 오류 해결 완료
- ✅ **API 정상**: TMDB API 연동 완료
- ✅ **OTT 정보**: 정확한 스트리밍 정보 표시
- ✅ **UI 개선**: 네비게이션, 로고, 정확한 정보
- 🔄 **배포 확인**: 연결 상태 점검 중

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해주세요.

---

**토독 (Todok)** - 당신의 OTT 검색 파트너 🎬
