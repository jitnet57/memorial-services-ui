# Alaala — 기술 개발서 (Technical Development Specification)

> **프로젝트명:** Alaala Memorial Services Philippines  
> **문서 유형:** 기술 개발 명세서  
> **작성일:** 2026-04-22  
> **배포 환경:** Cloudflare Pages  
> **저장소:** https://github.com/jitnet57/memorial-services-ui

---

## 목차

1. [시스템 아키텍처](#1-시스템-아키텍처)
2. [디자인 시스템](#2-디자인-시스템)
3. [페이지 구조 및 라우팅](#3-페이지-구조-및-라우팅)
4. [JavaScript 모듈 명세](#4-javascript-모듈-명세)
5. [CSS 아키텍처](#5-css-아키텍처)
6. [PWA 및 서비스 워커](#6-pwa-및-서비스-워커)
7. [Google Maps 통합](#7-google-maps-통합)
8. [상태 관리 (localStorage)](#8-상태-관리-localstorage)
9. [컴포넌트 명세](#9-컴포넌트-명세)
10. [성능 최적화](#10-성능-최적화)
11. [외부 의존성](#11-외부-의존성)
12. [배포 파이프라인](#12-배포-파이프라인)
13. [에러 처리 전략](#13-에러-처리-전략)
14. [보안 고려사항](#14-보안-고려사항)
15. [향후 개발 로드맵](#15-향후-개발-로드맵)

---

## 1. 시스템 아키텍처

### 1.1 전체 구조

```
[사용자 브라우저]
      │
      ├── Service Worker (sw.js)   ← PWA 캐시 계층
      │         │
      │    [Cache Storage]         ← alaala-v3 정적 파일 캐시
      │
      ├── Cloudflare CDN           ← 전 세계 엣지 배포
      │         │
      │    [Cloudflare Pages]      ← 정적 호스팅
      │         │
      │    [GitHub main 브랜치]    ← git push 자동 트리거
      │
      └── 외부 서비스
            ├── Google Maps API    ← 지도 렌더링
            ├── Google Fonts CDN   ← 폰트
            └── Unsplash CDN       ← 샘플 이미지
```

### 1.2 아키텍처 특성

| 항목 | 내용 |
|------|------|
| 렌더링 방식 | 순수 정적 HTML (SSR/CSR 없음) |
| 데이터 저장소 | localStorage (클라이언트 전용, 현재 백엔드 없음) |
| 빌드 프로세스 | 없음 (빌드 도구 불필요한 Vanilla 스택) |
| 번들러 | 없음 |
| 프레임워크 | 없음 (Vanilla HTML/CSS/JS) |
| 패키지 매니저 | 없음 (package.json 없음) |

---

## 2. 디자인 시스템

### 2.1 CSS 변수 (Custom Properties)

전체 디자인 토큰은 `styles.css` 의 `:root` 블록에 정의됩니다.

#### 색상 팔레트

```css
/* 브랜드 컬러 */
--primary:       #5ba4d3   /* 메인 블루 */
--primary-dark:  #3a7fb8   /* 진한 블루 (호버, 헤더) */
--primary-light: #93c5e8   /* 연한 블루 */
--primary-50:    #eff8ff   /* 배경 틴트 */
--primary-100:   #d6eeff

/* 액센트 */
--accent:        #d4a574   /* 골드 (프리미엄 강조) */
--accent-dark:   #b8864f

/* 상태 */
--success:       #059669
--warning:       #d97706
--error:         #dc2626

/* 배경 (라이트 모드) */
--bg:            #f8fbff
--bg-alt:        #f0f6ff
--bg-card:       #f4f9ff
--bg-elevated:   #ffffff

/* 텍스트 */
--text:          #1a2533
--text-secondary:#4a6280
--text-muted:    #7a96b0

/* 테두리 */
--border:        #c5ddf0
--border-light:  #dff0fa
```

#### 다크 모드 오버라이드

`[data-theme="dark"]` 셀렉터로 모든 변수를 재정의합니다.

```css
[data-theme="dark"] {
    --bg:         #0d1a26
    --bg-card:    #162838
    --text:       #e8f4ff
    --border:     #2a4a65
    /* ... */
}
```

#### 그림자

```css
--shadow-sm:   0 1px 2px rgba(0,0,0,0.05)
--shadow-md:   0 4px 6px ...
--shadow-lg:   0 10px 15px ...
--shadow-xl:   0 20px 25px ...
--shadow-glow: 0 0 40px rgba(91,164,211,0.15)   /* 브랜드 글로우 */
```

#### 타이포그래피

```css
--font-display: 'Playfair Display', Georgia, serif    /* 제목용 세리프 */
--font-body:    'Inter', -apple-system, sans-serif    /* 본문용 산세리프 */
```

#### 간격 및 레이아웃

```css
--nav-height:     72px
--container-max:  1200px
--radius-sm:      8px
--radius-md:      12px
--radius-lg:      16px
--radius-xl:      24px
--radius-full:    9999px
```

#### 트랜지션

```css
--transition-fast:  150ms ease
--transition-base:  250ms ease
--transition-slow:  400ms ease
```

### 2.2 글래스모피즘 (Glassmorphism)

히어로, 검색바, 카드 등에 사용되는 반투명 유리 효과:

```css
--glass-bg:     rgba(240,248,255,0.7)
--glass-border: rgba(255,255,255,0.3)

/* 적용 패턴 */
.glass-element {
    background: var(--glass-bg);
    backdrop-filter: blur(16px);
    border: 1px solid var(--glass-border);
}
```

---

## 3. 페이지 구조 및 라우팅

### 3.1 페이지 목록

라우팅은 파일 기반 정적 라우팅입니다 (Cloudflare Pages 기본 동작).

| URL | 파일 | 설명 |
|-----|------|------|
| `/` | `index.html` | 홈 (랜딩 페이지) |
| `/explore.html` | `explore.html` | 메모리얼 탐색 + 지도 |
| `/memorial.html` | `memorial.html` | 메모리얼 상세 페이지 |
| `/create-memorial.html` | `create-memorial.html` | 메모리얼 생성 위저드 |
| `/dashboard.html` | `dashboard.html` | 사용자 대시보드 |
| `/booking.html` | `booking.html` | 서비스 예약 |
| `/auth.html` | `auth.html` | 로그인/회원가입 |
| `/admin.html` | `admin.html` | 관리자 페이지 |
| `/404.html` | `404.html` | 404 에러 |
| `/500.html` | `500.html` | 500 에러 |
| `/maintenance.html` | `maintenance.html` | 점검 안내 |

### 3.2 페이지 간 내비게이션

```
index.html
    ├──→ explore.html         (Explore 링크)
    ├──→ auth.html            (Sign In / Get Started)
    ├──→ create-memorial.html (Create Memorial CTA)
    └──→ memorial.html        (메모리얼 카드 클릭)

auth.html
    └──→ dashboard.html       (로그인 성공 후)

dashboard.html
    ├──→ memorial.html        (내 메모리얼 클릭)
    ├──→ create-memorial.html (새 메모리얼 생성)
    └──→ booking.html         (서비스 예약)

memorial.html
    └──→ booking.html         (서비스 예약 버튼)
```

### 3.3 HTML 페이지 공통 구조

모든 페이지는 다음 패턴을 따릅니다:

```html
<head>
    <!-- SEO 메타태그 -->
    <!-- Open Graph / Twitter Card -->
    <!-- Google Fonts preconnect -->
    <!-- CSS 로드 순서: styles.css → pages.css → [page].css → animations.css -->
</head>
<body>
    <nav class="navbar">...</nav>     <!-- 공통 네비게이션 -->
    
    <!-- 페이지별 콘텐츠 -->
    
    <script src="[page].js"></script>   <!-- 페이지 전용 JS -->
    <script src="animations.js"></script> <!-- 공통 애니메이션 (마지막) -->
</body>
```

---

## 4. JavaScript 모듈 명세

### 4.1 `script.js` — 홈 페이지 공통 인터랙션

| 함수/기능 | 설명 |
|-----------|------|
| 네비바 스크롤 효과 | `window.scrollY > 50` 시 `.scrolled` 클래스 추가 |
| 모바일 햄버거 메뉴 | `#navToggle` 클릭 → `navLinks.active` 토글, body 스크롤 잠금 |
| 섹션 IntersectionObserver | 뷰포트 진입 섹션에 따라 nav 링크 active 상태 업데이트 |
| 다크/라이트 테마 토글 | localStorage `alaala-theme` 저장, 시스템 설정 초기값 |
| 요금제 월/연간 전환 | `animateNumber()` easeOutCubic으로 숫자 애니메이션 |
| 히어로 통계 카운터 | IntersectionObserver 진입 시 0 → target 카운트업 |
| 파티클 효과 | 20개 부유 닷 동적 생성 (CSS animation) |
| 퀵 액션 플로팅 버튼 | `#quickActions` 토글, 외부 클릭 닫기 |
| 스무스 스크롤 | `a[href^="#"]` 클릭 시 부드러운 앵커 이동 |

**핵심 유틸리티:**
```javascript
function animateNumber(element, start, end, duration) {
    // easeOutCubic: 1 - Math.pow(1 - progress, 3)
    // requestAnimationFrame 기반 부드러운 숫자 카운트
}
```

---

### 4.2 `explore.js` — 탐색 페이지

#### 전체 구조 (IIFE 패턴)

```javascript
(function () {
    'use strict';
    // 1. 테마 토글
    // 2. 검색 포커스 효과
    // 3. 필터 칩
    // 4. 지도 데이터 (memorialsMapData)
    // 5. Google Maps 초기화
    // 6. 뷰 토글 (그리드/리스트)
    // 7. 정렬 드롭다운
    // 8. 페이지네이션
    // 9. 핀 기능
    // 10. 스크롤 리빌 애니메이션
    // 11. ui-avatars 인라인 SVG 교체
})();
```

#### 지도 데이터 스키마 (`memorialsMapData`)

```javascript
{
    id: String,          // 카드 data-memorial-id와 매핑
    name: String,        // 표시 이름
    dates: String,       // '출생년 — 사망년'
    location: String,    // 텍스트 위치 설명
    avatar: String,      // (구) ui-avatars URL (현재 미사용, SVG로 대체)
    link: String,        // 클릭 시 이동 URL
    lat: Number,         // 위도
    lng: Number,         // 경도
    candles: Number,     // 촛불 수
    tributes: Number     // 헌정 수
}
```

현재 샘플 9개: Manila, Quezon City, Cebu City, Davao City, Makati, Baguio City, Iloilo City, Tagaytay, Zamboanga City

#### Google Maps 핵심 함수

```javascript
// 핀 아이콘 생성 (SVG 인라인, 외부 이미지 의존성 없음)
function createPinIcon(initial, pinned)
// → pinned=false: #5ba4d3 (파란색)
// → pinned=true:  #f59e0b (노란색)
// → 반환: { url: 'data:image/svg+xml...', scaledSize, anchor }

// 팝업 HTML 생성
function makePopupContent(m)
// → Google Maps + Waze 딥링크 포함
// → 'Visit Memorial' + 'See card ↓' + '🗺 Google Maps' + '🚗 Waze'

// 지도 초기화 (Google Maps 콜백)
window.initAlaalaMap = function initMap()
// → new google.maps.Map(#memorialMap, { center: Philippines, zoom: 6 })
// → memorialsMapData.forEach(addMapMarker)

// 마커 추가
function addMapMarker(m)
// → new google.maps.Marker + InfoWindow
// → activeInfoWindow 패턴으로 동시에 하나만 열림
// → domready 이벤트로 버튼 클릭 핸들러 연결

// 카드 → 지도 포커스
function focusMapMarker(id)
// → gMap.panTo + setZoom(13) + infoWindow.open

// 지도 → 카드 스크롤
function focusCard(id)
// → scrollIntoView + 'map-linked' 클래스 1.8초 하이라이트

// 핀 상태 변경 시 마커 재렌더
function refreshMapMarker(id)
// → setMap(null) → delete → addMapMarker 재호출
```

#### 핀 기능 (Pin Feature)

```javascript
// localStorage 키
const PINS_KEY = 'alaala-pinned-memorials';

// 저장 구조
[
    { id, name, location, avatar, link }
]

// 주요 함수
getPins()          // localStorage 파싱
savePins(pins)     // localStorage 저장
isPinned(id)       // boolean 반환
togglePin(card)    // 핀 토글 → 사이드바 재렌더 → 지도 마커 갱신
renderPinnedSidebar() // 사이드바 HTML 재렌더
```

---

### 4.3 `memorial.js` — 메모리얼 상세 페이지

| 기능 | 구현 |
|------|------|
| 스티키 탭 내비게이션 | `scrollY` 감지 → 현재 섹션 탭 active |
| 탭 클릭 스크롤 | `getBoundingClientRect().top + scrollY - 140` 오프셋 계산 |
| 음성 플레이어 | `.vp-play` 클릭 → `.vp-wave.playing` 토글 |
| 공유 모달 | `#shareModal` 오픈/클로즈, 소셜 공유 버튼 |
| 헌정 (촛불/꽃) | 클릭 애니메이션 + 카운터 증가 |
| 사진 갤러리 라이트박스 | 이미지 클릭 → 전체화면 뷰어 |

---

### 4.4 `booking.js` — 서비스 예약

#### 멀티스텝 폼 (3단계)

```
Step 1: 서비스 선택
    → .booking-service-card 클릭
    → selectedService, servicePrice 상태 저장

Step 2: 날짜/시간 + 메시지 입력
    → 날짜 유효성 검사 (오늘 이전 불가)
    → 문자 카운터 (최대 500자)

Step 3: 주문 요약 + 결제
    → 서비스명, 가격, 서비스 수수료($25) 합산 표시
    → Pay Now 버튼 (현재 프로토타입)
```

#### 서비스 목록 및 가격

| 서비스 ID | 이름 | 아이콘 |
|-----------|------|--------|
| `mass` | Mass Offering | church |
| `flowers` | Flower Delivery | local_florist |
| `livestream` | Live Stream | videocam |
| `ai-voice` | AI Voice Tribute | record_voice_over |
| `sms` | SMS Notifications | sms |
| `candle` | Virtual Candle | candle |
| `lot-cleaning` | Memorial Lot Cleaning | cleaning_services |
| `tombstone-repair` | Tombstone Repair | construction |

#### 상태 변수

```javascript
let currentStep = 1;
let selectedService = null;
let servicePrice = 0;
const SERVICE_FEE = 25;  // 고정 수수료
```

---

### 4.5 `auth.js` — 인증 페이지

| 기능 | 구현 |
|------|------|
| 로그인/회원가입 탭 전환 | `data-tab` 속성 기반 토글 |
| 전화/이메일 로그인 방식 전환 | `.method-btn` 클릭 → 폼 show/hide |
| OTP 자동 포커스 | 한 자리 입력 완료 시 다음 input으로 포커스 이동 |
| 비밀번호 표시/숨김 | `.toggle-pw` 버튼 → `input[type]` 변환 |
| 폼 유효성 검사 | 이메일 정규식, 비밀번호 최소 8자, 필수 필드 확인 |
| URL 해시 라우팅 | `#register` 해시 시 회원가입 탭 자동 활성화 |

---

### 4.6 `create-memorial.js` — 메모리얼 생성 위저드

#### 5단계 위저드

```
Step 1: 기본 정보       (이름, 출생/사망일, 관계)
Step 2: 프로필 사진      (파일 업로드, 드래그앤드롭)
Step 3: 생애 이야기      (텍스트 에디터, 에피소드)
Step 4: 사진 갤러리      (다중 이미지 업로드)
Step 5: 미리보기 + 발행  (최종 확인, Publish Memorial)
```

#### 단계 이동 로직

```javascript
function goToStep(step) {
    // panels: display 토글
    // steps:  active/completed 클래스
    // lines:  progress 표시
    // prevBtn: step 1에서 hidden
    // nextBtn: step 5에서 'Publish Memorial'로 텍스트 변경
}
```

---

### 4.7 `dashboard.js` — 대시보드

| 기능 | 구현 |
|------|------|
| 사이드바 탭 내비게이션 | `data-tab` → `tab-{id}` 패널 전환 |
| 통계 카운터 애니메이션 | IntersectionObserver + easeOutCubic |
| 메모리얼 카드 삭제 | 확인 다이얼로그 → 카드 페이드아웃 |
| 활동 타임라인 | 최근 헌정 목록 렌더링 |

---

### 4.8 `animations.js` — 공통 애니메이션

모든 페이지에 포함되는 공통 스크롤 리빌 초기화.  
`IntersectionObserver`로 뷰포트 진입 요소에 `.visible` 클래스 부여.

---

## 5. CSS 아키텍처

### 5.1 파일 계층

```
styles.css          ← 레이어 1: 디자인 토큰 + 리셋 + 공통 유틸
    └── pages.css   ← 레이어 2: 네비바, 푸터, 버튼, 폼 공통 컴포넌트
        └── [page].css  ← 레이어 3: 페이지 전용 스타일
animations.css      ← 별도: 키프레임 + 리빌 클래스
```

### 5.2 `styles.css` 구조

```
:root { CSS 변수 }
[data-theme="dark"] { 다크모드 변수 오버라이드 }
* { 리셋 }
html { scroll-behavior: smooth }
body { 폰트, 배경색 }
.container { max-width: 1200px, 좌우 패딩 }
.btn { 버튼 베이스 스타일 }
.btn-primary / .btn-outline / .btn-sm / .btn-lg
```

### 5.3 `explore.css` 구조

```
.explore-hero           히어로 검색 섹션
.explore-search-bar     글래스모피즘 검색바
.filter-chip            필터 버튼
.explore-stats-bar      결과 수 + 뷰 토글 (sticky)
.explore-map-section    지도 섹션
.explore-map-container  지도 래퍼 (display:none → .active → block)
#memorialMap            height: 420px
.memorial-card          카드 (호버 translateY(-4px))
.memorial-card-cover    커버 이미지 (aspect-ratio: 2/1)
.memorial-card-avatar   아바타 (margin-top: -24px, overlap)
.explore-sidebar        핀 사이드바 + 최근 방문
.explore-pagination     페이지네이션
```

### 5.4 반응형 브레이크포인트

```css
/* 태블릿 */
@media (max-width: 1024px) {
    .explore-layout: 1열로 변경
    .explore-grid: 2열로 변경
}

/* 모바일 */
@media (max-width: 768px) {
    .explore-grid: 1열
    #memorialMap height: 300px
    .nav-links: 모바일 드롭다운
}
```

---

## 6. PWA 및 서비스 워커

### 6.1 Web App Manifest (`manifest.json`)

```json
{
    "name": "Alaala — Memorial Services Philippines",
    "short_name": "Alaala",
    "display": "standalone",
    "theme_color": "#7c3aed",
    "background_color": "#fffcf9",
    "start_url": "/index.html",
    "shortcuts": [
        { "name": "Create Memorial", "url": "/create-memorial.html" },
        { "name": "My Dashboard",    "url": "/dashboard.html" },
        { "name": "Explore",         "url": "/explore.html" }
    ]
}
```

아이콘: 72 / 96 / 128 / 144 / 152 / 192 / 384 / 512 px (`/icons/` 디렉토리)

### 6.2 서비스 워커 (`sw.js`)

#### 현재 버전: `alaala-v3`

**버전 변경 규칙:**  
정적 파일(HTML/CSS/JS) 변경 배포 시 반드시 버전 증가

```javascript
const CACHE_NAME = 'alaala-v3';
// 다음 배포 → 'alaala-v4'
```

#### 캐시 전략 상세

```
Install 이벤트
    → caches.open('alaala-v3')
    → cache.addAll(STATIC_ASSETS)   // 23개 파일 사전 캐시
    → self.skipWaiting()            // 즉시 활성화 (대기 없음)

Activate 이벤트
    → 구버전 캐시 전부 삭제 (CACHE_NAME 불일치 키)
    → clients.matchAll → client.navigate(url)  // 모든 탭 강제 리로드
    → self.clients.claim()          // 즉시 모든 클라이언트 제어 획득

Fetch 이벤트 (GET 요청만)
    ├── 외부 origin → return (서비스 워커 미개입, 브라우저 직접 처리)
    ├── HTML (accept: text/html) → Network First
    │       성공: 캐시 갱신 후 응답 반환
    │       실패: 캐시 fallback → /index.html fallback
    └── 정적 파일 → Cache First
            캐시 HIT: 캐시 반환
            캐시 MISS: 네트워크 요청 → 캐시 저장
```

#### 외부 요청 처리 (CORS 이슈 해결)

```javascript
// 외부 URL(Google Maps, CDN 등)은 SW가 개입하지 않음
if (url.origin !== location.origin) return;
// → 'Failed to convert value to Response' 오류 방지
```

#### 캐시 대상 파일 (23개)

HTML: `/`, `/index.html`, `/auth.html`, `/dashboard.html`, `/create-memorial.html`, `/memorial.html`, `/explore.html`, `/booking.html`  
CSS: `/styles.css`, `/pages.css`, `/memorial.css`, `/explore.css`, `/booking.css`, `/admin.css`, `/error.css`, `/animations.css`  
JS: `/script.js`, `/auth.js`, `/dashboard.js`, `/create-memorial.js`, `/memorial.js`, `/explore.js`, `/booking.js`, `/admin.js`, `/animations.js`  
기타: `/manifest.json`

---

## 7. Google Maps 통합

### 7.1 스크립트 로드 방식

```html
<!-- explore.js 이후 로드 (window.initAlaalaMap 미리 정의 필요) -->
<script src="explore.js"></script>
<script
  src="https://maps.googleapis.com/maps/api/js?key=API_KEY&callback=initAlaalaMap"
  async defer>
</script>
```

**로딩 순서:**  
`explore.js` 실행 → `window.initAlaalaMap` 등록 → Google Maps 스크립트 로드 완료 → `initAlaalaMap()` 콜백 호출

### 7.2 API 키 관리

- **현재 키:** `AIzaSyDB0QOHd5OEyqJgO5LL0n3ZKCcL0vnZoEI`
- **제한 방식:** HTTP Referrers (허용 도메인)
- **허용 도메인:**
  ```
  https://alaala-ph.pages.dev/*
  https://*.alaala-ph.pages.dev/*
  ```

> 로컬 개발 시 `http://localhost/*` 추가 필요

### 7.3 지도 설정

```javascript
new google.maps.Map(mapEl, {
    center: { lat: 12.5, lng: 122.5 },  // Philippines 중심
    zoom: 6,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true
});
```

### 7.4 마커 아이콘 (커스텀 SVG 핀)

```javascript
// SVG 구조: 원 + 이니셜 텍스트 + 삼각형 포인터
// 일반: fill="#5ba4d3"  핀고정: fill="#f59e0b"
{
    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg),
    scaledSize: new google.maps.Size(36, 46),
    anchor: new google.maps.Point(18, 46)   // 포인터 끝 기준
}
```

### 7.5 InfoWindow 팝업 내용

```
┌─────────────────────────┐
│  [이니셜]  이름          │
│           출생 — 사망    │
│  📍 위치 설명            │
│  🕯️ N candles  ❤️ N    │
│  [Visit Memorial →]     │
│  [See card ↓]           │
│  [🗺 Google Maps]        │
│  [🚗 Waze]              │
└─────────────────────────┘
```

### 7.6 지도-카드 상호작용

```
카드 위치 버튼 클릭
    → focusMapMarker(id)
    → 지도 섹션으로 스크롤
    → gMap.panTo + setZoom(13)
    → 500ms 후 InfoWindow 오픈

지도 핀 팝업 'See card ↓' 클릭
    → focusCard(id)
    → 카드 섹션으로 스크롤
    → 'map-linked' 클래스 1800ms 하이라이트
```

---

## 8. 상태 관리 (localStorage)

백엔드 없이 클라이언트 측에서만 상태를 관리합니다.

### 8.1 저장 키 목록

| 키 | 타입 | 설명 |
|----|------|------|
| `alaala-theme` | `'light' \| 'dark'` | 테마 설정 |
| `alaala-pinned-memorials` | `JSON Array` | 핀 고정된 메모리얼 목록 |

### 8.2 핀 데이터 구조

```javascript
// alaala-pinned-memorials
[
    {
        id: 'maria-santos',
        name: 'Maria Santos',
        location: 'Manila, Metro Manila',
        avatar: 'data:image/svg+xml,...',  // 인라인 SVG
        link: 'memorial.html'
    },
    ...
]
```

### 8.3 테마 초기화 로직

```javascript
// 우선순위: localStorage → 시스템 설정 → 기본값(light)
const saved = localStorage.getItem('alaala-theme');
if (saved) {
    html.setAttribute('data-theme', saved);
} else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    html.setAttribute('data-theme', 'dark');
}
```

---

## 9. 컴포넌트 명세

### 9.1 네비게이션 바

```html
<nav class="navbar [scrolled]" id="navbar">
    <div class="nav-container">
        <a class="nav-logo">🕯️ Alaala</a>
        <div class="nav-links [active]">...</div>
        <div class="nav-actions">
            <button class="theme-toggle">  <!-- 달/해 아이콘 -->
            <a class="btn btn-outline">Sign In</a>
            <a class="btn btn-primary">Get Started</a>
        </div>
        <button class="nav-toggle" id="navToggle">  <!-- 모바일 햄버거 -->
    </div>
</nav>
```

`scrollY > 50`: `.scrolled` 클래스 → 배경색 + 그림자 적용

### 9.2 메모리얼 카드

```html
<article class="memorial-card reveal-card" data-memorial-id="[id]">
    <div class="memorial-card-cover">
        <img src="[unsplash-url]">
        <button class="memorial-card-pin-btn [pinned]">push_pin</button>
    </div>
    <div class="memorial-card-avatar">
        <img src="[svg-data-uri]" alt="[이름]">   <!-- 인라인 SVG 아바타 -->
    </div>
    <div class="memorial-card-body">
        <h3>이름</h3>
        <p>년도 — 년도</p>
        <p>명언</p>
        <p class="memorial-card-location">
            location_on [위치]
            <button class="card-show-on-map">my_location</button>  <!-- JS 주입 -->
        </p>
        <div class="memorial-card-stats">🕯️ N  ❤️ N  👁 N</div>
        <a class="btn btn-outline btn-sm">Visit Memorial</a>
    </div>
</article>
```

### 9.3 스크롤 리빌 애니메이션

```css
/* animations.css */
.reveal-card {
    opacity: 0;
    transform: translateY(24px);
    transition: opacity 500ms ease, transform 500ms ease;
}
.reveal-card.visible {
    opacity: 1;
    transform: translateY(0);
}
```

```javascript
// IntersectionObserver 설정
{
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
}
// 카드 인덱스 기반 스태거: (index % 3) * 80ms
```

### 9.4 아바타 인라인 SVG (ui-avatars 대체)

```javascript
// explore.js — 페이지 로드 시 자동 실행
document.querySelectorAll('img').forEach(function (img) {
    if (img.src.indexOf('ui-avatars.com') !== -1) {
        var initials = // alt에서 이름 두 글자 추출
        var svg = '<svg>...<circle fill="#6366f1">...<text>' + initials + '</text>...</svg>';
        img.src = 'data:image/svg+xml,' + encodeURIComponent(svg);
    }
});
```

**이유:** `ui-avatars.com`이 `Access-Control-Allow-Origin: *, *` (이중 헤더) 응답을 반환해 CORS 오류 발생 → 외부 의존성 완전 제거

---

## 10. 성능 최적화

### 10.1 이미지 최적화

```html
<!-- 지연 로딩 -->
<img loading="lazy" src="...">

<!-- Unsplash 파라미터로 리사이즈 -->
https://images.unsplash.com/photo-[id]?w=400&h=200&fit=crop
```

### 10.2 폰트 최적화

```html
<!-- DNS 사전 연결 -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

<!-- 필요한 weight만 요청 -->
family=Inter:wght@300;400;500;600;700
family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400
```

### 10.3 CSS 성능

- CSS 커스텀 프로퍼티로 다크모드 전환 시 JS 개입 없이 순수 CSS 처리
- `backdrop-filter` 는 글래스 요소에만 제한 사용
- `will-change` 미사용 (과도한 사용 방지)
- `@media (prefers-reduced-motion)` 지원 고려 필요

### 10.4 JavaScript 성능

- 모든 페이지 스크립트 IIFE 또는 DOMContentLoaded 내부로 스코프 격리
- IntersectionObserver 사용 (scroll 이벤트 폴링 없음)
- `{ passive: true }` 스크롤 이벤트 리스너
- 애니메이션 `requestAnimationFrame` 사용

### 10.5 Service Worker 캐시

- 정적 파일은 `Cache First` → 네트워크 요청 없이 즉시 반환
- HTML은 `Network First` → 항상 최신 버전 우선
- 초기 설치 시 23개 파일 사전 캐시 → 이후 오프라인 동작

---

## 11. 외부 의존성

### 11.1 런타임 의존성

| 서비스 | URL | 용도 | 비용 |
|--------|-----|------|------|
| Google Maps JS API | `maps.googleapis.com` | 지도 렌더링, 핀 | 무료 티어 (월 $200 크레딧) |
| Google Fonts | `fonts.googleapis.com` | Playfair Display, Inter | 무료 |
| Google Material Symbols | `fonts.googleapis.com` | 아이콘 | 무료 |
| Unsplash | `images.unsplash.com` | 샘플 커버 이미지 | 무료 |

### 11.2 제거된 의존성

| 서비스 | 제거 이유 | 대체 |
|--------|-----------|------|
| Leaflet.js | SRI 해시 불일치, OSM 타일 사용 불편 | Google Maps API |
| ui-avatars.com | CORS 이중 헤더 버그 | 인라인 SVG 이니셜 |

---

## 12. 배포 파이프라인

### 12.1 배포 흐름

```
로컬 개발
    │
    ├── git add [파일]
    ├── git commit -m "메시지"
    └── git push origin main
            │
            └── [Cloudflare Pages 자동 감지]
                    │
                    ├── 빌드: 없음 (정적 파일 그대로 배포)
                    ├── 배포: CDN 엣지 전 세계 배포
                    └── URL: https://alaala-ph.pages.dev
                            소요 시간: 약 1~2분
```

### 12.2 배포 시 체크리스트

정적 파일 변경 시:
- [ ] `sw.js` CACHE_NAME 버전 증가 (예: `alaala-v3` → `alaala-v4`)
- [ ] git add + commit + push
- [ ] 배포 완료 후 `Ctrl+Shift+R` 강제 새로고침 확인

API 키 변경 시:
- [ ] Google Cloud Console 허용 도메인 설정 확인
- [ ] `explore.html` 스크립트 URL의 key 파라미터 갱신

---

## 13. 에러 처리 전략

### 13.1 에러 페이지

| 파일 | 상황 |
|------|------|
| `404.html` | 존재하지 않는 URL 접근 |
| `500.html` | 서버 내부 오류 |
| `maintenance.html` | 서비스 점검 중 |

### 13.2 네트워크 에러

```javascript
// HTML 페이지 오프라인 fallback (sw.js)
.catch(() => caches.match(request)
    .then((r) => r || caches.match('/index.html')))
```

### 13.3 Google Maps 로드 실패

현재: `initAlaalaMap`이 호출되지 않으면 지도 없이 페이지 표시  
권장 개선: `#memorialMap`에 "지도를 불러올 수 없습니다" 메시지 fallback 추가

---

## 14. 보안 고려사항

### 14.1 현재 적용

- Google Maps API 키: HTTP Referrer 도메인 제한 (`alaala-ph.pages.dev`)
- 인라인 이벤트 핸들러 없음 (addEventListener 패턴)
- 외부 스크립트 SRI(Subresource Integrity) — Google Maps는 동적 로드로 SRI 불가

### 14.2 알려진 리스크

| 리스크 | 설명 | 조치 |
|--------|------|------|
| API 키 노출 | HTML 소스에 Maps API 키 공개 노출 | 도메인 제한으로 남용 방지 |
| XSS | 현재 사용자 입력이 DOM에 직접 삽입되는 구조 없음 | 백엔드 연동 시 sanitize 필요 |
| localStorage | 민감 데이터 저장 없음 (테마/핀 위치만) | 현재 위험 없음 |

---

## 15. 향후 개발 로드맵

### Phase 1 — 백엔드 연동 (우선순위 높음)

- [ ] 사용자 인증 (Firebase Auth 또는 Supabase)
- [ ] 메모리얼 CRUD API
- [ ] 실제 데이터 기반 지도 핀 (현재 하드코딩)
- [ ] 이미지 업로드 (Cloudflare R2 또는 Firebase Storage)

### Phase 2 — 기능 확장

- [ ] AI 음성 추모 (TTS API 연동)
- [ ] 실시간 알림 (WebSocket 또는 Firebase Realtime)
- [ ] 소셜 공유 메타 (동적 OG 이미지)
- [ ] 다국어 지원 (영어/타갈로그/한국어)

### Phase 3 — 성능 및 품질

- [ ] 서비스 워커 Background Sync (오프라인 예약)
- [ ] Web Push 알림
- [ ] Core Web Vitals 최적화 (LCP, CLS, FID)
- [ ] 자동화 테스트 (Playwright E2E)

---

*이 문서는 코드베이스 변경 시 함께 업데이트되어야 합니다.*
