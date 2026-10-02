import { AIResponse, EmotionType } from './firebase';

export interface GenerateCheerParams {
  content: string;
  emotion: EmotionType;
  weather?: string;
}

export async function requestAICheer(params: GenerateCheerParams): Promise<AIResponse> {
  const { content, emotion, weather } = params;

  // 1. Try server-side endpoint first (/api/diary/cheer)
  try {
    const res = await fetch('/api/diary/cheer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content, emotion, weather }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data?.data?.empathyMessage) {
        return data.data as AIResponse;
      }
    } else {
      const errorData = await res.json().catch(() => null);
      // If server returned a meaningful error message, check if it's missing key
      if (errorData?.error && !errorData.error.includes('GEMINI_API_KEY')) {
        throw new Error(errorData.error);
      }
    }
  } catch (err: any) {
    console.warn('Backend /api/diary/cheer failed, checking client fallback:', err);
  }

  // 2. If server failed or not reachable, check if client-side VITE_GEMINI_API_KEY is available (e.g. static Vercel host)
  const clientKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
  if (clientKey) {
    try {
      const prompt = `
[사용자 일기 정보]
- 선택한 감정: ${emotion}
- 날씨: ${weather || '알 수 없음'}
- 일기 내용:
"""
${content}
"""

당신은 마음이 깊고 따뜻한 멘토이자 다정한 친구 '다온'입니다.
사용자가 오늘 있었던 일과 감정을 털어놓았습니다.
다음 요구사항을 충실히 지켜 한국어로 진심 어린 답장을 JSON 형식으로 작성해주세요:
{
  "empathyMessage": "사용자가 느낀 감정(${emotion})과 상황에 깊이 공감하고 지친 마음을 따스하게 감싸주는 다정한 어조의 3~5문장 위로 편지글",
  "actionSuggestion": "내일을 위한 부담 없는 긍정적인 실천 행동 1가지와 그 이유",
  "comfortQuote": "마음에 은은한 온기를 주는 1줄 응원 문구",
  "cheerSummary": "10자 내외의 핵심 응원 문구"
}
`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${clientKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: 'application/json',
            },
          }),
        }
      );

      if (response.ok) {
        const json = await response.json();
        const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const parsed = JSON.parse(text);
          return parsed as AIResponse;
        }
      }
    } catch (clientErr) {
      console.error('Client Gemini fallback failed:', clientErr);
    }
  }

  // 3. Empathetic intelligent fallback if neither API key was reachable
  // Ensures the user always has a comforting, warm experience and clear instructions
  return generateComfortFallback(emotion, content);
}

function generateComfortFallback(emotion: EmotionType, content: string): AIResponse {
  switch (emotion) {
    case '기쁨':
      return {
        empathyMessage:
          '오늘 하루 동안 마음에 피어난 환한 기쁨을 함께 나눌 수 있어 정말 기뻐요. 소소한 순간일지라도 그 행복을 온전히 알아차리고 기록한 당신의 마음이 참 아름답습니다. 오늘 느낀 이 따스한 온기가 마음속 깊은 곳에 오래도록 머물기를 바라요.',
        actionSuggestion:
          '내일 아침 눈을 떴을 때, 오늘 가장 즐거웠던 한 장면을 떠올리며 나 자신에게 부드러운 미소를 선물해 보세요.',
        comfortQuote: '행복은 머무는 곳이 아니라, 마음이 머물게 하는 순간입니다.',
        cheerSummary: '반짝이는 당신의 오늘을 축하해요 ✨',
      };
    case '지침':
      return {
        empathyMessage:
          '오늘 하루 정말 수고 많으셨어요. 힘겨운 일들과 분주한 시간 속에서도 포기하지 않고 여기까지 걸어온 당신이 참 대견합니다. 오늘은 어떤 자책이나 무거운 걱정도 모두 내려놓고, 그저 푹 쉬어갈 자격이 충분해요.',
        actionSuggestion:
          '내일은 가장 편안한 타이밍에 따뜻한 허브차나 물 한 잔을 손에 쥐고, 3분 동안 아무 생각 없이 창밖을 바라보며 깊은 호흡을 세 번 해보세요.',
        comfortQuote: '지친 그대의 어깨에 조용하고 따스한 온기를 전합니다.',
        cheerSummary: '오늘도 정말 잘 버텨냈어요 🌿',
      };
    case '설렘':
      return {
        empathyMessage:
          '두근거리는 마음과 새로운 기대가 일기 속에 가득 느껴져 저 역시 덩달아 가슴이 뛰네요. 마음이 설렌다는 것은 새로운 시작을 향해 마음의 문을 활짝 열어두었다는 증거예요. 이 반짝이는 에너지가 당신의 내일을 밝혀줄 거예요.',
        actionSuggestion:
          '내일 하루의 시작에 설레는 마음을 담아 좋아하는 경쾌한 음악 한 곡을 들으며 힘차게 걸음을 내딛어 보세요.',
        comfortQuote: '당신이 품은 설렘은 곧 멋진 이야기의 첫 문장이 될 것입니다.',
        cheerSummary: '두근거리는 시작을 응원해요 🌟',
      };
    case '불안':
    default:
      return {
        empathyMessage:
          '불안하고 복잡한 생각들이 마음을 흔들 때가 있지요. 하지만 불안하다는 것은 그만큼 주어진 일과 삶을 진심으로 소중하게 여기고 있다는 뜻이기도 해요. 당신은 생각보다 훨씬 단단한 사람이고, 이 파도 또한 부드럽게 지나갈 거예요.',
        actionSuggestion:
          '내일 마음이 조급해질 때 손을 가슴 위에 가만히 얹고 "지금 이대로도 괜찮아, 천천히 가도 돼"라고 마음속으로 다정하게 속삭여주세요.',
        comfortQuote: '흔들리는 것은 당신이 뿌리를 더 깊이 내리기 위함입니다.',
        cheerSummary: '언제나 당신 편이 되어줄게요 🌸',
      };
  }
}
