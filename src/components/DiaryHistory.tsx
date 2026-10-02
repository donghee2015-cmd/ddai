import React, { useState } from 'react';
import {
  BookHeart,
  Calendar,
  Sparkles,
  Trash2,
  Search,
  ChevronDown,
  ChevronUp,
  Compass,
  Heart,
  Quote,
  Smile,
  Coffee,
  CloudRain,
  Flame,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { DiaryEntry, EmotionType } from '../lib/firebase';

interface DiaryHistoryProps {
  diaries: DiaryEntry[];
  onDelete: (id: string) => Promise<void>;
  onRefresh: () => Promise<void>;
  isLoading: boolean;
  onWriteNew: () => void;
}

export const DiaryHistory: React.FC<DiaryHistoryProps> = ({
  diaries,
  onDelete,
  onRefresh,
  isLoading,
  onWriteNew,
}) => {
  const [selectedEmotion, setSelectedEmotion] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(diaries[0]?.id || null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filter
  const filteredDiaries = diaries.filter((entry) => {
    const matchesEmotion = selectedEmotion === 'all' || entry.emotion === selectedEmotion;
    const matchesQuery =
      !searchQuery.trim() ||
      entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (entry.title && entry.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      entry.aiResponse?.empathyMessage?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.aiResponse?.actionSuggestion?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesEmotion && matchesQuery;
  });

  // Emotional statistics
  const totalCount = diaries.length;
  const joyCount = diaries.filter((d) => d.emotion === '기쁨').length;
  const tiredCount = diaries.filter((d) => d.emotion === '지침').length;
  const flutterCount = diaries.filter((d) => d.emotion === '설렘').length;
  const anxietyCount = diaries.filter((d) => d.emotion === '불안').length;

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('이 일기를 정말 삭제하시겠습니까?')) {
      setDeletingId(id);
      await onDelete(id);
      setDeletingId(null);
    }
  };

  const getEmotionBadge = (emo: EmotionType) => {
    switch (emo) {
      case '기쁨':
        return { label: '기쁨', bg: 'bg-amber-100 text-amber-900 border-amber-300', icon: '☀️' };
      case '지침':
        return { label: '지침', bg: 'bg-orange-100 text-orange-900 border-orange-300', icon: '☕' };
      case '설렘':
        return { label: '설렘', bg: 'bg-rose-100 text-rose-900 border-rose-300', icon: '🌸' };
      case '불안':
        return { label: '불안', bg: 'bg-indigo-100 text-indigo-900 border-indigo-300', icon: '🌧️' };
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Emotion Statistics & Warmth Summary */}
      {totalCount > 0 && (
        <div className="paper-card rounded-3xl p-5 sm:p-6 border border-[#E9DFD0]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-base font-bold text-[#382E26] flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500 fill-orange-400" />
                나의 마음 날씨 기록 ({totalCount}편의 이야기)
              </h3>
              <p className="text-xs text-[#87796D] mt-0.5">
                당신이 걸어온 마음의 여정을 한눈에 살펴보세요.
              </p>
            </div>
            <button
              type="button"
              onClick={onRefresh}
              disabled={isLoading}
              className="text-xs px-3 py-1.5 rounded-xl border border-[#E5DACD] bg-white hover:bg-stone-50 text-[#6B5F54] transition-all flex items-center gap-1.5 self-start cursor-pointer shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>동기화 새로고침</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-center gap-3">
              <span className="text-2xl">☀️</span>
              <div>
                <div className="text-xs text-amber-800 font-medium">기쁨</div>
                <div className="text-base font-bold text-amber-950">
                  {joyCount}회 ({totalCount ? Math.round((joyCount / totalCount) * 100) : 0}%)
                </div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-orange-50/80 border border-orange-200/80 flex items-center gap-3">
              <span className="text-2xl">☕</span>
              <div>
                <div className="text-xs text-orange-800 font-medium">지침</div>
                <div className="text-base font-bold text-orange-950">
                  {tiredCount}회 ({totalCount ? Math.round((tiredCount / totalCount) * 100) : 0}%)
                </div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-rose-50/80 border border-rose-200/80 flex items-center gap-3">
              <span className="text-2xl">🌸</span>
              <div>
                <div className="text-xs text-rose-800 font-medium">설렘</div>
                <div className="text-base font-bold text-rose-950">
                  {flutterCount}회 ({totalCount ? Math.round((flutterCount / totalCount) * 100) : 0}%)
                </div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-indigo-50/80 border border-indigo-200/80 flex items-center gap-3">
              <span className="text-2xl">🌧️</span>
              <div>
                <div className="text-xs text-indigo-800 font-medium">불안</div>
                <div className="text-base font-bold text-indigo-950">
                  {anxietyCount}회 ({totalCount ? Math.round((anxietyCount / totalCount) * 100) : 0}%)
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Emotion filter tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: '전체' },
            { id: '기쁨', label: '☀️ 기쁨' },
            { id: '지침', label: '☕ 지침' },
            { id: '설렘', label: '🌸 설렘' },
            { id: '불안', label: '🌧️ 불안' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedEmotion(item.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedEmotion === item.id
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white/90 text-[#6B5F54] border border-[#E5DACD] hover:bg-stone-50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="일기나 AI 응원 검색..."
            className="w-full pl-9 pr-3.5 py-1.5 rounded-xl border border-[#E5DACD] bg-white text-xs text-[#382E26] focus:outline-none focus:ring-2 focus:ring-amber-400/50"
          />
        </div>
      </div>

      {/* 3. Diary List */}
      {filteredDiaries.length === 0 ? (
        <div className="paper-card rounded-3xl p-10 text-center border border-[#E9DFD0]">
          <div className="w-14 h-14 rounded-2xl bg-amber-100/70 text-amber-700 flex items-center justify-center mx-auto mb-3">
            <BookHeart className="w-7 h-7" />
          </div>
          <h4 className="text-base font-bold text-[#3C342C] mb-1">
            {diaries.length === 0 ? '아직 작성된 일기가 없어요' : '검색 결과가 없습니다'}
          </h4>
          <p className="text-xs text-[#87796D] mb-5 max-w-sm mx-auto">
            {diaries.length === 0
              ? '오늘 마음에 맺힌 생각과 감정을 적고 다정한 AI 비서의 따뜻한 응원을 받아보세요.'
              : '다른 감정 필터나 검색어로 다시 찾아보세요.'}
          </p>
          {diaries.length === 0 && (
            <button
              type="button"
              onClick={onWriteNew}
              className="px-5 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
            >
              첫 일기 쓰러 가기
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDiaries.map((entry) => {
            const isExpanded = expandedId === entry.id;
            const badge = getEmotionBadge(entry.emotion);
            return (
              <div
                key={entry.id}
                className="paper-card rounded-2xl border border-[#E8DED1] hover:border-amber-300/80 transition-all overflow-hidden"
              >
                {/* Entry header item */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                  className="p-4 sm:p-5 flex items-center justify-between gap-3 cursor-pointer hover:bg-stone-50/50 select-none"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1 ${badge.bg}`}>
                      <span>{badge.icon}</span>
                      <span>{badge.label}</span>
                    </span>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm sm:text-base text-[#382E26] truncate">
                          {entry.title || entry.content.substring(0, 30)}
                        </span>
                        {entry.weather && (
                          <span className="text-xs text-[#8D8074] hidden sm:inline">
                            • {entry.weather}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] sm:text-xs text-[#8E8175] flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {entry.dateStr}
                        </span>
                        <span>•</span>
                        <span className="text-amber-800 font-medium truncate">
                          {entry.aiResponse?.cheerSummary || '따뜻한 응원'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 sm:gap-2">
                    <button
                      type="button"
                      onClick={(e) => handleDelete(entry.id, e)}
                      disabled={deletingId === entry.id}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="일기 삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="p-1 text-stone-400">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-1 border-t border-[#F2EAE0] bg-stone-50/40 space-y-4">
                    {/* User's original text */}
                    <div>
                      <div className="text-xs font-bold text-[#6D6155] mb-1.5">
                        📝 내가 쓴 일기
                      </div>
                      <p className="text-xs sm:text-sm text-[#382E26] whitespace-pre-line leading-relaxed bg-white p-3.5 rounded-xl border border-[#E9E0D4]">
                        {entry.content}
                      </p>
                    </div>

                    {/* AI Response Letter */}
                    {entry.aiResponse && (
                      <div className="bg-amber-50/70 p-4 sm:p-5 rounded-xl border border-amber-200/80 space-y-3">
                        <div className="flex items-center justify-between text-xs text-amber-900 font-bold">
                          <span className="flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-amber-600" />
                            다온의 위로 편지
                          </span>
                          <span className="text-amber-700/80 font-normal">
                            {entry.aiResponse.cheerSummary}
                          </span>
                        </div>

                        <p className="text-xs sm:text-sm text-[#3C342C] whitespace-pre-line leading-relaxed font-serif-kr">
                          {entry.aiResponse.empathyMessage}
                        </p>

                        {/* Tomorrow positive action */}
                        {entry.aiResponse.actionSuggestion && (
                          <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200/70 text-xs text-emerald-950 flex items-start gap-2">
                            <Compass className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold text-emerald-900">내일을 위한 긍정 행동: </span>
                              <span>{entry.aiResponse.actionSuggestion}</span>
                            </div>
                          </div>
                        )}

                        {entry.aiResponse.comfortQuote && (
                          <div className="text-center pt-1 text-[11px] sm:text-xs text-amber-900 italic font-medium">
                            "{entry.aiResponse.comfortQuote}"
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
