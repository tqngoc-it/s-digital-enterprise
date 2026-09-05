import { NextRequest, NextResponse } from 'next/server';

export interface ScoreLeadRequest {
  name?: string;
  full_name?: string;
  email?: string;
  phone?: string;
  service?: string;
  budget?: string;
  message?: string;
  notes?: string;
  company?: string;
  company_name?: string;
}

export interface ScoreLeadResponse {
  score: number;
  tier: 'HOT' | 'WARM' | 'COLD';
  summary: string;
  actionPlan: string;
  estimatedValue: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as ScoreLeadRequest;

    const name = body.name || body.full_name || 'Khách hàng';
    const email = body.email || '';
    const phone = body.phone || '';
    const service = body.service || 'Tư vấn chiến lược tổng thể';
    const budget = body.budget || 'Chưa xác định';
    const message = body.message || body.notes || '';
    const company = body.company || body.company_name || '';

    const apiKey =
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (apiKey) {
      try {
        const geminiResult = await callGeminiScoreLead(apiKey, {
          name,
          email,
          phone,
          service,
          budget,
          message,
          company,
        });

        if (geminiResult) {
          return NextResponse.json({
            success: true,
            ...geminiResult,
            data: geminiResult,
            source: 'gemini',
          });
        }
      } catch (geminiError) {
        console.warn('[AI_SCORE_LEAD] Gemini API call failed, activating smart fallback:', geminiError);
      }
    }

    // Smart Fallback nếu không có API Key hoặc Gemini bận / lỗi
    const fallbackResult = computeSmartLeadScore({
      name,
      email,
      phone,
      service,
      budget,
      message,
      company,
    });

    return NextResponse.json({
      success: true,
      ...fallbackResult,
      data: fallbackResult,
      source: 'smart-fallback',
    });
  } catch (error: any) {
    console.error('[AI_SCORE_LEAD] Lỗi xử lý endpoint score-lead:', error);
    const safeFallback = computeSmartLeadScore({
      name: 'Khách hàng',
      email: '',
      phone: '',
      service: 'Tư vấn giải pháp',
      budget: 'Chưa xác định',
      message: '',
      company: '',
    });

    return NextResponse.json({
      success: true,
      ...safeFallback,
      data: safeFallback,
      source: 'smart-fallback',
    });
  }
}

