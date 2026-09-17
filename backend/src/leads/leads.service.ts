import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { ScoreLeadDto, ScoreLeadResponse } from './dto/score-lead.dto';

function normalizeLead(lead: any) {
  if (!lead) return lead;
  let score = lead.ai_score;
  let estimatedValue = lead.ai_estimated_value;
  const tier = lead.ai_tier || lead.ai_priority || 'WARM';

  if (lead.admin_notes && typeof lead.admin_notes === 'string' && lead.admin_notes.includes('[AI_METRICS]')) {
    const scoreMatch = lead.admin_notes.match(/SCORE:(\d+)/);
    if (scoreMatch) score = parseInt(scoreMatch[1], 10);
    const valMatch = lead.admin_notes.match(/VALUE:([^|]+)/);
    if (valMatch) estimatedValue = valMatch[1].trim();
  }

  if (score === undefined && lead.ai_priority) {
    score = lead.ai_priority === 'HOT' ? 85 : lead.ai_priority === 'WARM' ? 65 : 35;
  }

  return {
    ...lead,
    ai_score: score,
    ai_tier: tier,
    ai_priority: tier,
    ai_action_plan: lead.ai_action_plan || lead.ai_sales_advice,
    ai_estimated_value: estimatedValue || lead.ai_estimated_value || 'Chưa xác định',
  };
}

@Injectable()
export class LeadsService {
  private readonly logger = new Logger(LeadsService.name);

  constructor(private readonly supabase: SupabaseService) {}

  /**
   * Luồng tự động hóa khi tiếp nhận Lead:
   * 1. Lưu lead vào bảng leads với trạng thái mặc định NEW ("Mới tiếp nhận")
   * 2. Tự động gọi Gemini AI (hoặc Smart Fallback) thẩm định điểm số ngay lập tức
   * 3. Cập nhật các trường ai_summary, ai_priority, ai_sales_advice và metrics vào DB
   * 4. Trả về Lead hoàn chỉnh đã có điểm thẩm định cho Client
   */
  async create(dto: CreateLeadDto) {
    try {
      const full_name = dto.name || dto.fullName || dto.full_name || 'Khách hàng';
      const email = dto.email;
      const phone = dto.phone || null;
      const company_name = dto.company || dto.company_name || null;
      const service = dto.service || 'Tư vấn chiến lược tổng thể';
      const budget = dto.budget || 'Chưa xác định';
      const message = dto.message || dto.notes || '';

      // Bước 1: Lưu lead vào bảng leads
      let leadData: any = null;
      const { data, error } = await this.supabase.client
        .from('leads')
        .insert({
          full_name,
          email,
          phone,
          company_name,
          message,
          status: 'NEW',
          source: 'Landing Page Form',
        })
        .select()
        .single();

      if (error) {
        this.logger.error(`[DB_ERROR]: ${error.message}`, error.details);
        throw new InternalServerErrorException('Lỗi khi lưu dữ liệu vào cơ sở dữ liệu');
      }
      leadData = data;

      this.logger.log(`Đã tiếp nhận Lead mới từ: ${email} (ID: ${leadData.id})`);

      // Bước 2: Tự động gọi thẩm định AI Lead Scoring
      const scoreResult = await this.scoreLead({
        name: full_name,
        email,
        phone: phone || '',
        company: company_name || '',
        service,
        budget,
        message,
      });

      // Bước 3: Cập nhật điểm số thẩm định vào DB tương thích schema hiện có
      try {
        const adminNotes = `[AI_METRICS] SCORE:${scoreResult.score}|TIER:${scoreResult.tier}|VALUE:${scoreResult.estimatedValue}`;
        const { data: updatedData } = await this.supabase.client
          .from('leads')
          .update({
            ai_summary: scoreResult.summary,
            ai_priority: scoreResult.tier,
            ai_sales_advice: scoreResult.actionPlan,
            ai_suggested_service: service,
            admin_notes: adminNotes,
          })
          .eq('id', leadData.id)
          .select()
          .single();

        if (updatedData) {
          leadData = updatedData;
        }
      } catch (e) {
        this.logger.warn(`Không thể cập nhật ai_score vào DB: ${e}`);
      }

      const normalized = normalizeLead({
        ...leadData,
        ai_score: scoreResult.score,
        ai_tier: scoreResult.tier,
        ai_summary: scoreResult.summary,
        ai_action_plan: scoreResult.actionPlan,
        ai_estimated_value: scoreResult.estimatedValue,
      });

      // Bước 4: Trả về kết quả hoàn chỉnh
      return { success: true, data: normalized };
    } catch (err) {
      if (err instanceof InternalServerErrorException) throw err;
      this.logger.error('[SERVER_ERROR]:', err);
      throw new InternalServerErrorException('Lỗi hệ thống máy chủ');
    }
  }

