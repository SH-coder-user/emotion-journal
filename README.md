# 🎙 Emotion Journal (음성 기반 감정 일기 앱)

> **음성ai활용 개인 (2025.10)** 프로젝트  
> 음성으로 감정 상태를 기록하고, GPT가 일기 내용을 요약·감정분석하여 하루의 기분 변화를 시각화하는 앱

---

## 📘 개요

### 🎯 프로젝트 기획 의도
- 일상 속 감정을 음성으로 쉽게 기록하고, 텍스트 입력 없이 자동으로 요약·정리.
- 생성형 AI를 이용해 일기 요약과 감정 점수를 자동화.
- 감정 변화 추이를 그래프로 시각화하여 **사용자 자기상태 점검 도구**로 활용.

### 🧩 핵심 기능
| 기능 구분 | 설명 |
|-----------|------|
| 음성 녹음 | 사용자가 브라우저에서 음성 녹음 후 업로드 |
| STT 변환 | OpenAI Whisper API로 음성을 텍스트로 변환 |
| GPT 요약/감정 분석 | GPT 모델이 일기 제목·요약·감정(점수/라벨) 자동 생성 |
| DB 저장 | PostgreSQL에 일자별 일기 데이터 저장 |
| 게시판 | 10개/페이지 목록 조회, 상세보기, 수정, 삭제 |
| 감정 그래프 | 일자별 감정 점수 변화를 시각화(Line Chart) |

---

## ⚙️ 기술 스택

| 분류 | 기술 |
|------|------|
| Frontend | React (Vite), Axios, React-Router, Chart.js |
| Backend | Node.js (Express), Multer, OpenAI SDK, PostgreSQL (pg) |
| Database | PostgreSQL 16 |
| Infra | Docker / Docker Compose |
| ETC | Nginx(프런트엔드 정적 서빙 및 API 프록시), dotenv, zod |

---

## 🧱 시스템 아키텍처

```text
[Browser]
   │ (MediaRecorder)
   ▼
Frontend (React + Vite)
   │  POST /api/transcribe (multipart/form-data)
   ▼
Backend (Express)
   ├─ Whisper API 호출 → 음성→텍스트
   ├─ GPT 모델 요약·감정분석(JSON)
   ├─ PostgreSQL INSERT
   └─ 결과 반환
   ▼
PostgreSQL
   │
   └─ entries 테이블 (일자, 제목, 내용, 감정라벨/점수)
```

🗂 디렉터리 구조
```
emotion-journal/
 ├── client/              # React 프런트엔드
 │   ├── src/pages/       # Banner, Record, Main, Detail, Edit
 │   ├── src/components/  # RecorderButton, Pagination, EmotionChart
 │   ├── Dockerfile       # 정적 빌드 + Nginx 서빙
 │   └── nginx.conf       # /api → server:8080 프록시
 │
 ├── server/              # Express 백엔드
 │   ├── src/routes/      # transcribe.js, entries.js
 │   ├── src/db.js, openai.js
 │   ├── Dockerfile
 │   └── .env.example
 │
 ├── initdb/              # DB 초기 스키마 자동 생성
 │   └── 01_schema.sql
 │
 ├── docker-compose.yml   # 통합 실행 (db + server + client)
 ├── .gitignore
 ├── README.md
 └── ...
```

🚀 실행 방법
✅ 1. 사전 준비
Docker Desktop (Windows/Mac)

OpenAI API Key
→ OpenAI Dashboard에서 발급

✅ 2. 환경 변수 설정
저장소 루트에 .env 파일 생성:

```
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxx
```
server/.env.example 을 참고해 백엔드 설정 가능:
```
OPENAI_TRANSCRIBE_MODEL=whisper-1
OPENAI_SUMMARY_MODEL=gpt-4o-mini
DATABASE_URL=postgres://postgres:postgres@db:5432/emojournal
PORT=8080
```

✅ 3. 도커로 한 번에 실행
```
docker compose up -d --build
```

