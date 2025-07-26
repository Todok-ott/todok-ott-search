# 🎯 OTTSEARCH 광고 설정 가이드

## 📋 개요
OTTSEARCH에서 Google AdSense와 Amazon Associates를 통합하여 수익을 창출하는 방법을 안내합니다.

## 🚀 구현된 기능

### ✅ Google AdSense
- **헤더 배너 광고**: 페이지 상단에 표시
- **사이드바 광고**: 콘텐츠 옆에 표시  
- **콘텐츠 광고**: 페이지 중간에 표시
- **가족 친화적 필터링**: 부적절한 광고 자동 차단

### ✅ Amazon Associates
- **제품 추천**: 관련 제품 자동 표시
- **제휴 링크**: 수익 창출 링크
- **한국 아마존 연동**: 한국 사용자 최적화

## 🔧 설정 방법

### 1. Google AdSense 설정

#### 1.1 AdSense 계정 생성
1. [Google AdSense](https://www.google.com/adsense) 접속
2. 계정 생성 및 사이트 승인 대기
3. 승인 후 Publisher ID 받기

#### 1.2 코드 업데이트
```typescript
// src/components/GoogleAdSense.tsx
data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" // 실제 Publisher ID로 교체
```

#### 1.3 광고 슬롯 설정
```typescript
// src/lib/adUtils.ts
export const adConfigs: AdConfig[] = [
  {
    id: 'header-banner',
    type: 'adsense',
    position: 'header',
    enabled: true,
    familyFriendly: true,
    adSlot: '1234567890', // 실제 광고 슬롯 ID
    adFormat: 'banner'
  }
];
```

### 2. Amazon Associates 설정

#### 2.1 Associates 계정 생성
1. [Amazon Associates](https://affiliate-program.amazon.com/) 접속
2. 계정 생성 및 사이트 승인
3. Tracking ID 받기

#### 2.2 코드 업데이트
```typescript
// src/components/AmazonAssociates.tsx
const affiliateUrl = `${amazonUrl}?tag=your-tag-id-20`; // 실제 Tracking ID로 교체
```

## 🛡️ 가족 친화적 광고 설정

### Google AdSense
1. AdSense 대시보드 → 설정 → 광고 설정
2. "가족 친화적 콘텐츠" 활성화
3. 광고 카테고리 필터링 설정

### Amazon Associates
1. Associates 대시보드 → 설정 → 제품 링크
2. "가족 친화적 제품만" 필터 활성화
3. 카테고리별 제품 제한 설정

## 📊 수익 최적화 전략

### 1. 광고 배치 최적화
- **헤더**: 높은 노출률, 클릭률 우수
- **사이드바**: 콘텐츠와 관련된 광고
- **콘텐츠 중간**: 자연스러운 삽입

### 2. 사용자 경험 고려
- 광고가 콘텐츠를 방해하지 않도록 배치
- 적절한 간격과 크기 설정
- 모바일 최적화

### 3. 성능 모니터링
```typescript
// 광고 성능 추적
monitorAdPerformance('header-banner', 'impression', 1);
monitorAdPerformance('amazon-product-1', 'click', 1);
```

## 🔍 광고 차단 대응

### 1. 차단 감지
```typescript
// 광고 차단 감지 및 대응
const isAdBlocked = await detectAdBlocker();
if (isAdBlocked) {
  // 대체 콘텐츠 표시
  showAlternativeContent();
}
```

### 2. 대체 전략
- 광고 차단 사용자에게 친근한 메시지
- 수익 창출의 중요성 설명
- 광고 차단 해제 가이드 제공

## 📈 수익 추적

### 1. Google Analytics 연동
```typescript
// 광고 수익 추적
trackAdRevenue('header-banner', 0.5); // $0.50 수익
```

### 2. 실시간 모니터링
- AdSense 대시보드에서 실시간 수익 확인
- Amazon Associates 대시보드에서 클릭/판매 추적
- 자체 분석 API를 통한 상세 분석

## 🎨 광고 디자인 가이드

### 1. 브랜드 일관성
- 사이트 디자인과 조화로운 광고 배치
- 브랜드 색상과 폰트 유지
- 자연스러운 통합

### 2. 반응형 디자인
```css
/* 광고 컨테이너 반응형 설정 */
.ad-container {
  max-width: 100%;
  overflow: hidden;
}

@media (max-width: 768px) {
  .ad-container {
    margin: 1rem 0;
  }
}
```

## ⚠️ 주의사항

### 1. 정책 준수
- Google AdSense 정책 준수
- Amazon Associates 가이드라인 준수
- 개인정보보호법 준수

### 2. 성능 최적화
- 광고 로딩이 페이지 성능에 영향을 주지 않도록 설정
- 지연 로딩 적용
- 캐싱 전략 수립

### 3. 사용자 경험
- 과도한 광고 배치 금지
- 콘텐츠와 광고의 균형 유지
- 사용자 피드백 수렴

## 🚀 배포 체크리스트

- [ ] AdSense Publisher ID 설정
- [ ] Amazon Associates Tracking ID 설정
- [ ] 광고 차단 감지 테스트
- [ ] 모바일 광고 테스트
- [ ] 성능 모니터링 설정
- [ ] 수익 추적 확인

## 📞 지원

광고 설정 관련 문의사항이 있으시면 관리자에게 연락해주세요.

---

**💡 팁**: 광고 수익을 극대화하려면 사용자 경험을 해치지 않는 선에서 자연스럽게 광고를 배치하는 것이 중요합니다. 