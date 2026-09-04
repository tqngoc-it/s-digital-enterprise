import { NextRequest, NextResponse } from 'next/server';
import {
  SDIGITAL_SYSTEM_PROMPT,
  getSmartFallbackResponse,
} from '@/lib/ai/knowledgeBase';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { messages } = body as { messages?: ChatMessage[] };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Danh sách tin nhắn không hợp lệ' },
        { status: 400 }
      );
    }

    // Lấy tin nhắn người dùng gần nhất
    const userMessages = messages.filter((m) => m.role === 'user');
    const lastUserMessage = userMessages[userMessages.length - 1]?.content || '';

    // Kiểm tra các biến môi trường API Key
    const geminiApiKey =
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    const openaiApiKey =
      process.env.OPENAI_API_KEY ||
      process.env.NEXT_PUBLIC_OPENAI_API_KEY;

    // 1. Thử kết nối Google Gemini API nếu có Key
    if (geminiApiKey) {
      try {
        const geminiResponse = await callGeminiAPI(geminiApiKey, messages);
        if (geminiResponse) {
          return NextResponse.json({
            success: true,
            reply: geminiResponse,
            source: 'gemini',
          });
        }
      } catch (geminiError) {
        console.warn('Gemini API call failed, falling back to smart rules:', geminiError);
      }
    }

    // 2. Thử kết nối OpenAI API nếu có Key
    if (openaiApiKey) {
      try {
        const openaiResponse = await callOpenAIAPI(openaiApiKey, messages);
        if (openaiResponse) {
          return NextResponse.json({
            success: true,
            reply: openaiResponse,
            source: 'openai',
          });
        }
      } catch (openaiError) {
        console.warn('OpenAI API call failed, falling back to smart rules:', openaiError);
      }
    }

    // 3. Fallback Response thông minh dựa trên từ khóa câu hỏi của khách
    const fallbackReply = getSmartFallbackResponse(lastUserMessage);
    return NextResponse.json({
      success: true,
      reply: fallbackReply,
      source: 'smart-fallback',
    });
  } catch (error: any) {
    console.error('Lỗi xử lý chat API:', error);
    // Vẫn trả về fallback an toàn để trải nghiệm người dùng không bị gián đoạn
    const safeReply = getSmartFallbackResponse('');
    return NextResponse.json({
      success: true,
      reply: safeReply,
      source: 'smart-fallback',
    });
  }
}

/**
 * Gọi Google Gemini API bằng REST endpoint trực tiếp
 */
async function callGeminiAPI(apiKey: string, messages: ChatMessage[]): Promise<string | null> {
  const model = 'gemini-3.7-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  // Chuẩn bị contents cho Gemini API
  const contents = messages
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

  const payload = {
    system_instruction: {
      parts: [{ text: SDIGITAL_SYSTEM_PROMPT }],
    },
    contents: contents,
    generationConfig: {
      temperature: 0.7,
      topP: 0.9,
      maxOutputTokens: 1000,
    },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    // Timeout 15s để không block UI
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  return text || null;
}

/**
 * Gọi OpenAI API bằng REST endpoint
 */
async function callOpenAIAPI(apiKey: string, messages: ChatMessage[]): Promise<string | null> {
  const url = 'https://api.openai.com/v1/chat/completions';

  const formattedMessages = [
    { role: 'system', content: SDIGITAL_SYSTEM_PROMPT },
    ...messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  ];

  const payload = {
    model: 'gpt-4o-mini',
    messages: formattedMessages,
    temperature: 0.7,
    max_tokens: 1000,
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content;
  return text || null;
}
