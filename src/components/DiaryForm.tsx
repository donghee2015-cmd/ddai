import React, { useState } from 'react';
import { Sparkles, Sun, Cloud, CloudRain, Moon, Wind, Heart, Smile, Coffee, Compass, AlertCircle, PenLine, RefreshCw } from 'lucide-react';
import { EmotionType } from '../lib/firebase';

interface DiaryFormProps {
  onSubmit: (data: {
    emotion: EmotionType;
    weather: string;
    title: string;
    content: string;
  }) => Promise<void>;
  isLoading: boolean;
}

const EMOTIONS: {
  type: EmotionType;
  label: string;
  subtext: string;
  icon: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  accentBg: string;
}[] = [
  {
    type: '기쁨',
    label: '기쁨',
    subtext: '환한 미소와 행복했던 순간',
    icon: '☀️',
    bgColor: 'bg-amber-50/80 hover:bg-amber-100/70',
    borderColor: 'border-amber-300',
    textColor: 'text-amber-900',
    accentBg: 'bg-amber-400/20',
  },
  {
    type: '지침',
    label: '지침',
    subtext: '지친 몸과 마음에 쉼이 필요한 날',
    icon: '☕',
    bgColor: 'bg-orange-50/80 hover:bg-orange-100/70',
    borderColor: 'border-orange-300',
    textColor: 'text-orange-900',
    accentBg: 'bg-orange-400/20',
  },
  {
    type: '설렘',
    label: '설렘',
    subtext: '두근거리는 기대와 새로운 호기심',
    icon: '🌸',
    bgColor: 'bg-rose-50/80 hover:bg-rose-100/70',
    borderColor: 'border-rose-300',
    textColor: 'text-rose-900',
    accentBg: 'bg-rose-400/20',
  },
  {
    type: '불안',
    label: '불안',
    subtext: '어지러운 생각과 다정한 위로가 필요한 때',
    icon: '🌧️',
    bgColor: 'bg-indigo-50/80 hover:bg-indigo-100/70',
    borderColor: 'border-indigo-300',
    textColor: 'text-indigo-900',
    accentBg: 'bg-indigo-400/20',
  },
];

const WEATHERS = [
  { label: '맑음', icon: '☀️' },
  { label: '구름 조금', icon: '⛅' },
  { label: '비', icon: '🌧️' },
  { label: '선선한 바람', icon: '🍃' },
  { label: '포근한 밤', icon: '🌙' },
];

const INSPIRATION_PROMPTS = [
  '오늘 나를 미소 짓게 만든 작은 순간은?',
  '오늘 하루 중 가장 수고스러웠던 일은?',
  '지금 내 마음에 가장 전하고 싶은 말은?',
  '내일 기대되거나 조금 걱정되는 일이 있나요?',
];