기동 순서
db → server → client 순으로 자동 실행
브라우저 접속 : http://localhost:8080

✅ 4. 실행 후 구성요소 확인
항목	URL / 명령	정상 응답
백엔드 상태	http://localhost:8080/api/health	{"ok":true}
DB 연결	docker compose logs server	“Server listening…” 메시지
웹앱	http://localhost:8080	배너 페이지 표시

💻 개발용 로컬 실행 (도커 없이)
개발자는 로컬에서 Hot Reload로 빠르게 테스트 가능

```
# 1. PostgreSQL 띄우기 (도커)
docker run -d --name emojournal-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=emojournal -p 5432:5432 postgres:16

# 2. 서버
cd server
cp .env.example .env   # 키 입력
npm i
npm run dev            # http://localhost:8080

# 3. 클라이언트
cd ../client
npm i
npm run dev            # http://localhost:5173 (Vite 프록시로 /api 연결)
```

🧪 기능 테스트 시나리오
단계	동작	기대 결과
1	메인 페이지(Banner) 접속	“🎙️ 음성 녹음” 버튼 표시
2	녹음 시작 → 3~5초 후 종료	“로딩 중...” 표시 후 서버 업로드
3	서버 로그 확인	Whisper STT 호출, GPT 요약/감정 생성
4	/main 페이지	최근 일기 목록(제목/날짜/감정점수) 표시
5	목록 클릭	상세보기 페이지(내용·감정점수·원문) 표시
6	“수정” 클릭	감정라벨·점수 수정 가능, 제목은 불가
7	“삭제” 클릭	DB에서 해당 일기 삭제됨
8	하단 그래프	최근 10개 감정점수 라인 그래프 표시

🧰 주요 구현 포인트
🎙️ 1. 브라우저 음성 녹음 (MediaRecorder)
사용자의 마이크 입력을 Blob(WebM/OGG)으로 저장
```
navigator.mediaDevices.getUserMedia({ audio:true })
```
녹음 완료 후 multipart/form-data 로 서버 업로드

🤖 2. STT + 요약 + 감정분석
Whisper: 음성 → 텍스트 변환

GPT (gpt-4o-mini):

```
{
  "title": "20자 이내 제목",
  "summary": "요약 내용",
  "emotion_label": "기쁨|슬픔|무난",
  "emotion_score": 0~100
}
```

🗄️ 3. PostgreSQL
entries 테이블 구조:

컬럼	설명
id	PK
created_at	생성시간
title	일기 제목
content	요약 내용
emotion_label	감정 분류
emotion_score	감정 점수
transcript	음성 텍스트 원문

📈 4. 감정 그래프
Chart.js(Line)으로 날짜별 감정점수 시각화

긍정적일수록 높은 점수(0~100)

🧩 기술적 개선 여지
영역	개선 아이디어
STT	장문 음성 자동 분할 처리
요약	감정 라벨링을 사전 정의된 스케일로 정규화
프런트	React Query로 비동기 상태 관리
배포	Nginx HTTPS + Docker Compose production profile
인증	다중 사용자 로그인/식별 기능 추가

🧑‍💻 팀 개발 워크플로
GitHub Repository Fork / Clone

각자 .env 로 OpenAI Key 설정

브랜치 전략: feature/<기능명> → PR → main 머지

코드 포맷팅: Prettier / ESLint 자동화

Docker Compose로 통합 테스트

🧾 LICENSE
MIT License © 2025 Emotion Journal Team
(비상업적/해커톤 데모 용도로 자유 사용 가능)

🏁 요약
항목	설명
실행 명령	docker compose up -d --build
접속 URL	http://localhost:8080
AI 모델	whisper-1 (STT), gpt-4o-mini (요약/감정)
DB	PostgreSQL 16
주요 기술	React, Express, Docker, Nginx, OpenAI SDK
프로젝트 목적	음성 기반 감정일기 자동화 및 시각화