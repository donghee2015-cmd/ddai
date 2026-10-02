import React, { useState } from 'react';
import { ShieldCheck, Copy, Check, Terminal, ExternalLink, Database, Server, Key, AlertTriangle } from 'lucide-react';

interface DeploymentGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeploymentGuideModal: React.FC<DeploymentGuideModalProps> = ({ isOpen, onClose }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const envExampleContent = `# GEMINI_API_KEY: Google Gemini API Key
# AI Studio runtime 또는 Vercel 환경 변수에서 자동 주입됩니다.
GEMINI_API_KEY="YOUR_GEMINI_API_KEY_HERE"

# 정적 호스팅 폴백용 (선택 사항)
VITE_GEMINI_API_KEY="YOUR_GEMINI_API_KEY_HERE"

# 앱 호스팅 URL
APP_URL="http://localhost:3000"`;

  const vercelSteps = [
    {
      title: '1. GitHub 저장소 연동',
      desc: '해당 프로젝트 코드를 GitHub에 커밋 및 푸시합니다.',
    },
    {
      title: '2. Vercel 프로젝트 생성',
      desc: 'Vercel 대시보드(vercel.com)에서 [Add New...] > [Project]로 저장소를 선택합니다.',
    },
    {
      title: '3. 환경 변수(Environment Variables) 등록',
      desc: 'Project Settings > Environment Variables 메뉴에서 GEMINI_API_KEY를 추가합니다. 값에는 Google AI Studio에서 발급받은 API 키를 넣습니다.',
    },
    {
      title: '4. 배포 완료',
      desc: 'Vercel에 배포되면 /api/diary/cheer 서버리스 함수와 프론트엔드가 자동으로 연동되어 안전하게 작동합니다.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="paper-card-warm max-w-2xl w-full rounded-3xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto border border-[#E8DEC0] shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#F0E6D8]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-800">
              <ShieldCheck className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-[#352E27]">
                보안 요구사항 및 Vercel 배포 가이드
              </h3>
              <p className="text-xs text-[#87796D]">
                API 키 은닉 보안 정책 및 Firebase Firestore 연동 상태
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* 1. Security Architecture Banner */}
        <div className="bg-emerald-50/80 p-4 rounded-2xl border border-emerald-200 flex items-start gap-3 text-xs sm:text-sm text-emerald-950">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-emerald-900 mb-1">
              안전한 서버 측 Gemini API 프록시 구조 적용 완료
            </div>
            <p className="leading-relaxed text-emerald-800">
              Gemini API 키는 프론트엔드 코드 번들에 포함되지 않으며, 서버 측 엔드포인트(
              <code className="bg-emerald-100/80 px-1.5 py-0.5 rounded font-mono text-emerald-900">
                /api/diary/cheer
              </code>
              )에서 <code className="bg-emerald-100/80 px-1.5 py-0.5 rounded font-mono">process.env.GEMINI_API_KEY</code>를 통해 안전하게 호출됩니다.
            </p>
          </div>
        </div>

        {/* 2. Firebase Database status */}
        <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-200 text-xs sm:text-sm text-blue-950">
          <div className="flex items-center gap-2 font-bold text-blue-900 mb-1.5">
            <Database className="w-4 h-4 text-blue-600" />
            <span>Firebase Firestore 데이터베이스 연동 정보</span>
          </div>
          <p className="text-blue-800 leading-relaxed mb-2">
            요청하신 Firebase 프로젝트에 연결되어 있으며, 작성된 모든 일기와 AI 응원은{' '}
            <code className="bg-blue-100/80 px-1.5 py-0.5 rounded font-mono text-blue-900">
              diaries
            </code>{' '}
            컬렉션에 자동 저장됩니다. 오프라인이나 네트워크 지연 시에도 로컬 캐시와 즉각 동기화됩니다.
          </p>
          <div className="bg-white/80 p-3 rounded-xl border border-blue-200/70 font-mono text-xs text-blue-900 space-y-0.5">
            <div>projectId: "visit-5b4f9"</div>
            <div>authDomain: "visit-5b4f9.firebaseapp.com"</div>
            <div>storageBucket: "visit-5b4f9.firebasestorage.app"</div>
          </div>
        </div>

        {/* 3. .env.example example */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-[#4D4238]">
            <span className="flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-amber-600" />
              로컬 테스트용 .env.example 파일 예시
            </span>
            <button
              type="button"
              onClick={() => copyToClipboard(envExampleContent, 'env')}
              className="text-xs text-amber-700 hover:text-amber-800 font-medium flex items-center gap-1 cursor-pointer"
            >
              {copiedKey === 'env' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>복사되었습니다</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>내용 복사</span>
                </>
              )}
            </button>
          </div>
          <pre className="p-3.5 rounded-2xl bg-[#282522] text-[#F3ECE3] font-mono text-xs leading-relaxed overflow-x-auto">
            {envExampleContent}
          </pre>
        </div>

        {/* 4. Vercel Deployment Checklist */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-[#4D4238] flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-amber-600" />
            Vercel 배포 시 환경 변수 설정 단계
          </div>

          <div className="space-y-2">
            {vercelSteps.map((step) => (
              <div
                key={step.title}
                className="p-3 rounded-xl bg-white border border-[#E9DFD0] text-xs text-[#52463B]"
              >
                <div className="font-bold text-[#352E27] mb-0.5">{step.title}</div>
                <div className="text-[#75685B] leading-relaxed">{step.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Close Button */}
        <div className="pt-2 text-right">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
          >
            확인 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
};
