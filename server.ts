import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Initialize Gemini Client
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY);
  res.json({
    status: 'ok',
    hasGeminiKey: hasKey,
    environment: process.env.NODE_ENV || 'development',
  });
});

// Primary AI Cheer endpoint
app.post('/api/diary/cheer', async (req, res) => {
  try {
    const { content, emotion, weather } = req.body;

    if (!content || !emotion) {
      return res.status(400).json({
        error: '일기 내용(content)과 감정(emotion)을 입력해주세요.',
      });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY가 서버 환경 변수에 설정되어 있지 않습니다. .env 파일이나 Vercel 환경 변수를 확인해주세요.',
      });
    }

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
다음 요구사항을 충실히 지켜 한국어로 진심 어린 답장을 작성해주세요:

1. empathyMessage (감정 공감 및 다정한 위로):
   - 사용자가 느낀 감정("${emotion}")과 상황에 깊이 공감하고, 지친 마음을 따스하게 감싸주는 다정한 말투(~했어요, ~군요, ~을 응원해요)로 3~5문장 작성.
   - "기쁨"일 경우 그 기쁨을 진심으로 함께 축하하고 마음에 오래 간직하도록 북돋아주고,
   - "지침"일 경우 무거운 짐을 내려놓고 쉴 자격이 있음을 따뜻하게 토닥여주며,
   - "설렘"일 경우 반짝이는 설렘의 순간을 응원하고,
   - "불안"일 경우 불안한 마음도 자연스러운 것임을 안심시켜주고 온기를 전해주세요.

2. actionSuggestion (내일을 위한 긍정적인 행동 1가지):
   - 부담스럽지 않고 일상에서 쉽게 실천할 수 있는 구체적이고 밝은 행동 1가지 제안. (예: "내일 아침 따뜻한 물 한 잔 마시며 창밖 햇살 1분 바라보기", "퇴근길에 좋아하는 노래 한 곡을 눈 감고 온전히 듣기" 등)
   - 왜 이 행동이 내일의 기분에 도움이 되는지 짧게 이유도 덧붙여주세요.

3. comfortQuote (한 줄 위로/응원 문구):
   - 가슴에 촛불처럼 따뜻하게 남는 감성적인 1줄 응원 문장.

4. cheerSummary (핵심 응원 태그):
   - 10자 내외의 짧고 힘이 되는 한마디 (예: "오늘도 정말 수고 많았어요")
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
              description: '사용자의 감정에 세심하게 맞춰 토닥여주는 따뜻한 위로 편지글',
            },
            actionSuggestion: {
              type: Type.STRING,
              description: '내일을 위한 긍정적이고 구체적인 실천 행동 1가지와 그 이유',
            },
            comfortQuote: {
              type: Type.STRING,
              description: '마음에 잔잔한 울림을 주는 한 줄 위로/응원 문장',
            },
            cheerSummary: {
              type: Type.STRING,
              description: '10자 내외의 핵심 응원 문구',
            },
          },
          required: ['empathyMessage', 'actionSuggestion', 'comfortQuote', 'cheerSummary'],
        },
      },
    });

    const jsonText = response.text?.trim() || '{}';
    const parsedData = JSON.parse(jsonText);

    return res.json({
      success: true,
      data: parsedData,
    });
  } catch (error: any) {
    console.error('Error generating diary cheer:', error);
    return res.status(500).json({
      error: error?.message || 'AI 응원을 생성하는 중 오류가 발생했습니다.',
    });
  }
});

// Setup Vite for development or serve dist in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(Number(port), '0.0.0.0', () => {
    console.log(`Warm Diary App Server running on http://0.0.0.0:${port}`);
  });
}

startServer();
