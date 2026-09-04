import { NextRequest, NextResponse } from 'next/server';

export interface RecommendRequest {
  industry: string;
  goal: string;
  budget: string;
  note?: string;
}

export interface RecommendationResult {
  recommendedPlan: string;
  estimatedBudget: string;
  analysis: string;
  keyDeliverables: string[];
  timeline: string;
  suggestedServices: string[];
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as RecommendRequest;
    const { industry = 'Doanh nghiệp chung', goal = 'Tăng trưởng doanh số', budget = '20-50tr', note = '' } = body;

    const apiKey =
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    // 1. Thử gọi Google Gemini API nếu có API Key
    if (apiKey) {
      try {
        const geminiResult = await callGeminiRecommendation(apiKey, { industry, goal, budget, note });
        if (geminiResult) {
          return NextResponse.json({
            success: true,
            data: geminiResult,
            source: 'gemini-3.7-flash',
          });
        }
      } catch (geminiError) {
        console.warn('Gemini Recommendation API error, switching to logic fallback:', geminiError);
      }
    }

    // 2. Cơ chế Fallback an toàn thông minh dựa trên ma trận logic ngân sách & mục tiêu
    const fallbackData = computeSmartFallback(industry, goal, budget, note);
    return NextResponse.json({
      success: true,
      data: fallbackData,
      source: 'logic-matrix-fallback',
    });
  } catch (error: any) {
    console.error('Lỗi xử lý recommend API:', error);
    const safeData = computeSmartFallback('Doanh nghiệp', 'Tăng doanh số', '20-50tr', '');
    return NextResponse.json({
      success: true,
      data: safeData,
      source: 'safe-fallback',
    });
  }
}

/**
 * Gọi Google Gemini API (gemini-3.7-flash) với prompt phân tích chiến lược
 */
