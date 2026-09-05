import { NextRequest, NextResponse } from 'next/server';

export interface LeadScoreRequest {
  name: string;
  email: string;
  phone: string;
  service?: string;
  budget?: string;
  message: string;
  company?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as LeadScoreRequest;
    const { name, email, phone, service = 'Chung', budget = 'Chưa xác định', message = '' } = body;

    const apiKey =
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (apiKey) {
      try {
        const model = 'gemini-3.7-flash';
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        const systemPrompt = `
Bạn là Giám đốc Kinh doanh B2B của S-Digital Media & Sports.
Hãy thẩm định và chấm điểm chất lượng khách hàng tiềm năng (Lead Scoring) dựa trên thông tin nhận được.

TIÊU CHÍ ĐÁNH GIÁ:
- Điểm từ 80 - 100 (Tier: HOT): Nhu cầu rõ ràng, ngân sách phù hợp (>35tr hoặc giải chạy/marathon), có thông tin liên hệ chuẩn. Hành động: Bốc máy gọi ngay trong 15 phút.
- Điểm từ 50 - 79 (Tier: WARM): Nhu cầu đang khảo sát, ngân sách tầm trung (15-35tr). Hành động: Gửi hồ sơ năng lực và liên hệ trong 24h.
- Điểm < 50 (Tier: COLD): Tin nhắn spam, ngân sách không thực tế hoặc nội dung quá sơ sài.

QUY TẮC:
- Tuyệt đối không dùng emoji.
- Trả về đúng JSON theo định dạng:
{
  "score": number,
  "tier": "HOT" | "WARM" | "COLD",
  "summary": string,
  "actionPlan": string,
  "estimatedValue": string
}
`.trim();

        const userPrompt = `
Khách hàng: ${name}
Điện thoại: ${phone} | Email: ${email}
Dịch vụ quan tâm: ${service}
Ngân sách: ${budget}
Nội dung lời nhắn: ${message}
`.trim();

        const payload = {
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 1000,
            responseMimeType: 'application/json',
          },
        };

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(12000),
        });

        if (response.ok) {
          const resData = await response.json();
          const rawText = resData?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            return NextResponse.json({
              success: true,
              data: JSON.parse(rawText),
              source: 'gemini',
            });
          }
        }
      } catch (err) {
        console.warn('Gemini Lead Scoring failed, using fallback:', err);
      }
    }

    // Fallback logic nếu API bận
    const isHighBudget = budget.includes('50') || budget.includes('100') || budget.toLowerCase().includes('marathon');
    return NextResponse.json({
      success: true,
      data: {
        score: isHighBudget ? 85 : 65,
        tier: isHighBudget ? 'HOT' : 'WARM',
        summary: `Khách hàng quan tâm đến ${service} với ngân sách ${budget}`,
        actionPlan: isHighBudget
          ? 'Khách hàng tiềm năng cao, ưu tiên phân bổ chuyên viên gọi tư vấn ngay'
          : 'Gửi bảng báo giá chi tiết và thông tin gói dịch vụ qua Email/Zalo',
        estimatedValue: budget,
      },
      source: 'smart-fallback',
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}