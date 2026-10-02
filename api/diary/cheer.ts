import { GoogleGenAI, Type } from '@google/genai';

// Vercel Serverless Function interface
interface VercelRequest {
  method?: string;
  body?: any;
  headers?: Record<string, string | string[] | undefined>;
}

interface VercelResponse {
  status: (statusCode: number) => VercelResponse;
  json: (data: any) => void;
  setHeader: (name: string, value: string) => VercelResponse;
  end: (data?: any) => void;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. CORS headers for Vercel
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 2. Read API key from environment variables
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'GEMINI_API_KEY 환경 변수가 설정되지 않았습니다. Vercel 프로젝트 설정의 Environment Variables에 GEMINI_API_KEY를 추가해주세요.',
    });
  }

  // 3. Parse request body safely
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ error: '유효하지 않은 JSON 본문입니다.' });
    }
  }

  const { content, emotion, weather } = body || {};

  if (!content || !emotion) {
    return res.status(400).json({
      error: '일기 내용과 감정을 모두 입력해주세요.',
    });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const prompt = `
[사용자 일기 정보]
- 선택한 감정: ${emotion}
- 날씨: ${weather || '맑음'}
- 일기 내용:
"""
${content}
"""

당신은 마음이 깊고 따뜻한 멘토이자 다정한 친구 '다온'입니다.
사용자가 오늘 있었던 일과 감정을 털어놓았습니다.
다음 요구사항을 충실히 지켜 한국어로 진심 어린 답장을 작성해주세요:

1. empathyMessage (감정 공감 및 다정한 위로):
   - 사용자가 느낀 감정("${emotion}")과 상황에 깊이 공감하고, 지친 마음을 따스하게 감싸주는 다정한 어조로 3~5문장 작성.
2. actionSuggestion (내일을 위한 긍정적인 행동 1가지):
   - 부담스럽지 않고 일상에서 쉽게 실천할 수 있는 구체적이고 밝은 행동 1가지와 그 이유 제안.
3. comfortQuote (한 줄 위로/응원 문구):
   - 가슴에 촛불처럼 따뜻하게 남는 감성적인 1줄 응원 문장.
4. cheerSummary (핵심 응원 태그):
   - 10자 내외의 짧고 힘이 되는 한마디.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction:
          '당신은 정서적 지지와 긍정 심리학을 바탕으로 따스한 위로와 실천 가능한 활력을 전하는 전문 마음 일기 코치입니다. 존댓말과 부드럽고 온화한 어조를 유지하며, JSON 형식으로만 응답하세요.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            empathyMessage: {
              type: Type.STRING,
            },
            actionSuggestion: {
              type: Type.STRING,
            },
            comfortQuote: {
              type: Type.STRING,
            },
            cheerSummary: {
              type: Type.STRING,
            },
          },
          required: ['empathyMessage', 'actionSuggestion', 'comfortQuote', 'cheerSummary'],
        },
      },
    });

    const jsonText = response.text?.trim() || '{}';
    const parsedData = JSON.parse(jsonText);

    return res.status(200).json({
      success: true,
      data: parsedData,
    });
  } catch (error: any) {
    console.error('Vercel Gemini API error:', error);
    return res.status(500).json({
      error: error?.message || 'AI 응원을 생성하는 중 오류가 발생했습니다.',
    });
  }
}
