# 🚀 토독 (Todok) 배포 가이드

## 📋 배포 옵션

### 1. Vercel (추천) - 가장 쉬움

#### 1.1 Vercel 계정 생성
1. [Vercel](https://vercel.com) 접속
2. GitHub 계정으로 로그인
3. "New Project" 클릭

#### 1.2 프로젝트 연결
1. GitHub 저장소 선택
2. 프로젝트 설정 확인
3. "Deploy" 클릭

#### 1.3 환경 변수 설정
```bash
# Vercel 대시보드에서 설정
NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key
NEXT_PUBLIC_GA_MEASUREMENT_ID=your_ga_id
```

#### 1.4 자동 배포
- GitHub에 푸시하면 자동 배포
- 커스텀 도메인 설정 가능
- SSL 인증서 자동 발급

### 2. Netlify

#### 2.1 Netlify 배포
1. [Netlify](https://netlify.com) 접속
2. GitHub 저장소 연결
3. 빌드 설정:
   - Build command: `npm run build`
   - Publish directory: `.next`

### 3. GitHub Pages

#### 3.1 정적 사이트 배포
1. GitHub 저장소 설정
2. Actions로 자동 빌드
3. GitHub Pages 활성화

## 🔧 배포 전 체크리스트

### ✅ 필수 확인사항
- [ ] TMDB API 키 설정
- [ ] Google Analytics ID 설정
- [ ] 환경 변수 확인
- [ ] 빌드 테스트

### ✅ 성능 최적화
- [ ] 이미지 최적화
- [ ] 번들 크기 최적화
- [ ] SEO 메타데이터 확인

### ✅ 브랜딩 확인
- [ ] 토독 (Todok) 로고 적용
- [ ] 메타데이터 업데이트
- [ ] 푸터 정보 확인

## 🌐 도메인 설정

### 커스텀 도메인
1. 도메인 구매 (가비아, 후이즈 등)
2. DNS 설정
3. SSL 인증서 발급

### 무료 도메인 옵션
- Vercel: `todok.vercel.app`
- Netlify: `todok.netlify.app`
- GitHub Pages: `username.github.io/todok`

## 📊 모니터링

### Vercel Analytics
- 페이지뷰 추적
- 성능 모니터링
- 에러 추적

### Google Analytics
- 사용자 행동 분석
- 트래픽 소스 분석
- 전환율 추적

## 🔄 자동 배포 설정

### GitHub Actions
```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 🚨 문제 해결

### 빌드 실패
1. 로그 확인
2. 의존성 문제 해결
3. 환경 변수 확인

### 배포 후 문제
1. 캐시 클리어
2. 환경 변수 재설정
3. 도메인 DNS 확인

## 💡 팁

### 성능 최적화
- 이미지 최적화
- 코드 스플리팅
- 캐싱 전략

### SEO 최적화
- 메타데이터 완성
- 사이트맵 생성
- robots.txt 설정

---

**토독 (Todok)** - 찾고, 발견하고, 즐기세요! 🎯 