export const DiaryForm: React.FC<DiaryFormProps> = ({ onSubmit, isLoading }) => {
  const [emotion, setEmotion] = useState<EmotionType>('지침');
  const [weather, setWeather] = useState<string>('맑음');
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [showError, setShowError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setShowError(true);
      return;
    }
    setShowError(false);
    await onSubmit({
      emotion,
      weather,
      title: title.trim(),
      content: content.trim(),
    });
  };

  const handleInsertPrompt = (prompt: string) => {
    if (!content) {
      setContent(`[${prompt}]\n`);
    } else {
      setContent((prev) => `${prev}\n\n[${prompt}]\n`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="paper-card rounded-3xl p-6 sm:p-8 border border-[#EBE1D5] transition-all">
      {/* 1. Emotion selection section */}
      <div className="mb-7">
        <div className="flex items-center justify-between mb-3">
          <label className="text-base sm:text-lg font-semibold text-[#3C342C] flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
            오늘 당신의 마음 날씨(감정)는 어떤가요?
            <span className="text-xs text-amber-700 font-normal bg-amber-100/70 px-2 py-0.5 rounded-full">
              필수 선택
            </span>
          </label>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {EMOTIONS.map((item) => {
            const isSelected = emotion === item.type;
            return (
              <button
                key={item.type}
                type="button"
                onClick={() => setEmotion(item.type)}
                className={`relative p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? `${item.bgColor} ${item.borderColor} shadow-md ring-2 ring-amber-400/50 scale-[1.02]`
                    : 'bg-white/80 border-[#E8DEC0]/80 hover:bg-stone-50/80 text-[#594E44]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-2xl">{item.icon}</span>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  )}
                </div>
                <div className={`font-bold text-base ${isSelected ? item.textColor : 'text-[#382E26]'}`}>
                  {item.label}
                </div>
                <div className="text-xs text-[#7F7266] mt-0.5 leading-tight">
                  {item.subtext}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Weather & Title row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <div>
          <label className="block text-xs font-semibold text-[#665B50] mb-1.5">
            오늘의 날씨
          </label>
          <div className="flex flex-wrap gap-1.5">
            {WEATHERS.map((w) => (
              <button
                key={w.label}
                type="button"
                onClick={() => setWeather(w.label)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                  weather === w.label
                    ? 'bg-amber-100 text-amber-900 border-amber-300 font-semibold shadow-xs'
                    : 'bg-white/80 text-[#6B5F54] border-[#E8DEC0]/70 hover:bg-[#F8F3EC]'
                }`}
              >
                <span>{w.icon}</span> <span className="ml-0.5">{w.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-[#665B50] mb-1.5">
            일기 제목 <span className="font-normal text-[#A39587]">(선택 사항)</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: 지친 퇴근길에 만난 따뜻한 노을"
            className="w-full px-3.5 py-2 rounded-xl border border-[#E3D7C8] bg-white/90 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 text-sm text-[#382E26] placeholder-[#B5A89A]"
          />
        </div>
      </div>

      {/* 3. Content Textarea */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-sm sm:text-base font-semibold text-[#3C342C] flex items-center gap-2">
            <PenLine className="w-4 h-4 text-amber-600" />
            오늘 있었던 일과 내 감정 이야기하기
          </label>
          <span className="text-xs text-[#8E8073]">
            {content.length} 자
          </span>
        </div>

        <div className="relative">
          <textarea
            rows={7}
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              if (showError && e.target.value.trim()) setShowError(false);
            }}
            placeholder="오늘 하루 어떤 일이 있었나요? 사소한 일이라도 괜찮아요. 마음에 걸렸던 생각이나 전하고 싶었던 감정을 편안하게 적어보세요..."
            className="w-full p-4 rounded-2xl border border-[#E3D7C8] bg-white notebook-lines focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400 text-[#332C26] text-base leading-[32px] placeholder-[#B8ACA0] resize-y transition-all"
          />
        </div>

        {showError && (
          <div className="flex items-center gap-1.5 mt-2 text-rose-600 text-xs font-medium">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>일기 내용을 조금만 적어주세요. 당신의 솔직한 한 줄도 소중해요.</span>
          </div>
        )}

        {/* Quick prompt pills */}
        <div className="mt-3 flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-[#9E9083] font-medium mr-1">
            글감이 떠오르지 않을 때:
          </span>
          {INSPIRATION_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => handleInsertPrompt(prompt)}
              className="text-xs px-2.5 py-1 rounded-full bg-[#F4EDE4] text-[#695D52] hover:bg-amber-100 hover:text-amber-800 transition-colors border border-[#E5DACD]"
            >
              + {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Submit Button */}
      <div className="pt-3 border-t border-[#F0E6D8] flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs text-[#8B7D70] flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Google Gemini AI가 따뜻한 위로와 내일을 위한 활력 행동 1가지를 답장해 드립니다.</span>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full sm:w-auto px-6 py-3.5 rounded-2xl font-bold text-base transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
            isLoading
              ? 'bg-amber-200 text-amber-800 cursor-not-allowed'
              : 'bg-gradient-to-r from-amber-500 via-orange-400 to-amber-600 hover:from-amber-600 hover:to-orange-500 text-white hover:shadow-lg active:scale-98'
          }`}
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-amber-900" />
              <span>다온이가 다정한 답장을 작성하고 있어요...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-amber-100 animate-pulse" />
              <span>AI 비서에게 일기 보여주기</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};
