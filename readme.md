## google place api 이용시

https://console.cloud.google.com/apis/credentials/key/9aee287d-7a2d-426d-bb12-dbabb9df62e9?project=calm-nation-246319
## 참고

이건 URL 서명 도구가 아니라 API 키 HTTP 참조자(Referrer) 제한 설정이 문제예요. 지도가 안 보이는 진짜 이유는 API 키가 현재 도메인을 허용하지 않아서입니다.

Google Cloud Console에서 해야 할 일:

Google Cloud Console → API 및 서비스 → 사용자 인증 정보 이동
현재 사용 중인 API 키 클릭 (AIzaSyDB0QOHd5OEyqJgO5LL0n3ZKCcL0vnZoEI)
애플리케이션 제한사항 섹션 → HTTP 참조자(웹사이트) 선택
아래 도메인들을 추가:

https://alaala-ph.pages.dev/*
https://*.alaala-ph.pages.dev/*
http://localhost/*
저장 클릭

## github

https://github.com/jitnet57/memorial-services-ui.git

## cloudflare

https://dash.cloudflare.com/5a474d9edf6124012e9c555de52666d0/workers-and-pages

maibauntourph@gmail.com

## database