async function callGeminiScoreLead(
  apiKey: string,
  params: {
    name: string;
    email: string;
    phone: string;
    service: string;
    budget: string;
    message: string;
    company: string;
  }
): Promise<ScoreLeadResponse | null> {
  const model = 'gemini-3.7-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const systemPrompt = `
Bạn là Giám đốc Kinh doanh B2B cấp cao của S-Digital Media & Sports - tổ hợp Tiếp thị số & Giải pháp Thể thao hàng đầu Việt Nam.
Nhiệm vụ của bạn là thẩm định chất lượng khách hàng tiềm năng (AI Lead Scoring) để tối ưu hóa nguồn lực chuyển đổi của đội ngũ sales B2B.

TIÊU CHÍ ĐÁNH GIÁ VÀ TRỌNG SỐ:
1. Thông tin liên hệ và tính xác thực (25%): Có tên công ty rõ ràng, email doanh nghiệp (tên miền riêng), số điện thoại hợp lệ.
2. Quy mô ngân sách và khả năng chi trả (35%):
   - Ngân sách lớn (> 100 triệu hoặc gói Doanh nghiệp/Enterprise): Tiềm năng cao nhất.
   - Ngân sách 35 - 100 triệu (Gói Growth / Chuyên nghiệp / Giải thể thao): Tiềm năng tốt.
   - Ngân sách 15 - 35 triệu (Gói Starter): Khách hàng SME/Khởi nghiệp.
   - Ngân sách không xác định hoặc dưới 15 triệu: Cần sàng lọc thêm.
3. Nhu cầu dịch vụ và tính phù hợp với S-Digital (20%): Phù hợp với thế mạnh cốt lõi như Performance Marketing, Tổ chức giải chạy Marathon chuẩn quốc tế AIMS, Booking 100+ trọng tài AFC/FIBA, Booking KOLs/KOCs, TVC/Video viral 4K, Xử lý khủng hoảng truyền thông 24/7.
4. Mức độ cấp thiết và chi tiết trong yêu cầu (20%): Nội dung tin nhắn chi tiết, có bài toán cụ thể, mục tiêu đo lường rõ ràng, thời hạn triển khai gấp.

PHÂN CẤP KHÁCH HÀNG (TIER):
- "HOT": Điểm 75 - 100. Khách hàng doanh nghiệp rõ ràng, ngân sách lớn hoặc nhu cầu rất cấp bách, đầy đủ thông tin liên hệ. Ưu tiên phản hồi trong 15 - 30 phút.
- "WARM": Điểm 45 - 74. Có tiềm năng thực tế, thông tin cơ bản đầy đủ, ngân sách tầm trung hoặc đang tìm hiểu giải pháp, cần tư vấn định hướng. Phản hồi trong 2 giờ.
- "COLD": Điểm 0 - 44. Thông tin liên hệ sơ sài (thiếu SĐT hoặc công ty), ngân sách quá thấp, nội dung mơ hồ hoặc dấu hiệu thử nghiệm/spam. Chăm sóc tự động qua email.

QUY TẮC BẮT BUỘC:
1. Tuyệt đối không sử dụng bất kỳ icon robot hay biểu tượng emoji nào trong toàn bộ nội dung.
2. Trả về đúng định dạng JSON thuần túy theo cấu trúc:
{
  "score": number, // Số nguyên từ 0 đến 100
  "tier": "HOT" | "WARM" | "COLD",
  "summary": string, // Nhận định nhu cầu khách
  "actionPlan": string, // Kịch bản hành động cho Sales (liên hệ trong 15p, gửi brochure,...)
  "estimatedValue": string // Giá trị hợp đồng ước tính
}
`.trim();

  const userContent = `
Hồ sơ khách hàng tiềm năng gửi yêu cầu tư vấn:
- Họ và tên: ${params.name}
- Tên công ty / Tổ chức: ${params.company || 'Chưa cung cấp'}
- Email: ${params.email || 'Chưa cung cấp'}
- Số điện thoại: ${params.phone || 'Chưa cung cấp'}
- Dịch vụ quan tâm: ${params.service}
- Mức ngân sách dự kiến: ${params.budget}
- Nội dung yêu cầu / Lời nhắn: ${params.message || 'Không có lời nhắn bổ sung'}

Hãy thực hiện thẩm định toàn diện và xuất kết quả theo định dạng JSON yêu cầu.
`.trim();

  const payload = {
    system_instruction: {
      parts: [{ text: systemPrompt }],
    },
    contents: [
      {
        role: 'user',
        parts: [{ text: userContent }],
      },
    ],
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.2,
      maxOutputTokens: 1000,
    },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Gemini API error [${response.status}]: ${errorBody}`);
  }

  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  return parseGeminiScoreResponse(rawText);
}

