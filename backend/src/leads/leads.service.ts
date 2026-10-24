import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { GeminiService } from '../gemini/gemini.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { ScoreLeadDto, ScoreLeadResponse } from './dto/score-lead.dto';

function normalizeLead(lead: any) {
  if (!lead) return lead;
  let score = lead.ai_score;
  let estimatedValue = lead.ai_estimated_value;
  const tier = lead.ai_tier || lead.ai_priority || 'WARM';

  let industry = lead.industry;
  let companySize = lead.company_size;
  let budget = lead.budget;
  let timeline = lead.timeline;

  if (lead.admin_notes && typeof lead.admin_notes === 'string') {
    if (lead.admin_notes.includes('[AI_METRICS]')) {
      const scoreMatch = lead.admin_notes.match(/SCORE:(\d+)/);
      if (scoreMatch) score = parseInt(scoreMatch[1], 10);
      const valMatch = lead.admin_notes.match(/VALUE:([^|\]]+?)(?:\s*\[|\s*\||$)/);
      if (valMatch) estimatedValue = valMatch[1].trim();
    }
    if (!industry) {
      const match = lead.admin_notes.match(/INDUSTRY:([^|\]]+?)(?:\s*\[|\s*\||$)/);
      if (match) industry = match[1].trim();
    }
    if (!companySize) {
      const match = lead.admin_notes.match(/SIZE:([^|\]]+?)(?:\s*\[|\s*\||$)/);
      if (match) companySize = match[1].trim();
    }
    if (!budget) {
      const match = lead.admin_notes.match(/BUDGET:([^|\]]+?)(?:\s*\[|\s*\||$)/);
      if (match) budget = match[1].trim();
    }
    if (!timeline) {
      const match = lead.admin_notes.match(/TIMELINE:([^|\]]+?)(?:\s*\[|\s*\||$)/);
      if (match) timeline = match[1].trim();
    }
  }

  if (estimatedValue) {
    const valTrim = String(estimatedValue).trim();
    if (valTrim.toLowerCase() === 'dưới' || valTrim === 'Dưới') {
      estimatedValue = 'Dưới 20 triệu VNĐ';
    }
  } else if (budget === 'under_20m') {
    estimatedValue = 'Dưới 20 triệu VNĐ';
  }

  if (score === undefined && lead.ai_priority) {
    score = lead.ai_priority === 'HOT' ? 85 : lead.ai_priority === 'WARM' ? 65 : 35;
  }

  return {
    ...lead,
    industry: industry || 'other',
    company_size: companySize || 'under_20',
    budget: budget || 'under_20m',
    timeline: timeline || 'exploring',
    ai_score: score,
    ai_tier: tier,
    ai_priority: tier,
    ai_action_plan: lead.ai_action_plan || lead.ai_sales_advice,
    ai_estimated_value: estimatedValue || lead.ai_estimated_value || 'Chưa xác định',
    ai_suggested_service: lead.ai_suggested_service || lead.service || 'Tư vấn chiến lược tổng thể',
  };
}

@Injectable()
export class LeadsService {
  private readonly logger = new Logger(LeadsService.name);

  constructor(
    private readonly supabase: SupabaseService,
    private readonly geminiService: GeminiService,
  ) {}

