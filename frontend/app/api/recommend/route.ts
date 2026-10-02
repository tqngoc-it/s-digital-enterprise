import { NextRequest, NextResponse } from 'next/server';
import { callGeminiFailover } from '@/lib/ai/geminiEngine';

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
    const payload: RecommendRequest = {
      industry: body.industry || 'Doanh nghiệp chung',
      goal: body.goal || 'Tăng trưởng doanh số',
      budget: body.budget || '20-50tr',
      note: body.note || '',
    };

    // 1. Gọi Gemini Failover Engine tập trung (gemini-3.5-flash-lite -> gemini-3.1-flash-lite)
    const geminiResult = await callGeminiRecommendation(payload);
    if (geminiResult) {
      return NextResponse.json({
        success: true,
        data: geminiResult.data,
        source: geminiResult.model,
      });
    }

    // 2. Dự phòng an toàn: Trả về bản phân tích định hướng cơ bản theo gói dịch vụ phổ biến nhất
    const fallbackData = computeSmartFallback(payload);
    return NextResponse.json({
      success: true,
      data: fallbackData,
      source: 'smart-fallback',
    });
  } catch (error: any) {
    console.warn('[RECOMMEND_API] Xử lý sự cố với fallback an toàn:', error?.message || error);
    const safeData = computeSmartFallback({
      industry: 'Doanh nghiệp',
      goal: 'Tăng doanh số',
      budget: '20-50tr',
      note: '',
    });
    return NextResponse.json({
      success: true,
      data: safeData,
      source: 'safe-fallback',
    });
  }
}

/**
 * Gọi Gemini Failover Engine với prompt phân tích nhu cầu và bóc tách gói dịch vụ
 * generationConfig: { temperature: 0.3, maxOutputTokens: 800, responseMimeType: "application/json" }
 */
async function callGeminiRecommendation(
  params: RecommendRequest
): Promise<{ data: RecommendationResult; model: string } | null> {
  const systemInstruction = `
Bạn là Chuyên gia Hoạch định Chiến lược Cấp cao của S-Digital Media & Sports.
Nhiệm vụ của bạn: Bóc tách mục tiêu kinh doanh (Tăng nhận diện thương hiệu, Tăng trưởng doanh số, Tổ chức giải chạy Marathon, Mạng lưới trọng tài, Xử lý khủng hoảng...) và đề xuất gói dịch vụ phù hợp nhất từ hệ sinh thái S-Digital.

DỮ LIỆU DỊCH VỤ VÀ BẢNG GIÁ THỰC TẾ S-DIGITAL:
- Gói Cơ Bản (Starter): Từ 15.000.000 VNĐ/tháng. Phù hợp cho ngân sách dưới 20 triệu, SME & Startup. Chạy Google/Facebook Ads cơ bản, 12 bài viết fanpage, báo cáo tháng.
- Gói Chuyên Nghiệp (Growth - Phổ biến nhất): Từ 35.000.000 VNĐ/tháng. Phù hợp cho ngân sách 20 - 50 triệu và 50 - 100 triệu. Tối ưu đa kênh Meta, Google, TikTok Ads; sản xuất 4 video ngắn + TVC; booking 3-5 KOLs/KOCs; tối ưu SEO và Landing Page; Dashboard realtime 24/7.
- Gói Doanh Nghiệp (Enterprise): May đo riêng (thường > 100 triệu). Trọn gói Omni-channel, chiến lược thương hiệu độc quyền, dedicated account team.
- Dịch vụ Giải pháp Thể thao: Tổ chức giải chạy Marathon (chuẩn quốc tế AIMS, hệ thống chip timing điện tử), giải bóng đá doanh nghiệp, đại hội thể thao đa môn, cung cấp 100+ trọng tài quốc tế AFC/FIBA, học viện thể thao.
- Dịch vụ Xử lý Khủng hoảng Truyền thông 24/7: Phản ứng nhanh trong 30 phút, bảo vệ danh tiếng thương hiệu an toàn tuyệt đối.

QUY TẮC BẮT BUỘC:
1. TUYỆT ĐỐI KHÔNG SỬ DỤNG BẤT KỲ EMOJI NÀO TRONG VĂN BẢN TRẢ VỀ.
2. Trả về đúng định dạng JSON thuần túy theo cấu trúc:
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

  const result = await callGeminiFailover({
    systemInstruction,
    prompt: userPrompt,
    temperature: 0.3,
    maxOutputTokens: 800,
    responseMimeType: 'application/json',
    timeoutMs: 25000,
  });

  if (!result || !result.text) return null;

  const parsed = parseJsonResult(result.text);
  if (!parsed) return null;

  return {
    data: parsed,
    model: result.model,
  };
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
 * Ma trận logic định sẵn để fallback chuẩn xác theo gói phổ biến nhất
 */
function computeSmartFallback(
  industryOrPayload: string | RecommendRequest,
  goalParam?: string,
  budgetParam?: string,
  noteParam?: string
): RecommendationResult {
  let industry = 'Doanh nghiệp chung';
  let goal = 'Tăng trưởng doanh số';
  let budget = '20-50tr';
  let note = '';

  if (typeof industryOrPayload === 'object' && industryOrPayload !== null) {
    industry = industryOrPayload.industry || industry;
    goal = industryOrPayload.goal || goal;
    budget = industryOrPayload.budget || budget;
    note = industryOrPayload.note || note;
  } else {
    industry = industryOrPayload || industry;
    goal = goalParam || goal;
    budget = budgetParam || budget;
    note = noteParam || note;
  }
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

  // Nhánh 5: Mặc định theo Gói Phổ Biến Nhất -> Gói Chuyên Nghiệp (Growth)
  return {
    recommendedPlan: 'Gói Chuyên Nghiệp (Growth - Đề xuất phổ biến nhất)',
    estimatedBudget: 'Từ 35.000.000 VNĐ/tháng',
    analysis: `Đối với mục tiêu ${goal} trong ngành ${industry} với ngân sách ${budget}, Gói Chuyên Nghiệp (Growth) là gói dịch vụ phổ biến nhất mang lại tỷ suất hoàn vốn ROI cao nhất. Gói này kết hợp đồng thời quảng cáo chuyển đổi đa kênh (Meta, Google, TikTok), sản xuất video ngắn viral và tối ưu tỷ lệ chuyển đổi trên trang web.`,
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