function parseGeminiScoreResponse(rawText?: string): ScoreLeadResponse | null {
  if (!rawText) return null;
  try {
    const cleaned = rawText
      .replace(/^```json\s*/i, '')
      .replace(/```\s*$/, '')
      .trim();
    const parsed = JSON.parse(cleaned);

    const score = Math.max(0, Math.min(100, Math.round(Number(parsed.score) || 50)));
    let tier: 'HOT' | 'WARM' | 'COLD' = 'WARM';
    if (parsed.tier === 'HOT' || parsed.tier === 'WARM' || parsed.tier === 'COLD') {
      tier = parsed.tier;
    } else {
      tier = score >= 75 ? 'HOT' : score >= 45 ? 'WARM' : 'COLD';
    }

    if (parsed.summary && parsed.actionPlan && parsed.estimatedValue) {
      return {
        score,
        tier,
        summary: String(parsed.summary).trim(),
        actionPlan: String(parsed.actionPlan).trim(),
        estimatedValue: String(parsed.estimatedValue).trim(),
      };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Smart Fallback: Ma trận logic nội bộ dự phòng chuyên sâu khi không có API key hoặc API bận
 */
function computeSmartLeadScore(params: {
  name: string;
  email: string;
  phone: string;
  service: string;
  budget: string;
  message: string;
  company: string;
}): ScoreLeadResponse {
  let score = 30; // Điểm cơ bản
  const msgLower = (params.message || '').toLowerCase();
  const emailLower = (params.email || '').toLowerCase();
  const phoneClean = (params.phone || '').replace(/\s+/g, '');
  const companyClean = (params.company || '').trim();
  const budgetLower = (params.budget || '').toLowerCase();
  const serviceLower = (params.service || '').toLowerCase();

  // 1. Kiểm tra thông tin liên hệ
  const isCorporateEmail =
    emailLower.includes('@') &&
    !emailLower.endsWith('@gmail.com') &&
    !emailLower.endsWith('@yahoo.com') &&
    !emailLower.endsWith('@hotmail.com') &&
    !emailLower.endsWith('@outlook.com');

  if (isCorporateEmail) score += 15;
  else if (emailLower.includes('@')) score += 8;

  const hasValidPhone = /^[0-9+]{9,13}$/.test(phoneClean);
  if (hasValidPhone) score += 12;

  const hasCompany = companyClean.length > 2;
  if (hasCompany) score += 13;

  // 2. Kiểm tra ngân sách
  let estimatedValue = '25.000.000 - 45.000.000 VNĐ';
  if (
    budgetLower.includes('> 100') ||
    budgetLower.includes('trên 100') ||
    budgetLower.includes('enterprise') ||
    budgetLower.includes('500tr') ||
    budgetLower.includes('tỷ')
  ) {
    score += 25;
    estimatedValue = '100.000.000 - 250.000.000 VNĐ';
  } else if (
    budgetLower.includes('50-100') ||
    budgetLower.includes('50 - 100') ||
    budgetLower.includes('growth') ||
    budgetLower.includes('70')
  ) {
    score += 20;
    estimatedValue = '50.000.000 - 100.000.000 VNĐ';
  } else if (
    budgetLower.includes('20-50') ||
    budgetLower.includes('20 - 50') ||
    budgetLower.includes('35')
  ) {
    score += 15;
    estimatedValue = '35.000.000 - 50.000.000 VNĐ';
  } else if (budgetLower.includes('< 20') || budgetLower.includes('dưới 20')) {
    score += 5;
    estimatedValue = '15.000.000 - 25.000.000 VNĐ';
  } else {
    score += 8;
  }

  // 3. Kiểm tra độ chi tiết của lời nhắn
  if (msgLower.length > 80) score += 12;
  else if (msgLower.length > 30) score += 7;

  // 4. Kiểm tra từ khóa giá trị cao S-Digital
  const isHighValueIntent =
    msgLower.includes('marathon') ||
    msgLower.includes('giải chạy') ||
    msgLower.includes('trọng tài') ||
    msgLower.includes('khủng hoảng') ||
    msgLower.includes('tvc') ||
    msgLower.includes('booking') ||
    msgLower.includes('tổng thể') ||
    serviceLower.includes('marathon') ||
    serviceLower.includes('thể thao') ||
    serviceLower.includes('khủng hoảng');

  if (isHighValueIntent) score += 10;

  // Giới hạn điểm chuẩn từ 15 đến 98
  score = Math.max(15, Math.min(98, score));

  // Phân tầng Tier
  let tier: 'HOT' | 'WARM' | 'COLD' = 'WARM';
  let summary = '';
  let actionPlan = '';

  if (score >= 75) {
    tier = 'HOT';
    summary = `Khách hàng tiềm năng cấp cao${hasCompany ? ` từ ${companyClean}` : ''}, có định hướng dịch vụ rõ ràng và ngân sách tương thích với các gói chiến lược trọng điểm của S-Digital. Mức độ sẵn sàng hợp tác rất cao.`;
    actionPlan =
      'Phân công Trưởng phòng Kinh doanh B2B gọi điện thoại trực tiếp trong vòng 15 phút. Gửi hồ sơ năng lực Credentials kèm Proposal giải pháp may đo và bảng dự toán chi tiết trong 2 giờ làm việc.';
  } else if (score >= 45) {
    tier = 'WARM';
    summary = `Khách hàng có nhu cầu hợp tác thực tế${hasCompany ? ` đại diện cho ${companyClean}` : ''}, thông tin cơ bản đầy đủ nhưng cần làm rõ thêm về KPI cụ thể và khung thời gian triển khai.`;
    actionPlan =
      'Chuyên viên tư vấn liên hệ qua điện thoại hoặc Zalo trong vòng 2 giờ làm việc. Gửi Profile dịch vụ tương ứng, lắng nghe bài toán kinh doanh và hẹn lịch họp tư vấn trực tuyến 1:1.';
  } else {
    tier = 'COLD';
    summary =
      'Khách hàng có thông tin ban đầu còn hạn chế hoặc ngân sách khởi điểm khiêm tốn. Cần xác thực thêm mức độ nghiêm túc của nhu cầu trước khi phân bổ nguồn lực kinh doanh cấp cao.';
    actionPlan =
      'Gửi email tự động kèm cẩm nang giải pháp và bảng giá tham khảo. Thêm vào luồng chăm sóc email marketing định kỳ để tiếp tục nuôi dưỡng nhận thức thương hiệu.';
  }

  return {
    score,
    tier,
    summary,
    actionPlan,
    estimatedValue,
  };
}