  async findAll() {
    const { data, error } = await this.supabase.client
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      this.logger.error(`[FIND_ALL_LEADS_ERROR]: ${error.message}`);
      throw new InternalServerErrorException(error.message);
    }
    return (data || []).map(normalizeLead);
  }

  async findOne(id: string) {
    const { data, error } = await this.supabase.client
      .from('leads')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Không tìm thấy lead với ID: ${id}`);
    }
    return normalizeLead(data);
  }

  async updateStatus(id: string, status: string) {
    const { data, error } = await this.supabase.client
      .from('leads')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      this.logger.error(`[UPDATE_STATUS_ERROR]: ${error.message}`);
      throw new InternalServerErrorException('Không thể cập nhật trạng thái Lead');
    }
    return { success: true, data: normalizeLead(data) };
  }

  async rescore(id: string) {
    const lead = await this.findOne(id);

    const scoreResult = await this.scoreLead({
      name: lead.full_name,
      email: lead.email,
      phone: lead.phone || '',
      company: lead.company_name || '',
      service: lead.service || lead.ai_suggested_service || 'Tư vấn giải pháp',
      budget: lead.budget || 'Chưa xác định',
      message: lead.message || lead.notes || '',
    });

    let updatedLead = lead;
    try {
      const adminNotes = `[AI_METRICS] SCORE:${scoreResult.score}|TIER:${scoreResult.tier}|VALUE:${scoreResult.estimatedValue}`;
      const { data, error } = await this.supabase.client
        .from('leads')
        .update({
          ai_summary: scoreResult.summary,
          ai_priority: scoreResult.tier,
          ai_sales_advice: scoreResult.actionPlan,
          admin_notes: adminNotes,
        })
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        updatedLead = data;
      }
    } catch {
      // Ignored
    }

    const normalized = normalizeLead({
      ...updatedLead,
      ai_score: scoreResult.score,
      ai_tier: scoreResult.tier,
      ai_summary: scoreResult.summary,
      ai_action_plan: scoreResult.actionPlan,
      ai_estimated_value: scoreResult.estimatedValue,
    });

    return {
      success: true,
      data: normalized,
      score: scoreResult.score,
      tier: scoreResult.tier,
      summary: scoreResult.summary,
      actionPlan: scoreResult.actionPlan,
      estimatedValue: scoreResult.estimatedValue,
    };
  }

  async remove(id: string) {
    const { error } = await this.supabase.client.from('leads').delete().eq('id', id);

    if (error) {
      this.logger.error(`[DELETE_LEAD_ERROR]: ${error.message}`);
      throw new InternalServerErrorException('Không thể xóa lead khỏi hệ thống');
    }
    return { success: true };
  }

  /**
   * Thẩm định và phân loại khách hàng tiềm năng bằng Google Gemini AI REST API
   * Kết hợp cơ chế Smart Fallback nội bộ đảm bảo sẵn sàng 100%
   */
  async scoreLead(dto: ScoreLeadDto) {
    const name = dto.name || dto.full_name || 'Khách hàng';
    const email = dto.email || '';
    const phone = dto.phone || '';
    const service = dto.service || 'Tư vấn chiến lược tổng thể';
    const budget = dto.budget || 'Chưa xác định';
    const message = dto.message || dto.notes || '';
    const company = dto.company || dto.company_name || '';

    const apiKey =
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (apiKey) {
      try {
        const geminiResult = await this.callGeminiScoreLead(apiKey, {
          name,
          email,
          phone,
          service,
          budget,
          message,
          company,
        });

        if (geminiResult) {
          this.logger.log(
            `[AI_SCORE_LEAD] Gemini thẩm định thành công: ${name} (${geminiResult.score}/100 - ${geminiResult.tier})`,
          );
          return {
            success: true,
            ...geminiResult,
            data: geminiResult,
            source: 'gemini',
          };
        }
      } catch (geminiError: any) {
        this.logger.warn(
          `[AI_SCORE_LEAD] Gemini API gặp lỗi hoặc timeout, kích hoạt Smart Fallback: ${
            geminiError?.message || geminiError
          }`,
        );
      }
    } else {
      this.logger.warn(
        '[AI_SCORE_LEAD] Chưa cấu hình GEMINI_API_KEY, tự động chuyển sang Smart Fallback',
      );
    }

    // Smart Fallback nội bộ dự phòng chuyên sâu khi không có API Key hoặc Gemini bận / lỗi
    const fallbackResult = this.computeSmartLeadScore({
      name,
      email,
      phone,
      service,
      budget,
      message,
      company,
    });

    this.logger.log(
      `[AI_SCORE_LEAD] Áp dụng Smart Fallback: ${name} (${fallbackResult.score}/100 - ${fallbackResult.tier})`,
    );

    return {
      success: true,
      ...fallbackResult,
      data: fallbackResult,
      source: 'smart-fallback',
    };
  }

  private async callGeminiScoreLead(
    apiKey: string,
    params: {
      name: string;
      email: string;
      phone: string;
      service: string;
      budget: string;
      message: string;
      company: string;
    },
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

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(30000),
      });

      if (!response.ok) {
        const errorBody = await response.text().catch(() => '');
        this.logger.warn(`[AI_SCORE_LEAD] Gemini API trả mã lỗi [${response.status}]: ${errorBody}`);
        return null;
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      return this.parseGeminiScoreResponse(rawText);
    } catch (err: any) {
      this.logger.warn(
        `[AI_SCORE_LEAD] Lỗi mạng hoặc timeout khi gọi Gemini API (Timeout 30s): ${err?.message || err}`,
      );
      return null;
    }
  }

  private parseGeminiScoreResponse(rawText?: string): ScoreLeadResponse | null {
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
  private computeSmartLeadScore(params: {
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
      summary = `Khách hàng tiềm năng cấp cao${
        hasCompany ? ` từ ${companyClean}` : ''
      }, có định hướng dịch vụ rõ ràng và ngân sách tương thích với các gói chiến lược trọng điểm của S-Digital. Mức độ sẵn sàng hợp tác rất cao.`;
      actionPlan =
        'Phân công Trưởng phòng Kinh doanh B2B gọi điện thoại trực tiếp trong vòng 15 phút. Gửi hồ sơ năng lực Credentials kèm Proposal giải pháp may đo và bảng dự toán chi tiết trong 2 giờ làm việc.';
    } else if (score >= 45) {
      tier = 'WARM';
      summary = `Khách hàng có nhu cầu hợp tác thực tế${
        hasCompany ? ` đại diện cho ${companyClean}` : ''
      }, thông tin cơ bản đầy đủ nhưng cần làm rõ thêm về KPI cụ thể và khung thời gian triển khai.`;
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
}