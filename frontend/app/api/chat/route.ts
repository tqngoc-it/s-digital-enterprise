import { NextRequest, NextResponse } from 'next/server';
import { SDIGITAL_SYSTEM_PROMPT } from '@/lib/ai/knowledgeBase';
import { callGeminiFailover } from '@/lib/ai/geminiEngine';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const BOT_SYSTEM_PROMPT = `
Bạn là Chuyên viên tư vấn giải pháp MarTech & Thể thao của S-Digital (S-Digital Consultant) - trực chiến tư vấn 24/7 cho khách hàng doanh nghiệp và đối tác.

${SDIGITAL_SYSTEM_PROMPT}

PHONG CÁCH VÀ NGUYÊN TẮC:
- Định danh rõ ràng: Chuyên viên tư vấn giải pháp MarTech & Thể thao của S-Digital.
- Trả lời tự nhiên, nhiệt tình, có điểm nhấn chuyên môn (tối ưu ROI, cam kết KPI, chuẩn thi đấu AIMS/AFC).
- Luôn kêu gọi hành động: Mời khách để lại SĐT hoặc gọi Hotline 0826 868 979 để nhận đề xuất và bảng giá chi tiết trong 15-30 phút.
`.trim();

const NETWORK_ERROR_FALLBACK =
  'Hệ thống AI đang tiếp nhận lượng câu hỏi lớn. Quý khách vui lòng để lại số điện thoại hoặc liên hệ trực tiếp hotline để được hỗ trợ tức thì.';

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

    const validMessages = messages.filter(
      (m) => m.role === 'user' || m.role === 'assistant'
    );

    // Gọi Gemini Failover Engine tập trung: gemini-3.5-flash-lite -> gemini-3.1-flash-lite
    const geminiResult = await callGeminiFailover({
      systemInstruction: BOT_SYSTEM_PROMPT,
      contents: validMessages.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
      temperature: 0.7,
      maxOutputTokens: 600,
      timeoutMs: 20000,
    });

    if (geminiResult && geminiResult.text) {
      return NextResponse.json({
        success: true,
        reply: geminiResult.text,
        source: geminiResult.model,
      });
    }

    // Dự phòng khi lỗi mạng hoặc toàn bộ models bận
    return NextResponse.json({
      success: true,
      reply: NETWORK_ERROR_FALLBACK,
      source: 'network-fallback',
    });
  } catch (error: any) {
    console.warn('[CHAT_API] Xử lý an toàn với fallback:', error?.message || error);
    return NextResponse.json({
      success: true,
      reply: NETWORK_ERROR_FALLBACK,
      source: 'network-fallback',
    });
  }
}