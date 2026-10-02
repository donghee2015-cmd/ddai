import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DiaryForm } from './components/DiaryForm';
import { AIComfortCard } from './components/AIComfortCard';
import { DiaryHistory } from './components/DiaryHistory';
import { DeploymentGuideModal } from './components/DeploymentGuideModal';
import {
  fetchDiaries,
  saveDiaryEntry,
  deleteDiaryEntry,
  DiaryEntry,
  EmotionType,
  AIResponse,
  isFirebaseReady,
} from './lib/firebase';
import { requestAICheer } from './lib/gemini';
import { Heart, Sparkles, BookHeart, Coffee, ShieldCheck, Sun, Info } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'write' | 'history' | 'guide'>('write');
  const [diaries, setDiaries] = useState<DiaryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingDiaries, setIsFetchingDiaries] = useState(false);
  const [currentResult, setCurrentResult] = useState<{
    entry: DiaryEntry;
    isSaved: boolean;
  } | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load diaries on startup
  useEffect(() => {
    loadDiaries();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadDiaries = async () => {
    setIsFetchingDiaries(true);
    try {
      const result = await fetchDiaries();
      setDiaries(result.diaries);
    } catch (e) {
      console.error('Error fetching diaries', e);
    } finally {
      setIsFetchingDiaries(false);
    }
  };

  const handleSubmitDiary = async ({
    emotion,
    weather,
    title,
    content,
  }: {
    emotion: EmotionType;
    weather: string;
    title: string;
    content: string;
  }) => {
    setIsLoading(true);
    try {
      // 1. Request empathetic response + 1 positive action from Gemini
      const aiResponse = await requestAICheer({
        content,
        emotion,
        weather,
      });

      // 2. Format today date
      const today = new Date();
      const dateStr = today.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      // 3. Save to Firestore & local cache
      const savedEntry = await saveDiaryEntry({
        dateStr,
        emotion,
        weather,
        title: title || `${emotion}의 하루`,
        content,
        aiResponse,
      });

      // 4. Update memory list
      setDiaries((prev) => [savedEntry, ...prev.filter((d) => d.id !== savedEntry.id)]);

      // 5. Display the newly received comforting response
      setCurrentResult({
        entry: savedEntry,
        isSaved: true,
      });

      showToast('다온이의 따뜻한 답장이 도착했습니다 💌');
    } catch (err: any) {
      console.error('Submit diary failed', err);
      showToast('답장을 작성하는 중 잠시 문제가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDiary = async (id: string) => {
    try {
      await deleteDiaryEntry(id);
      setDiaries((prev) => prev.filter((d) => d.id !== id));
      showToast('일기가 삭제되었습니다.');
      if (currentResult?.entry.id === id) {
        setCurrentResult(null);
      }
    } catch (e) {
      console.error('Failed to delete diary', e);
    }
  };

  const handleResetForm = () => {
    setCurrentResult(null);
    setActiveTab('write');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#2E2822]">
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'guide') {
            setIsGuideOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        diaryCount={diaries.length}
        isFirebaseConnected={isFirebaseReady}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 sm:py-9">
        {/* Toast notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#352D26] text-[#FFF9F2] px-4 py-2.5 rounded-2xl shadow-xl border border-amber-300/30 text-xs sm:text-sm font-medium flex items-center gap-2 animate-bounce">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Tab 1: Write Diary */}
        {activeTab === 'write' && (
          <div className="space-y-6">
            {/* Daily Quote / Greeting Header */}
            {!currentResult && (
              <div className="bg-gradient-to-r from-amber-100/70 via-orange-50/60 to-rose-50/70 rounded-3xl p-5 sm:p-7 border border-amber-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-800 uppercase tracking-wider">
                    <Sun className="w-4 h-4 text-amber-600" />
                    <span>오늘의 마음 쉼표</span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-[#3A3127] font-serif-kr">
                    "오늘 어떤 하루를 보냈든, 당신의 이야기는 소중해요."
                  </h2>
                  <p className="text-xs sm:text-sm text-[#7D6E61]">
                    마음에 맺힌 감정을 편안하게 털어놓으세요. 다정한 AI 친구 다온이가 따뜻한 위로와 내일을 위한 활력을 전해줄게요.
                  </p>
                </div>
                <div className="shrink-0 flex sm:flex-col items-center sm:items-end justify-between text-xs text-amber-800/80 bg-white/60 p-3 rounded-2xl border border-amber-200/50">
                  <span className="font-semibold text-amber-900">오늘의 누적 온기</span>
                  <span className="font-bold text-base text-amber-700">{diaries.length}편 기록됨</span>
                </div>
              </div>
            )}

            {/* If response generated, show AI Comfort Card; otherwise show DiaryForm */}
            {currentResult ? (
              <AIComfortCard
                emotion={currentResult.entry.emotion}
                diaryContent={currentResult.entry.content}
                aiResponse={currentResult.entry.aiResponse}
                dateStr={currentResult.entry.dateStr}
                isSaved={currentResult.isSaved}
                onReset={handleResetForm}
                onViewHistory={() => setActiveTab('history')}
              />
            ) : (
              <DiaryForm onSubmit={handleSubmitDiary} isLoading={isLoading} />
            )}
          </div>
        )}

        {/* Tab 2: History & Mood Meter */}
        {activeTab === 'history' && (
          <DiaryHistory
            diaries={diaries}
            onDelete={handleDeleteDiary}
            onRefresh={loadDiaries}
            isLoading={isFetchingDiaries}
            onWriteNew={handleResetForm}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#EFE5D8] bg-[#F7F2EB] py-6 text-center text-xs text-[#8F8174]">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-medium">
            <BookHeart className="w-4 h-4 text-amber-600" />
            <span className="font-serif-kr text-[#4A4036]">따뜻한 하루 일기 & AI 응원</span>
            <span className="text-stone-400">|</span>
            <span>Powered by Google Gemini API & Firebase Firestore</span>
          </div>
          <button
            type="button"
            onClick={() => setIsGuideOpen(true)}
            className="text-amber-800 hover:text-amber-950 font-semibold underline underline-offset-2 flex items-center gap-1 cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Vercel 배포 및 API 환경변수 설정 가이드</span>
          </button>
        </div>
      </footer>

      {/* Guide Modal */}
      <DeploymentGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </div>
  );
}
