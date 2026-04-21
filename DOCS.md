# Alaala — 기술 및 운영 문서

> **프로젝트명:** Alaala Memorial Services Philippines  
> **버전:** v1.0  
> **배포 URL:** https://alaala-ph.pages.dev  
> **저장소:** https://github.com/jitnet57/memorial-services-ui  
> **최종 업데이트:** 2026-04-22

---

## 목차

1. [프로젝트 개요](#1-프로젝트-개요)
2. [기술 스택](#2-기술-스택)
3. [파일 구조](#3-파일-구조)
4. [페이지별 기능](#4-페이지별-기능)
5. [서비스 워커 (PWA)](#5-서비스-워커-pwa)
6. [Google Maps 연동](#6-google-maps-연동)
7. [외부 API 및 의존성](#7-외부-api-및-의존성)
8. [배포 프로세스](#8-배포-프로세스)
9. [알려진 이슈 및 해결 방법](#9-알려진-이슈-및-해결-방법)
10. [서비스 워커 캐시 버전 관리](#10-서비스-워커-캐시-버전-관리)

---

## 1. 프로젝트 개요

Alaala는 필리핀을 위한 온라인 추모 서비스 플랫폼입니다.  
고인을 추모하는 메모리얼 페이지 생성, 탐색, 예약, 관리를 제공하며 PWA(Progressive Web App)로 구현되어 있습니다.

**주요 기능:**
- 메모리얼 페이지 생성 및 관리
- 구글 지도 기반 메모리얼 위치 탐색 (Philippines 전국)
- 추모 서비스 예약
- 촛불/헌화 등 헌정 기능
- 다크모드 / 라이트모드 지원
- 오프라인 지원 (Service Worker)

---

## 2. 기술 스택

| 구분 | 기술 |
|------|------|
| 프론트엔드 | HTML5, CSS3 (Custom Properties), Vanilla JavaScript (ES5+) |
| 지도 | Google Maps JavaScript API |
| 폰트 | Google Fonts (Playfair Display, Inter) |
| 아이콘 | Google Material Symbols Outlined |
| PWA | Service Worker, Web App Manifest |
| 배포 | Cloudflare Pages (GitHub 자동 배포) |
| 버전 관리 | Git / GitHub |

---

## 3. 파일 구조

```
memorial-services-ui/
│
├── index.html              # 메인 홈 페이지
├── explore.html            # 메모리얼 탐색 + 지도
├── memorial.html           # 개별 메모리얼 페이지
├── create-memorial.html    # 메모리얼 생성
├── dashboard.html          # 사용자 대시보드
├── booking.html            # 서비스 예약
├── auth.html               # 로그인 / 회원가입
├── admin.html              # 관리자 페이지
├── 404.html                # 404 에러 페이지
├── 500.html                # 500 에러 페이지
├── maintenance.html        # 점검 안내 페이지
│
├── styles.css              # 전역 공통 스타일 (CSS 변수, 버튼, 레이아웃)
├── pages.css               # 페이지 공통 컴포넌트 스타일
├── explore.css             # Explore 페이지 전용 스타일
├── memorial.css            # Memorial 페이지 전용 스타일
├── booking.css             # Booking 페이지 전용 스타일
├── admin.css               # Admin 페이지 전용 스타일
├── error.css               # 에러 페이지 스타일
├── animations.css          # 공통 애니메이션
│
├── script.js               # 공통 JavaScript (navbar, theme 등)
├── explore.js              # Explore 페이지 로직 + 지도 핀
├── memorial.js             # Memorial 페이지 로직
├── create-memorial.js      # 메모리얼 생성 로직
├── dashboard.js            # 대시보드 로직
├── booking.js              # 예약 로직
├── auth.js                 # 인증 로직
├── admin.js                # 관리자 로직
├── animations.js           # 스크롤 애니메이션 초기화
│
├── sw.js                   # Service Worker (PWA 캐시 관리)
├── manifest.json           # PWA 매니페스트
├── favicon.svg             # 파비콘
├── icons/                  # PWA 아이콘 (72~512px)
│
└── DOCS.md                 # 이 문서
```

---

## 4. 페이지별 기능

### `index.html` — 홈
- 히어로 섹션, 서비스 소개, 최근 메모리얼 목록
- CTA: 메모리얼 생성, 탐색

### `explore.html` — 탐색
- 메모리얼 검색 (이름/위치/키워드)
- 필터 칩 (전체/최신/방문순/헌정순/근처)
- **Google Maps** 핀 지도 (Philippines 전국 9개 샘플 위치)
- 메모리얼 카드 그리드 (3열) / 리스트 뷰 전환
- 핀 고정(Pin) 사이드바 기능
- 카드 클릭 → 지도 포커스 / 지도 핀 클릭 → 카드 스크롤

### `memorial.html` — 메모리얼 상세
- 고인 프로필, 생애, 사진 갤러리
- 촛불/헌화/댓글 헌정
- 공유 기능

### `create-memorial.html` — 생성
- 멀티스텝 폼 (기본정보 → 사진 → 생애 → 미리보기)

### `dashboard.html` — 대시보드
- 내 메모리얼 목록, 통계, 최근 헌정 활동

### `booking.html` — 예약
- 장례/추모 서비스 선택 및 일정 예약 폼

### `auth.html` — 인증
- 로그인 / 회원가입 탭 전환

---

## 5. 서비스 워커 (PWA)

**파일:** `sw.js`  
**현재 캐시 버전:** `alaala-v4`

### 캐시 전략

| 요청 유형 | 전략 |
|-----------|------|
| HTML 페이지 | Network First → 캐시 fallback |
| CSS / JS / 이미지 등 정적 파일 | Cache First → 네트워크 fallback |
| 외부 URL (Google Maps, CDN 등) | 서비스 워커 미개입 (브라우저 직접 처리) |

### 캐시 업데이트 규칙

> 코드 변경 후 배포 시 반드시 캐시 버전을 올려야 사용자에게 최신 버전이 전달됩니다.

```javascript
// sw.js 상단
const CACHE_NAME = 'alaala-v4';  // 변경 시 → alaala-v5, v6 순으로 증가
```

버전을 올리면 activate 이벤트에서 이전 캐시가 자동 삭제되고, 열린 탭이 자동 새로고침됩니다.

---

## 6. Google Maps 연동

**API 키:** `AIzaSyDB0QOHd5OEyqJgO5LL0n3ZKCcL0vnZoEI`  
**로드 방식:** async defer + callback

```html
<script src="https://maps.googleapis.com/maps/api/js?key=API_KEY&callback=initAlaalaMap" async defer></script>
```

### API 키 도메인 허용 설정 (필수)

Google Cloud Console → APIs & Services → Credentials → API 키 편집  
**HTTP referrers** 허용 목록:
```
https://alaala-ph.pages.dev/*
https://*.alaala-ph.pages.dev/*
```

### 지도 핀 데이터

`explore.js`의 `memorialsMapData` 배열에 정의됩니다.

```javascript
{
    id: 'maria-santos',
    name: 'Maria Santos',
    dates: '1945 — 2024',
    location: 'Manila Memorial Park, Parañaque',
    lat: 14.4944, lng: 121.0179,
    candles: 342, tributes: 128,
    link: 'memorial.html'
}
```

### 핀 아이콘

초기 이니셜 기반 SVG 핀으로 외부 이미지 의존성 없음.  
- 일반 핀: `#5ba4d3` (파란색)  
- 핀 고정된 핀: `#f59e0b` (노란색)

---

## 7. 외부 API 및 의존성

| 서비스 | 용도 | 비고 |
|--------|------|------|
| Google Maps JavaScript API | 지도 렌더링, 핀 표시 | API 키 필요, 도메인 제한 설정 |
| Google Fonts | Playfair Display, Inter 폰트 | CDN 로드 |
| Google Material Symbols | 아이콘 | CDN 로드 |
| Unsplash (images.unsplash.com) | 메모리얼 커버 이미지 샘플 | 무료 티어, URL 파라미터로 리사이즈 |

> `ui-avatars.com`은 CORS 이중 헤더 버그로 제거됨 → 인라인 SVG 이니셜 아바타로 대체

---

## 8. 배포 프로세스

### 자동 배포 (Cloudflare Pages + GitHub 연동)

```bash
git add [변경파일]
git commit -m "커밋 메시지"
git push origin main
```

`main` 브랜치에 push하면 Cloudflare Pages가 자동으로 빌드 및 배포합니다.  
배포 소요 시간: 약 1~2분

### 배포 확인

- Production: https://alaala-ph.pages.dev
- Cloudflare Dashboard: https://dash.cloudflare.com

### 배포 후 체크리스트

- [ ] 브라우저에서 `Ctrl+Shift+R` 강제 새로고침
- [ ] DevTools Console 에러 없음 확인
- [ ] 지도 핀 표시 확인 (explore.html)
- [ ] 다크모드 전환 정상 확인

---

## 9. 알려진 이슈 및 해결 방법

### 서비스 워커 구버전 캐시 문제

**증상:** 코드 변경 후에도 이전 버전이 표시됨  
**원인:** 브라우저가 서비스 워커 캐시에서 구버전 파일을 제공  
**해결:**
1. `sw.js`의 `CACHE_NAME` 버전 증가 (v3 → v4)
2. `git push` 배포
3. 브라우저에서 `Ctrl+Shift+R` 또는 DevTools → Application → Service Workers → Unregister

### Google Maps ApiTargetBlockedMapError

**증상:** 지도가 표시되지 않고 콘솔에 `ApiTargetBlockedMapError`  
**원인:** API 키에 현재 도메인이 허용되지 않음  
**해결:** Google Cloud Console에서 도메인 허용 목록에 `https://alaala-ph.pages.dev/*` 추가

### CORS 오류 (ui-avatars.com)

**증상:** `Access-Control-Allow-Origin header contains multiple values '*, *'`  
**해결:** 이미 인라인 SVG로 대체 완료. 서비스 워커도 외부 요청 미개입으로 수정됨.

---

## 10. 서비스 워커 캐시 버전 관리

코드를 변경하고 배포할 때마다 아래 절차를 따릅니다:

```
alaala-v1  (초기)
alaala-v2  (2026-04-22: SW CORS 버그 수정)
alaala-v3  (2026-04-22: 지도 가시성 수정, 강제 리로드 추가)
alaala-v4  (다음 배포 시 사용)
```

**규칙:** 정적 파일(CSS/JS/HTML) 변경 시 반드시 버전 증가 후 배포.
