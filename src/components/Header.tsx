import React from 'react';
import { BookHeart, Sparkles, Database, ShieldCheck, Flame, BookOpen, BarChart3, HelpCircle } from 'lucide-react';

interface HeaderProps {
  activeTab: 'write' | 'history' | 'guide';
  setActiveTab: (tab: 'write' | 'history' | 'guide') => void;
  diaryCount: number;
  isFirebaseConnected: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  diaryCount,
  isFirebaseConnected,
}) => {
  const today = new Date();
  const dateFormatted = today.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  return (
    <header className="border-b border-[#EFE5D8] bg-[#FFFDF9]/90 backdrop-blur-md sticky top-0 z-30 transition-all">
      <div className="max-w-4xl mx-auto px-4 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-200 via-orange-100 to-rose-200 flex items-center justify-center shadow-sm border border-amber-200/60 text-amber-800">
              <BookHeart className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#3A332C] font-serif-kr">
                  따뜻한 하루 일기
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100/80 text-amber-800 border border-amber-200/60">
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  Gemini AI 응원
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#87796D] flex items-center gap-1.5 mt-0.5">
                <span>{dateFormatted}</span>
                <span className="text-[#C5B7A8]">•</span>
                <span className="text-amber-700 font-medium">당신의 마음에 온기를 채우는 공간</span>
              </p>
            </div>
          </div>

          {/* Right badges & Navigation */}
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end">
            {/* Database & Cloud status */}
            <div className="hidden md:flex items-center gap-2 text-xs">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-medium ${
                  isFirebaseConnected
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
                title="Firebase Firestore: visit-5b4f9"
              >
                <Database className="w-3.5 h-3.5" />
                <span>Firestore 연동됨</span>
              </span>
              <span
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-medium bg-blue-50 text-blue-700 border border-blue-200"
                title="Google Gemini AI API 안전 연동"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>보안 API</span>
              </span>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center bg-[#F3ECE3] p-1 rounded-xl border border-[#E6DCce] text-xs sm:text-sm font-medium">
              <button
                type="button"
                onClick={() => setActiveTab('write')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'write'
                    ? 'bg-white text-[#382E26] shadow-sm font-semibold'
                    : 'text-[#7B6E62] hover:text-[#382E26]'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>일기 쓰기</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'history'
                    ? 'bg-white text-[#382E26] shadow-sm font-semibold'
                    : 'text-[#7B6E62] hover:text-[#382E26]'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>보관함</span>
                {diaryCount > 0 && (
                  <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-200/90 text-amber-900 font-bold">
                    {diaryCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('guide')}
                className={`px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                  activeTab === 'guide'
                    ? 'bg-white text-[#382E26] shadow-sm font-semibold'
                    : 'text-[#7B6E62] hover:text-[#382E26]'
                }`}
                title="배포 및 환경변수 안내"
              >
                <HelpCircle className="w-4 h-4" />
                <span className="hidden sm:inline">배포 안내</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