async function callGeminiRecommendation(
  apiKey: string,
  params: RecommendRequest
): Promise<RecommendationResult | null> {
  const model = 'gemini-3.7-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const systemInstruction = `
Bạn là Chuyên gia Hoạch định Chiến lược Cấp cao của S-Digital Media & Sports.
Nhiệm vụ của bạn: Phân tích bài toán kinh doanh của khách hàng và đề xuất gói giải pháp tối ưu nhất dựa trên dữ liệu thực tế của S-Digital.

DỮ LIỆU DỊCH VỤ VÀ BẢNG GIÁ THỰC TẾ S-DIGITAL:
- Gói Cơ Bản (Starter): Từ 15.000.000 VNĐ/tháng. Phù hợp cho ngân sách dưới 20 triệu, SME & Startup. Triển khai Google/Facebook Ads cơ bản, 12 bài viết fanpage, báo cáo tháng.
- Gói Chuyên Nghiệp (Growth - Phổ biến nhất): Từ 35.000.000 VNĐ/tháng. Phù hợp cho ngân sách 20 - 50 triệu và 50 - 100 triệu. Tối ưu đa kênh Meta, Google, TikTok Ads; sản xuất 4 video ngắn + TVC; booking 3-5 KOLs/KOCs; tối ưu SEO và Landing Page; Dashboard realtime 24/7.
- Gói Doanh Nghiệp (Enterprise): May đo riêng (thường > 100 triệu). Trọn gói Omni-channel, chiến lược thương hiệu độc quyền, dedicated account team.
- Dịch vụ Giải pháp Thể thao: Tổ chức giải chạy Marathon (chuẩn quốc tế AIMS, hệ thống chip timing điện tử), giải bóng đá doanh nghiệp, đại hội thể thao đa môn, cung cấp 100+ trọng tài quốc tế AFC/FIBA, học viện thể thao.
- Dịch vụ Xử lý Khủng hoảng Truyền thông 24/7: Phản ứng nhanh trong 30 phút, dập tắt rủi ro truyền thông.

QUY TẮC BẮT BUỘC:
1. TUYỆT ĐỐI KHÔNG SỬ DỤNG BẤT KỲ EMOJI NÀO TRONG VĂN BẢN TRẢ VỀ.
2. Trả về đúng định dạng JSON thuần túy, không thừa ký tự, theo cấu trúc schema sau:
{
  "recommendedPlan": string,
  "estimatedBudget": string,
  "analysis": string,
  "keyDeliverables": string[],
  "timeline": string,
  "suggestedServices": string[]
}
`.trim();

  const userPrompt = `
Dữ liệu khách hàng cung cấp:
- Ngành nghề kinh doanh: ${params.industry}
- Mục tiêu chiến lược: ${params.goal}
- Ngân sách dự kiến: ${params.budget}
- Ghi chú bổ sung: ${params.note || 'Không có ghi chú thêm'}

Hãy phân tích bài toán và trả về JSON đề xuất giải pháp tối ưu nhất.
`.trim();

  const payload = {
    system_instruction: {
      parts: [{ text: systemInstruction }],
    },
    contents: [
      {
        role: 'user',
        parts: [{ text: userPrompt }],
      },
    ],
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 1000,
      responseMimeType: 'application/json',
    },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    // Thử fallback sang gemini-2.5-flash nếu 3.7-flash chưa khả dụng trên region hiện tại
    const fallbackUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const fbRes = await fetch(fallbackUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15000),
    });
    if (!fbRes.ok) {
      throw new Error(`Gemini API failed: ${fbRes.status}`);
    }
    const fbData = await fbRes.json();
    const rawText = fbData?.candidates?.[0]?.content?.parts?.[0]?.text;
    return parseJsonResult(rawText);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  return parseJsonResult(text);
}

function parseJsonResult(rawText?: string): RecommendationResult | null {
  if (!rawText) return null;
  try {
    const cleaned = rawText
      .replace(/^```json\s*/i, '')
      .replace(/```\s*$/, '')
      .trim();
    const parsed = JSON.parse(cleaned);
    if (parsed.recommendedPlan && parsed.analysis) {
      return parsed as RecommendationResult;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Ma trận logic định sẵn để fallback chuẩn xác và đảm bảo không có emoji
 */
function computeSmartFallback(
  industry: string,
  goal: string,
  budget: string,
  note: string
): RecommendationResult {
  const goalLower = goal.toLowerCase();
  const industryLower = industry.toLowerCase();

  // Nhánh 1: Thể thao, Giải chạy, Marathon, Trọng tài
  if (
    goalLower.includes('giải chạy') ||
    goalLower.includes('marathon') ||
    goalLower.includes('trọng tài') ||
    goalLower.includes('thể thao') ||
    industryLower.includes('thể thao')
  ) {
    return {
      recommendedPlan: 'Gói Giải Pháp Thể Thao & Điều Hành Giải Đấu Toàn Diện',
      estimatedBudget: 'Từ 45.000.000 VNĐ (May đo theo quy mô)',
      analysis: `Với mục tiêu ${goal} trong lĩnh vực ${industry}, giải pháp tổ chức thể thao chuẩn quốc tế của S-Digital đảm bảo tính chuyên nghiệp, an toàn tuyệt đối và lan tỏa truyền thông mạnh mẽ. Mô hình tích hợp trọn gói từ khâu cấp phép, kỹ thuật chip timing AIMS đến điều hành của mạng lưới trọng tài liên đoàn.`,
      keyDeliverables: [
        'Khảo sát và thiết kế cung đường hoặc điều hành sân bãi đạt chuẩn thi đấu',
        'Cung cấp hệ thống timing chip điện tử chính xác mili-giây và bảo trợ y tế',
        'Bố trí đội ngũ trọng tài đạt chứng chỉ quốc gia và quốc tế (AFC/FIBA/AIMS)',
        'Sản xuất tư liệu truyền thông, livestream nhiều góc máy và tổng kết ROI',
      ],
      timeline: '4 - 8 tuần',
      suggestedServices: [
        'Tổ chức giải chạy Marathon chuẩn AIMS',
        'Cung cấp mạng lưới trọng tài quốc tế',
        'Sản xuất video TVC và recap sự kiện 4K',
        'Truyền thông báo chí và booking KOLs thể thao',
      ],
    };
  }

  // Nhánh 2: Khủng hoảng truyền thông
  if (goalLower.includes('khủng hoảng') || goalLower.includes('rủi ro') || goalLower.includes('dư luận')) {
    return {
      recommendedPlan: 'Gói Trực Chiến Xử Lý Khủng Hoảng Truyền Thông 24/7',
      estimatedBudget: 'Báo giá theo mức độ vụ việc (Từ 30.000.000 VNĐ)',
      analysis: `Đối với yêu cầu ứng phó khủng hoảng và bảo vệ danh tiếng của ${industry}, tốc độ là yếu tố then chốt. S-Digital kích hoạt quy trình phản ứng nhanh trong 30 phút, kiểm soát luồng dư luận tiêu cực và kết nối với hơn 100 cơ quan báo chí chính thống để tái lập vị thế tin cậy cho thương hiệu.`,
      keyDeliverables: [
        'Kích hoạt đội phản ứng nhanh và rà soát nguồn phát tán trong 30 phút',
        'Xây dựng kịch bản phát ngôn chính thức và thông điệp định hướng dư luận',
        'Điều phối báo chí chính thống và mạng lưới 500+ KOLs cân bằng thông tin',
        'Thiết lập hệ thống lắng nghe mạng xã hội giám sát rủi ro liên tục 24/7',
      ],
      timeline: '1 - 2 tuần xử lý trực chiến',
      suggestedServices: [
        'Hệ thống Social Listening 24/7',
        'Quan hệ báo chí và xử lý truyền thông khủng hoảng',
        'Booking KOLs định hướng dư luận',
        'Phục hồi hình ảnh thương hiệu sau sự cố',
      ],
    };
  }

  // Nhánh 3: Ngân sách dưới 20 triệu -> Gói Cơ Bản (Starter)
  if (budget === '< 20tr' || budget.includes('dưới 20')) {
    return {
      recommendedPlan: 'Gói Cơ Bản (Starter)',
      estimatedBudget: 'Từ 15.000.000 VNĐ/tháng',
      analysis: `Với mức ngân sách khởi điểm dưới 20 triệu, Gói Cơ Bản (Starter) là phương án tối ưu để doanh nghiệp ngành ${industry} thiết lập nền tảng tiếp thị số vững chắc, thử nghiệm các kênh quảng cáo chuyển đổi chính yếu và tối ưu từng đồng chi phí.`,
      keyDeliverables: [
        'Thiết lập và tối ưu chiến dịch quảng cáo Google Ads hoặc Facebook Ads',
        'Sản xuất 12 bài viết chuẩn nội dung và thiết kế hình ảnh fanpage định kỳ',
        'Theo dõi số liệu chuyển đổi và gửi báo cáo đánh giá định kỳ hàng tháng',
        'Tư vấn định hướng chiến lược marketing 1-1 trực tiếp cùng chuyên viên',
      ],
      timeline: '2 - 3 tuần triển khai ban đầu',
      suggestedServices: [
        'Quảng cáo Google Search & Facebook Ads cơ bản',
        'Chăm sóc nội dung fanpage doanh nghiệp',
        'Tư vấn tối ưu trải nghiệm trang đích',
      ],
    };
  }

  // Nhánh 4: Ngân sách trên 100 triệu -> Gói Doanh Nghiệp (Enterprise)
  if (budget === '> 100tr' || budget.includes('trên 100')) {
    return {
      recommendedPlan: 'Gói Doanh Nghiệp Toàn Diện (Enterprise)',
      estimatedBudget: 'Từ 100.000.000 VNĐ/tháng (May đo riêng)',
      analysis: `Với nguồn lực đầu tư chiến lược trên 100 triệu, S-Digital đề xuất giải pháp Tiếp thị số Omni-channel kết hợp Định vị thương hiệu toàn diện cho ${industry}. Hệ sinh thái tích hợp từ quảng cáo tối ưu chuyển đổi quy mô lớn, sản xuất video 4K điện ảnh, booking mạng lưới KOLs độc quyền và bảo trợ truyền thông cấp cao.`,
      keyDeliverables: [
        'Kế hoạch tiếp thị tích hợp Omni-channel đa kênh phủ sóng toàn quốc',
        'Đội ngũ Dedicated Account Director và nhân sự chuyên môn phụ trách riêng',
        'Sản xuất TVC quảng cáo chất lượng 4K và chuỗi video viral định kỳ',
        'Mạng lưới booking 10-15 KOLs/KOCs đầu ngành và bảo trợ báo chí chính thống',
      ],
      timeline: '4 - 6 tuần setup và vận hành dài hạn',
      suggestedServices: [
        'Performance Marketing đa nền tảng tối ưu ROAS',
        'Sản xuất TVC điện ảnh và chuỗi Video Viral 4K',
        'Chiến dịch Influencer Marketing quy mô lớn',
        'Xử lý khủng hoảng truyền thông trực chiến 24/7',
      ],
    };
  }

  // Nhánh 5: Ngân sách 20-50tr hoặc 50-100tr (Mặc định tiêu chuẩn) -> Gói Chuyên Nghiệp (Growth)
  return {
    recommendedPlan: 'Gói Chuyên Nghiệp (Growth - Đề xuất tối ưu)',
    estimatedBudget: 'Từ 35.000.000 VNĐ/tháng',
    analysis: `Đối với mục tiêu ${goal} trong ngành ${industry} với ngân sách ${budget}, Gói Chuyên Nghiệp (Growth) mang lại tỷ suất hoàn vốn ROI cao nhất. Gói này kết hợp đồng thời quảng cáo chuyển đổi đa kênh (Meta, Google, TikTok), sản xuất video ngắn viral và tối ưu tỷ lệ chuyển đổi trên trang web.`,
    keyDeliverables: [
      'Tối ưu chiến dịch quảng cáo đa nền tảng (Google, Meta, TikTok) tối đa hóa ROAS',
      'Sản xuất 4 video ngắn chuẩn định dạng Reels/TikTok và 1 TVC ngắn hàng tháng',
      'Booking 3 - 5 KOLs/KOCs phù hợp với tệp khách hàng tiềm năng ngành hàng',
      'Tối ưu phễu chuyển đổi Landing Page và cung cấp Dashboard theo dõi realtime 24/7',
    ],
    timeline: '3 - 4 tuần triển khai',
    suggestedServices: [
      'Performance Marketing đa nền tảng',
      'Sản xuất Video Viral ngắn và TVC',
      'Influencer Marketing (KOL/KOC chuyên ngành)',
      'Tối ưu tỷ lệ chuyển đổi Landing Page (CRO)',
    ],
  };
}
