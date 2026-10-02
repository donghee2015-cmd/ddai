import React, { useState, useEffect } from 'react';
import { Sparkles, Heart, Compass, Volume2, VolumeX, Copy, Check, Bookmark, Calendar, ArrowRight, Share2, Quote } from 'lucide-react';
import confetti from 'canvas-confetti';
import { AIResponse, EmotionType } from '../lib/firebase';

interface AIComfortCardProps {
  emotion: EmotionType;
  diaryContent: string;
  aiResponse: AIResponse;
  dateStr: string;
  isSaved: boolean;
  onReset: () => void;
  onViewHistory: () => void;
}

export const AIComfortCard: React.FC<AIComfortCardProps> = ({
  emotion,
  diaryContent,
  aiResponse,
  dateStr,
  isSaved,
  onReset,
  onViewHistory,
}) => {
  const [copied, setCopied] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  useEffect(() => {
    // Launch warm celebratory confetti
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#F97316', '#FB7185', '#FBBF24', '#FED7AA'],
      });
    } catch {
      // ignore
    }
  }, []);

  const handleCopy = () => {
    const textToCopy = `[💌 AI 비서 다온의 따뜻한 답장]\n\n${aiResponse.empathyMessage}\n\n🌱 [내일을 위한 긍정 행동 1가지]\n${aiResponse.actionSuggestion}\n\n"${aiResponse.comfortQuote || ''}"`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleVoice = () => {
    if (!('speechSynthesis' in window)) {
      alert('사용하시는 브라우저에서는 음성 읽기 기능을 지원하지 않습니다.');
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    window.speechSynthesis.cancel();
    const fullSpeech = `${aiResponse.empathyMessage}. 내일을 위한 제안이에요. ${aiResponse.actionSuggestion}`;
    const utterance = new SpeechSynthesisUtterance(fullSpeech);
    utterance.lang = 'ko-KR';
    utterance.rate = 0.92; // Slightly calm and gentle pace
    utterance.pitch = 1.05;

    // Pick Korean voice if available
    const voices = window.speechSynthesis.getVoices();
    const koVoice = voices.find((v) => v.lang.startsWith('ko'));
    if (koVoice) utterance.voice = koVoice;

    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
    setIsPlayingAudio(true);
  };

  const getEmotionBadge = (emo: EmotionType) => {
    switch (emo) {
      case '기쁨':
        return { label: '기쁨의 날', bg: 'bg-amber-100 text-amber-900 border-amber-300', icon: '☀️' };
      case '지침':
        return { label: '쉼이 필요한 날', bg: 'bg-orange-100 text-orange-900 border-orange-300', icon: '☕' };
      case '설렘':
        return { label: '두근거리는 날', bg: 'bg-rose-100 text-rose-900 border-rose-300', icon: '🌸' };
      case '불안':
        return { label: '위로가 필요한 날', bg: 'bg-indigo-100 text-indigo-900 border-indigo-300', icon: '🌧️' };
    }
  };

  const badge = getEmotionBadge(emotion);

  return (
    <div className="space-y-6">
      {/* Main Letter Card */}
      <div className="paper-card-warm rounded-3xl p-6 sm:p-9 border border-[#E9DFD0] relative overflow-hidden transition-all">
        {/* Top soft background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-amber-200/40 via-orange-100/20 to-transparent rounded-bl-full pointer-events-none" />

        {/* Header row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-[#F0E6D8] relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700 shadow-xs border border-amber-200/80">
              <Sparkles className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full">
                  AI 멘토 다온의 답장
                </span>
                <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full border font-medium ${badge.bg}`}>
                  <span>{badge.icon}</span>
                  <span>{badge.label}</span>
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-[#352E27] font-serif-kr mt-1">
                {aiResponse.cheerSummary || '당신의 오늘을 진심으로 응원합니다'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleVoice}
              className={`p-2.5 rounded-xl border text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                isPlayingAudio
                  ? 'bg-amber-500 text-white border-amber-600 animate-pulse'
                  : 'bg-white/90 text-[#6B5F54] border-[#E5DACD] hover:bg-amber-50 hover:text-amber-800'
              }`}
              title={isPlayingAudio ? '낭독 중지' : '다정한 목소리로 읽어주기'}
            >
              {isPlayingAudio ? (
                <>
                  <VolumeX className="w-4 h-4" />
                  <span>읽기 멈춤</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-amber-600" />
                  <span>목소리로 듣기</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className="p-2.5 rounded-xl bg-white/90 border border-[#E5DACD] hover:bg-stone-50 text-[#6B5F54] hover:text-[#382E26] text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer"
              title="응원 편지 복사"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">복사됨!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>편지 복사</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 1. Empathy Message Section */}
        <div className="py-6 relative z-10">
          <div className="text-xs font-semibold text-amber-800/90 mb-2.5 flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-400" />
            <span>당신의 마음에 건네는 다정한 위로</span>
          </div>
          <p className="text-[#3A332C] text-base sm:text-lg leading-relaxed sm:leading-loose font-serif-kr whitespace-pre-line bg-amber-50/40 p-4 sm:p-5 rounded-2xl border border-amber-100/80">
            {aiResponse.empathyMessage}
          </p>
        </div>

        {/* 2. Positive Action Suggestion for Tomorrow */}
        <div className="mb-6 relative z-10">
          <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-50/60 p-5 sm:p-6 rounded-2xl border border-emerald-200/80 shadow-xs">
            <div className="flex items-center gap-2 mb-2 text-emerald-900 font-bold text-sm sm:text-base">
              <div className="w-7 h-7 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                <Compass className="w-4 h-4" />
              </div>
              <span>내일을 위한 긍정적인 행동 1가지</span>
            </div>
            <p className="text-emerald-950 text-sm sm:text-base leading-relaxed pl-9">
              {aiResponse.actionSuggestion}
            </p>
          </div>
        </div>

        {/* 3. Comfort Quote */}
        {aiResponse.comfortQuote && (
          <div className="mb-6 text-center py-4 px-6 rounded-2xl bg-amber-100/50 border border-amber-200/60 relative z-10">
            <Quote className="w-4 h-4 text-amber-500 mx-auto mb-1 opacity-70" />
            <p className="text-xs sm:text-sm text-amber-950 font-serif-kr italic font-medium">
              "{aiResponse.comfortQuote}"
            </p>
          </div>
        )}

        {/* Save confirmation & Action Buttons */}
        <div className="pt-4 border-t border-[#F0E6D8] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs relative z-10">
          <div className="flex items-center gap-2 text-stone-600">
            <Bookmark className="w-4 h-4 text-amber-600 fill-amber-500" />
            <span>
              {isSaved ? 'Firebase 데이터베이스 및 보관함에 안전하게 저장되었습니다.' : '일기가 보관함에 저장되었습니다.'}
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onReset}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-[#E0D4C5] bg-white hover:bg-stone-50 text-[#54483E] font-semibold transition-all cursor-pointer shadow-xs"
            >
              새 일기 쓰기
            </button>
            <button
              type="button"
              onClick={onViewHistory}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            >
              <span>보관함 보기</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* User's Original Diary review card */}
      <div className="paper-card rounded-2xl p-5 border border-[#EBE1D5] text-xs sm:text-sm text-[#5E5246]">
        <div className="font-semibold text-[#3C342C] mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-amber-600" />
            내가 적은 오늘의 일기 ({dateStr})
          </span>
          <span className="text-amber-800 font-medium">감정: {emotion}</span>
        </div>
        <p className="whitespace-pre-line leading-relaxed text-[#4A4036] bg-stone-50/80 p-3.5 rounded-xl border border-stone-200/60">
          {diaryContent}
        </p>
      </div>
    </div>
  );
};
