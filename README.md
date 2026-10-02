# 따뜻한 하루 일기 & AI 응원 (Warm Diary & AI Comfort) 📖✨

Google Gemini API와 Firebase Firestore를 연동한 감성 일기 및 마음 케어 웹 애플리케이션입니다.  
오늘의 감정(기쁨, 지침, 설렘, 불안)과 일기를 적으면, AI 멘토 '다온'이 다정한 위로와 내일을 위한 구체적인 긍정 행동 1가지를 답장해 드립니다.

---

## 🚀 Vercel 배포 가이드 (GitHub 연동)

이 저장소를 GitHub에 올린 후 Vercel에서 단 몇 번의 클릭으로 배포할 수 있습니다.

### 1단계: GitHub 저장소 생성 및 푸시
```bash
git init
git add .
git commit -m "feat: 따뜻한 하루 일기 웹앱 최초 커밋"
git branch -M main
git remote add origin https://github.com/사용자이름/저장소이름.git
git push -u origin main
```

### 2단계: Vercel에서 프로젝트 가져오기 (Import)
1. [Vercel 대시보드](https://vercel.com)에 로그인합니다.
2. **[Add New...]** > **[Project]** 버튼을 클릭합니다.
3. 방금 푸시한 GitHub 저장소를 선택하고 **[Import]**를 클릭합니다.
4. Framework Preset은 **Vite**로 자동 감지됩니다.
   - Build Command: `npm run build`
   - Output Directory: `dist`

### 3단계: 환경 변수(Environment Variables) 등록 🔑
배포 전 **Environment Variables** 섹션에 아래 키를 반드시 추가해주세요:

| Key | Value 예시 | 설명 |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | `AIzaSy...` | Google AI Studio에서 발급받은 Gemini API 키 |

> 💡 **보안 안내**: `GEMINI_API_KEY`는 브라우저에 노출되지 않으며, Vercel 서버리스 함수(`/api/diary/cheer`)에서 안전하게 호출됩니다.

### 4단계: 배포 (Deploy)
**[Deploy]** 버튼을 누르면 1분 내로 배포가 완료되며 고유한 도메인 URL이 생성됩니다.

---

## 💻 로컬 개발 환경 실행

```bash
# 1. 의존성 패키지 설치
npm install

# 2. 환경 변수 파일 복사 및 설정
cp .env.example .env
# .env 파일 내 GEMINI_API_KEY="실제_API_키" 입력

# 3. 개발 서버 실행 (포트 3000)
npm run dev
```

---

## 🛠️ 기술 스택 및 구조

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Canvas-Confetti
- **Backend / Serverless**: 
  - 로컬/풀스택: Express + Vite middleware (`server.ts`)
  - Vercel 배포: Vercel Serverless Function (`api/diary/cheer.ts`)
- **AI**: Google Gemini API (`@google/genai` - `gemini-3.8-flash`)
- **Database**: Firebase Firestore (`visit-5b4f9`) - 오프라인 캐시 및 동기화 지원
- **TTS**: Web Speech API 기반 한국어 음성 낭독
