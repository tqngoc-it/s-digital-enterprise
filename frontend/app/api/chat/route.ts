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

    // Lấy tin nhắn người dùng gần nhất để xử lý fallback
    const userMessages = messages.filter((m) => m.role === 'user');
    const lastUserMessage = userMessages[userMessages.length - 1]?.content || '';

    // Lấy API Key
    const geminiApiKey =
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    // 1. Thử kết nối Google Gemini API (gemini-3.7-flash)
    if (geminiApiKey) {
      const geminiResponse = await callGeminiChat(geminiApiKey, messages);
      if (geminiResponse) {
        return NextResponse.json({
          success: true,
          reply: geminiResponse,
          source: 'gemini-3.7-flash',
        });
      }
    }

    // 2. Chuyển thẳng vào Smart Fallback nội bộ để trả lời khách ngay mà không ném exception
    const fallbackReply = getSmartFallbackResponse(lastUserMessage);
    return NextResponse.json({
      success: true,
      reply: fallbackReply,
      source: 'smart-fallback',
    });
  } catch (error: any) {
    console.warn('[CHAT_API] Xử lý an toàn với Smart Fallback:', error?.message || error);
    const safeReply = getSmartFallbackResponse('');
    return NextResponse.json({
      success: true,
      reply: safeReply,
      source: 'smart-fallback',
    });
  }
}

/**
 * Gọi Google Gemini API bằng REST endpoint chuẩn duy nhất với model gemini-3.7-flash
 */
async function callGeminiChat(apiKey: string, messages: ChatMessage[]): Promise<string | null> {
  const model = 'gemini-3.7-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

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

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      // Tăng timeout lên 20000ms (20 giây)
      signal: AbortSignal.timeout(20000),
    });

    // Nếu gặp mã 503 (High demand) hoặc lỗi HTTP -> cảnh báo nhẹ và trả về null để kích hoạt Smart Fallback
    if (response.status === 503) {
      console.warn('[GEMINI_CHAT] Gemini API 503 Service Unavailable (High demand), kích hoạt Smart Fallback');
      return null;
    }

    if (!response.ok) {
      console.warn(`[GEMINI_CHAT] Gemini API trả mã lỗi: ${response.status}, kích hoạt Smart Fallback`);
      return null;
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return text || null;
  } catch (err: any) {
    // Bắt lỗi timeout hoặc sự cố mạng -> ghi warn nhẹ, không throw exception làm đỏ console
    console.warn(
      `[GEMINI_CHAT] Kết nối Gemini gặp lỗi hoặc timeout (20s): ${err?.message || err}, kích hoạt Smart Fallback`
    );
    return null;
  }
}