  /**
   * Luồng tự động hóa khi tiếp nhận Lead:
   * 1. Lưu lead vào bảng leads với trạng thái mặc định NEW ("Mới tiếp nhận") kèm 4 trường B2B
   * 2. Tự động gọi Gemini AI (hoặc Smart Fallback BANT) thẩm định điểm số ngay lập tức
   * 3. Cập nhật các trường ai_summary, ai_priority, ai_sales_advice và metrics vào DB
   * 4. Trả về Lead hoàn chỉnh đã có điểm thẩm định cho Client
   */
  async create(dto: CreateLeadDto) {
    try {
      const full_name = dto.name || dto.fullName || dto.full_name || 'Khách hàng';
      const email = dto.email?.trim();
      const phone = dto.phone ? dto.phone.trim().replace(/[\s.-]/g, '').replace(/^\+/, '') : null;
      const company_name = dto.company || dto.company_name || null;
      const service = dto.service || 'Tư vấn chiến lược tổng thể';
      const industry = dto.industry || 'other';
      const company_size = dto.company_size || 'under_20';
      const budget = dto.budget || 'under_20m';
      const timeline = dto.timeline || 'exploring';
      const message = dto.message || dto.notes || '';

      const basePayload: any = {
        full_name,
        email,
        phone,
        company_name,
        message,
        status: 'NEW',
        source: 'Landing Page Form',
      };

      // Bước 1: Lưu lead vào bảng leads (hỗ trợ cả schema có hoặc chưa có cột B2B mới)
      let leadData: any = null;
      const fullPayload = {
        ...basePayload,
        industry,
        company_size,
        budget,
        timeline,
      };

      const { data, error } = await this.supabase.client
        .from('leads')
        .insert(fullPayload)
        .select()
        .single();

      if (error) {
        this.logger.warn(`[DB_INSERT_WARN] Bảng leads chưa có cột B2B, lưu fallback metadata: ${error.message}`);
        const b2bNotes = `[B2B_DATA] INDUSTRY:${industry}|SIZE:${company_size}|BUDGET:${budget}|TIMELINE:${timeline}`;
        const { data: fallbackData, error: fallbackError } = await this.supabase.client
          .from('leads')
          .insert({
            ...basePayload,
            admin_notes: b2bNotes,
          })
          .select()
          .single();

        if (fallbackError) {
          this.logger.error(`[DB_ERROR]: ${fallbackError.message}`, fallbackError.details);
          throw new InternalServerErrorException('Lỗi khi lưu dữ liệu vào cơ sở dữ liệu');
        }
        leadData = fallbackData;
      } else {
        leadData = data;
      }

      this.logger.log(`Đã tiếp nhận Lead B2B mới từ: ${email} (ID: ${leadData.id}, Budget: ${budget}, Industry: ${industry})`);

      // Bước 2: Tự động gọi thẩm định AI Lead Scoring (BANT chuẩn)
      const scoreResult = await this.scoreLead({
        name: full_name,
        email,
        phone: phone || '',
        company: company_name || '',
        service,
        industry,
        company_size,
        budget,
        timeline,
        message,
      });

      // Bước 3: Cập nhật điểm số thẩm định vào DB
      try {
        const adminNotes = `[AI_METRICS] SCORE:${scoreResult.score}|TIER:${scoreResult.tier}|VALUE:${scoreResult.estimatedValue} [B2B_DATA] INDUSTRY:${industry}|SIZE:${company_size}|BUDGET:${budget}|TIMELINE:${timeline}`;
        const { data: updatedData } = await this.supabase.client
          .from('leads')
          .update({
            ai_summary: scoreResult.summary,
            ai_priority: scoreResult.tier,
            ai_sales_advice: scoreResult.actionPlan,
            ai_suggested_service: scoreResult.recommended_service || service,
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
        industry,
        company_size,
        budget,
        timeline,
        ai_score: scoreResult.score,
        ai_tier: scoreResult.tier,
        ai_summary: scoreResult.summary,
        ai_action_plan: scoreResult.actionPlan,
        ai_estimated_value: scoreResult.estimatedValue,
        ai_suggested_service: scoreResult.recommended_service || service,
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
      .order('created_at', { ascending: false })
      .order('id', { ascending: true });

    if (error) {
      this.logger.error(`[FIND_ALL_LEADS_ERROR]: ${error.message}`);
      throw new InternalServerErrorException(error.message);
    }

    const tierWeight: Record<string, number> = {
      HOT: 3,
      WARM: 2,
      COLD: 1,
    };

    const normalized = (data || []).map(normalizeLead);
    return normalized.sort((a: any, b: any) => {
      const weightA = tierWeight[a.ai_tier] || 0;
      const weightB = tierWeight[b.ai_tier] || 0;
      if (weightA !== weightB) return weightB - weightA;

      const scoreA = a.ai_score ?? 0;
      const scoreB = b.ai_score ?? 0;
      if (scoreA !== scoreB) return scoreB - scoreA;

      const timeA = new Date(a.created_at || 0).getTime();
      const timeB = new Date(b.created_at || 0).getTime();
      if (timeA !== timeB) return timeB - timeA;

      return String(a.id || '').localeCompare(String(b.id || ''));
    });
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
      industry: lead.industry || 'other',
      company_size: lead.company_size || 'under_20',
      budget: lead.budget || 'under_20m',
      timeline: lead.timeline || 'exploring',
      message: lead.message || lead.notes || '',
    });

    let updatedLead = lead;
    try {
      const adminNotes = `[AI_METRICS] SCORE:${scoreResult.score}|TIER:${scoreResult.tier}|VALUE:${scoreResult.estimatedValue} [B2B_DATA] INDUSTRY:${lead.industry || 'other'}|SIZE:${lead.company_size || 'under_20'}|BUDGET:${lead.budget || 'under_20m'}|TIMELINE:${lead.timeline || 'exploring'}`;
      const { data, error } = await this.supabase.client
        .from('leads')
        .update({
          ai_summary: scoreResult.summary,
          ai_priority: scoreResult.tier,
          ai_sales_advice: scoreResult.actionPlan,
          ai_suggested_service: scoreResult.recommended_service || lead.service,
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
      ai_suggested_service: scoreResult.recommended_service || lead.service,
    });

    return {
      success: true,
      data: normalized,
      score: scoreResult.score,
      tier: scoreResult.tier,
      summary: scoreResult.summary,
      recommended_service: scoreResult.recommended_service,
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
   * Kết hợp cơ chế Smart Fallback BANT nội bộ đảm bảo sẵn sàng 100%
   */
  async scoreLead(dto: ScoreLeadDto) {
    const name = dto.name || dto.full_name || 'Khách hàng';
    const email = dto.email || '';
    const phone = dto.phone || '';
    const service = dto.service || 'Tư vấn chiến lược tổng thể';
    const industry = dto.industry || 'other';
    const company_size = dto.company_size || 'under_20';
    const budget = dto.budget || 'under_20m';
    const timeline = dto.timeline || 'exploring';
    const message = dto.message || dto.notes || '';
    const company = dto.company || dto.company_name || '';

    try {
      const geminiResult = await this.callGeminiScoreLead({
        name,
        email,
        phone,
        service,
        industry,
        company_size,
        budget,
        timeline,
        message,
        company,
      });

      if (geminiResult) {
        this.logger.log(
          `[AI_SCORE_LEAD] Gemini (${geminiResult.source}) thẩm định BANT thành công: ${name} (${geminiResult.score}/100 - ${geminiResult.tier})`,
        );
        return {
          success: true,
          ...geminiResult,
          data: geminiResult,
          source: geminiResult.source || 'gemini',
        };
      }
    } catch (geminiError: any) {
      this.logger.warn(
        `[AI_SCORE_LEAD] Gemini API gặp sự cố, kích hoạt Smart Fallback BANT: ${
          geminiError?.message || geminiError
        }`,
      );
    }

    // Smart Fallback nội bộ dự phòng chuyên sâu khi không có API Key hoặc Gemini bận / lỗi
    const fallbackResult = this.computeSmartLeadScore({
      name,
      email,
      phone,
      service,
      industry,
      company_size,
      budget,
      timeline,
      message,
      company,
    });

    this.logger.log(
      `[AI_SCORE_LEAD] Áp dụng Smart Fallback BANT: ${name} (${fallbackResult.score}/100 - ${fallbackResult.tier})`,
    );

    return {
      success: true,
      ...fallbackResult,
      data: fallbackResult,
      source: 'smart-fallback',
    };
  }

  private async callGeminiScoreLead(params: {
    name: string;
    email: string;
    phone: string;
    service: string;
    industry?: string;
    company_size?: string;
    budget?: string;
    timeline?: string;
    message: string;
    company: string;
  }): Promise<(ScoreLeadResponse & { source?: string }) | null> {
    const INDUSTRY_LABELS: Record<string, string> = {
      sports_entertainment: 'Thể thao & Sự kiện',
      fnb: 'F&B (Ẩm thực & Đồ uống)',
      real_estate: 'Bất động sản',
      retail_ecommerce: 'Bán lẻ & E-commerce',
      tech_services: 'Công nghệ & Dịch vụ',
      other: 'Khác',
    };

    const COMPANY_SIZE_LABELS: Record<string, string> = {
      under_20: 'Dưới 20 nhân sự',
      '20_100': '20 - 100 nhân sự',
      above_100: 'Trên 100 nhân sự',
    };

    const BUDGET_LABELS: Record<string, string> = {
      under_20m: 'Dưới 20 triệu VNĐ',
      '20m_50m': '20 - 50 triệu VNĐ',
      '50m_100m': '50 - 100 triệu VNĐ',
      above_100m: 'Trên 100 triệu VNĐ',
    };

    const TIMELINE_LABELS: Record<string, string> = {
      urgent_this_month: 'Cần triển khai gấp trong tháng',
      next_1_3_months: 'Trong 1 - 3 tháng tới',
      exploring: 'Đang khảo sát ý tưởng',
    };

    const industryText = INDUSTRY_LABELS[params.industry || 'other'] || params.industry || 'Chưa cung cấp';
    const companySizeText = COMPANY_SIZE_LABELS[params.company_size || 'under_20'] || params.company_size || 'Chưa cung cấp';
    const budgetText = BUDGET_LABELS[params.budget || 'under_20m'] || params.budget || 'Chưa cung cấp';
    const timelineText = TIMELINE_LABELS[params.timeline || 'exploring'] || params.timeline || 'Chưa cung cấp';

    const systemPrompt = `
Bạn là Giám đốc Kinh doanh B2B cấp cao của S-Digital Media & Sports - tổ hợp Tiếp thị số & Giải pháp Thể thao hàng đầu Việt Nam.
Nhiệm vụ: Thẩm định chất lượng khách hàng tiềm năng (AI Lead Scoring) dựa trên khung tiêu chuẩn BANT (Budget, Authority, Need, Timeline).

TIÊU CHÍ ĐÁNH GIÁ (0 - 100) VÀ PHÂN LOẠI:
- HOT (80 - 100): Ngân sách > 50 triệu (50m_100m hoặc above_100m), có nhu cầu triển khai ngay trong tháng hoặc 1-3 tháng, quy mô rõ ràng. Phản hồi trong 15-30 phút.
- WARM (50 - 79): Có nhu cầu cụ thể nhưng ngân sách vừa phải (20-50 triệu) hoặc đang trong giai đoạn khảo sát 1-3 tháng. Phản hồi trong 2 giờ.
- COLD (< 50): Ngân sách dưới 20 triệu, lời nhắn spam/thiếu thông tin, hoặc chỉ đang khảo sát ý tưởng. Chăm sóc tự động qua email.

QUY TẮC BẮT BUỘC:
1. Tuyệt đối không dùng bất kỳ emoji hay icon robot nào.
2. Trả về đúng định dạng JSON thuần túy theo cấu trúc:
{
  "score": number,
  "tier": "HOT" | "WARM" | "COLD",
  "summary": string,
  "recommended_service": string,
  "actionPlan": string,
  "estimatedValue": string
}
`.trim();

    const userPrompt = `
Hồ sơ khách hàng tiềm năng B2B:
- Họ tên: ${params.name}
- Công ty: ${params.company || 'Chưa cung cấp'}
- Email: ${params.email || 'Chưa cung cấp'}
- SĐT: ${params.phone || 'Chưa cung cấp'}
- Ngành nghề: ${industryText}
- Quy mô nhân sự: ${companySizeText}
- Mức ngân sách dự kiến: ${budgetText}
- Thời hạn triển khai: ${timelineText}
- Dịch vụ quan tâm: ${params.service}
- Lời nhắn / Nhu cầu chi tiết: ${params.message || 'Không có'}

Hãy thẩm định khách hàng này theo khung tiêu chuẩn BANT và trả về JSON theo yêu cầu.
`.trim();

    const result = await this.geminiService.generateContent({
      systemInstruction: systemPrompt,
      prompt: userPrompt,
      temperature: 0.2,
      maxOutputTokens: 1024,
      responseMimeType: 'application/json',
      timeoutMs: 25000,
    });

    if (!result || !result.text) return null;

    try {
      const parsed = this.parseGeminiScoreResponse(result.text);
      if (!parsed) return null;

      return {
        ...parsed,
        source: result.model,
      };
    } catch (parseErr) {
      this.logger.warn(`[AI_SCORE_PARSE_WARN] Lỗi khi bóc tách JSON từ Gemini, kích hoạt fallback: ${parseErr}`);
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
        tier = score >= 80 ? 'HOT' : score >= 50 ? 'WARM' : 'COLD';
      }

      const recommendedService =
        parsed.recommended_service ||
        parsed.recommendedService ||
        parsed.suggested_service ||
        'Chiến lược tiếp thị số & Giải pháp thể thao tích hợp';

      if (parsed.summary) {
        let estVal = String(parsed.estimatedValue || 'Thỏa thuận theo phạm vi công việc').trim();
        if (estVal.toLowerCase() === 'dưới' || estVal === 'Dưới') {
          estVal = 'Dưới 20 triệu VNĐ';
        }
        return {
          score,
          tier,
          summary: String(parsed.summary).trim(),
          recommended_service: String(recommendedService).trim(),
          actionPlan: String(parsed.actionPlan || 'Tư vấn chuyên sâu 1:1 theo hồ sơ doanh nghiệp').trim(),
          estimatedValue: estVal,
        };
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Smart Fallback: Ma trận logic nội bộ dự phòng chuẩn BANT (Budget, Authority, Need, Timeline)
   */
  private computeSmartLeadScore(params: {
    name: string;
    email: string;
    phone: string;
    service: string;
    industry?: string;
    company_size?: string;
    budget?: string;
    timeline?: string;
    message: string;
    company: string;
  }): ScoreLeadResponse {
    let score = 20; // Điểm nền tảng
    const msgLower = (params.message || '').toLowerCase();
    const emailLower = (params.email || '').toLowerCase();
    const phoneClean = (params.phone || '').replace(/\s+/g, '');
    const companyClean = (params.company || '').trim();
    const budgetRaw = (params.budget || '').toLowerCase();
    const timelineRaw = (params.timeline || '').toLowerCase();
    const sizeRaw = (params.company_size || '').toLowerCase();
    const industryRaw = (params.industry || '').toLowerCase();

    // 1. Tiêu chí B (Budget - Ngân sách): Tối đa 40 điểm
    let estimatedValue = 'Dưới 20 triệu VNĐ';
    if (
      budgetRaw.includes('above_100m') ||
      budgetRaw.includes('> 100') ||
      budgetRaw.includes('trên 100') ||
      budgetRaw.includes('tỷ') ||
      budgetRaw.includes('500tr')
    ) {
      score += 40;
      estimatedValue = 'Trên 100 triệu VNĐ';
    } else if (
      budgetRaw.includes('50m_100m') ||
      budgetRaw.includes('50-100') ||
      budgetRaw.includes('50 - 100')
    ) {
      score += 30;
      estimatedValue = '50 - 100 triệu VNĐ';
    } else if (
      budgetRaw.includes('20m_50m') ||
      budgetRaw.includes('20-50') ||
      budgetRaw.includes('20 - 50')
    ) {
      score += 18;
      estimatedValue = '20 - 50 triệu VNĐ';
    } else {
      score += 5;
      estimatedValue = 'Dưới 20 triệu VNĐ';
    }

    // 2. Tiêu chí T (Timeline - Thời hạn triển khai): Tối đa 20 điểm
    if (timelineRaw.includes('urgent') || timelineRaw.includes('gấp') || timelineRaw.includes('month')) {
      score += 20;
    } else if (timelineRaw.includes('1_3') || timelineRaw.includes('1-3')) {
      score += 14;
    } else {
      score += 5; // exploring
    }

    // 3. Tiêu chí A (Authority / Quy mô doanh nghiệp): Tối đa 15 điểm
    if (sizeRaw.includes('above_100') || sizeRaw.includes('>100') || sizeRaw.includes('trên 100')) {
      score += 15;
    } else if (sizeRaw.includes('20_100') || sizeRaw.includes('20-100')) {
      score += 10;
    } else {
      score += 5;
    }

    // 4. Tiêu chí N (Need & Contact completeness): Tối đa 25 điểm
    const isCorporateEmail =
      emailLower.includes('@') &&
      !emailLower.endsWith('@gmail.com') &&
      !emailLower.endsWith('@yahoo.com') &&
      !emailLower.endsWith('@hotmail.com') &&
      !emailLower.endsWith('@outlook.com');

    if (isCorporateEmail) score += 8;
    else if (emailLower.includes('@')) score += 4;

    const hasValidPhone = /^[0-9+]{9,13}$/.test(phoneClean);
    if (hasValidPhone) score += 6;

    const hasCompany = companyClean.length > 2;
    if (hasCompany) score += 6;

    if (msgLower.length > 40) score += 5;

    // Giới hạn điểm chuẩn từ 20 đến 98
    score = Math.max(20, Math.min(98, score));

    // Phân tầng chuẩn BANT
    let tier: 'HOT' | 'WARM' | 'COLD' = 'WARM';
    let summary = '';
    let actionPlan = '';

    if (score >= 80) {
      tier = 'HOT';
      summary = `Khách hàng B2B tiềm năng cao${hasCompany ? ` từ ${companyClean}` : ''}. Ngân sách đầu tư lớn, thời gian triển khai cấp bách và định hướng dịch vụ rõ ràng theo chuẩn BANT.`;
      actionPlan =
        'Trưởng phòng Kinh doanh B2B liên hệ trực tiếp trong 15-30 phút. Hoàn thiện Proposal chiến lược và báo giá chi tiết gửi trong 2 giờ làm việc.';
    } else if (score >= 50) {
      tier = 'WARM';
      summary = `Khách hàng tiềm năng${hasCompany ? ` đại diện cho ${companyClean}` : ''}. Nhu cầu thực tế với ngân sách phù hợp, đang cân nhắc lộ trình triển khai trong 1-3 tháng.`;
      actionPlan =
        'Chuyên viên tư vấn liên hệ trong vòng 2 giờ làm việc. Gửi Case Studies tương tự và hẹn lịch họp tư vấn giải pháp 1:1.';
    } else {
      tier = 'COLD';
      summary =
        'Khách hàng đang trong giai đoạn khảo sát ý tưởng hoặc ngân sách ban đầu khiêm tốn. Cần nuôi dưỡng nhận thức thêm.';
      actionPlan =
        'Gửi email tự động kèm tài liệu giải pháp và biểu phí tham khảo. Chăm sóc định kỳ qua luồng Email Marketing.';
    }

    // Gợi ý dịch vụ thông minh theo ngành nghề
    let recommended_service = 'Tư vấn chiến lược Digital Marketing tổng thể';
    if (industryRaw.includes('sports')) {
      recommended_service = 'Tổ chức giải đấu & Tài trợ thể thao chuyên nghiệp';
    } else if (industryRaw.includes('fnb') || industryRaw.includes('retail')) {
      recommended_service = 'Digital Performance Ads (Meta/TikTok/Google) & Booking KOLs';
    } else if (industryRaw.includes('real_estate')) {
      recommended_service = 'Chiến dịch Performance Mở bán Bất Động Sản & TVC Viral';
    } else if (industryRaw.includes('tech')) {
      recommended_service = 'Tư vấn Chuyển đổi số & Tăng trưởng B2B Lead Generation';
    }

    return {
      score,
      tier,
      summary,
      recommended_service,
      actionPlan,
      estimatedValue,
    };
  }
}