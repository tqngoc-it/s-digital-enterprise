import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreatePricingDto, UpdatePricingDto } from './dto/pricing.dto';

function normalizeFeatures(raw: any): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map((i) => String(i).trim()).filter(Boolean);
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map((i) => String(i).trim()).filter(Boolean);
    } catch {
      return raw.split('\n').map((i) => i.trim()).filter(Boolean);
    }
  }
  return [];
}

export function extractNumericPrice(input?: string): number {
  if (!input) return 0;
  const raw = input.toLowerCase().trim();
  if (
    raw.includes('liên hệ') ||
    raw.includes('thỏa thuận') ||
    raw.includes('custom') ||
    raw.includes('enterprise')
  ) {
    return Number.MAX_SAFE_INTEGER;
  }

  // Tỷ (billions)
  const tyMatch = raw.match(/([\d.,]+)\s*(tỷ|ty|billion)/i);
  if (tyMatch) {
    const val = parseFloat(tyMatch[1].replace(/,/g, '.'));
    if (!isNaN(val)) return Math.round(val * 1_000_000_000);
  }

  // Triệu / tr / m (millions)
  const trMatch = raw.match(/([\d.,]+)\s*(triệu|trieu|tr|m)/i);
  if (trMatch) {
    const val = parseFloat(trMatch[1].replace(/,/g, '.'));
    if (!isNaN(val)) return Math.round(val * 1_000_000);
  }

  // Raw digits
  const cleanDigits = raw.replace(/[^\d]/g, '');
  if (cleanDigits) {
    const num = parseInt(cleanDigits, 10);
    if (!isNaN(num)) {
      if (num < 1000 && (raw.includes('tr') || raw.includes('triệu'))) {
        return num * 1_000_000;
      }
      return num;
    }
  }

  return Number.MAX_SAFE_INTEGER;
}

export function formatVietnamesePriceDisplay(rawInput: string): string {
  if (!rawInput) return 'Liên hệ báo giá';
  const trimmed = rawInput.trim();
  const lower = trimmed.toLowerCase();

  if (
    lower.includes('liên hệ') ||
    lower.includes('thỏa thuận') ||
    lower.includes('enterprise')
  ) {
    return 'Liên Hệ Báo Giá';
  }

  if (lower.startsWith('từ ') && (lower.includes('/tháng') || lower.includes('/năm'))) {
    return trimmed;
  }

  const trMatch = lower.match(/^(\d+(?:[.,]\d+)?)\s*(?:tr|triệu|trieu)?$/i);
  if (trMatch) {
    const numStr = trMatch[1].replace(',', '.');
    return `Từ ${numStr} Triệu/tháng`;
  }

  const trMonthMatch = lower.match(
    /^(\d+(?:[.,]\d+)?)\s*(?:tr|triệu|trieu)\s*\/\s*(?:tháng|thang|m)$/i,
  );
  if (trMonthMatch) {
    const numStr = trMonthMatch[1].replace(',', '.');
    return `Từ ${numStr} Triệu/tháng`;
  }

  return trimmed;
}

@Injectable()
export class PricingService {
  private readonly logger = new Logger(PricingService.name);

  constructor(private readonly supabase: SupabaseService) {}

  async findAll() {
    const { data, error } = await this.supabase.client
      .from('pricing_plans')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: true })
      .order('id', { ascending: true });

    if (error) {
      this.logger.error(`[FIND_ALL_PRICING_ERROR]: ${error.message}`);
      throw new InternalServerErrorException('Lỗi khi lấy danh sách bảng giá');
    }

    const plans = data || [];
    // Tie-breaker & price-based sorting
    return plans.sort((a: any, b: any) => {
      const orderA = a.display_order ?? 0;
      const orderB = b.display_order ?? 0;
      if (orderA !== orderB) return orderA - orderB;

      const priceA = extractNumericPrice(a.price_display);
      const priceB = extractNumericPrice(b.price_display);
      if (priceA !== priceB) return priceA - priceB;

      return String(a.id || '').localeCompare(String(b.id || ''));
    });
  }

  async findOne(id: string | number) {
    const { data, error } = await this.supabase.client
      .from('pricing_plans')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Không tìm thấy gói giá với ID: ${id}`);
    }
    return data;
  }

  async reorder(orderedIds: (string | number)[]) {
    if (!orderedIds || !orderedIds.length) {
      return { success: true };
    }
    const updatePromises = orderedIds.map((id, index) =>
      this.supabase.client
        .from('pricing_plans')
        .update({ display_order: index + 1 })
        .eq('id', id)
    );
    const results = await Promise.all(updatePromises);
    const hasError = results.some((r) => r.error);
    if (hasError) {
      this.logger.error('[REORDER_PRICING_ERROR]: Một số bản ghi không thể cập nhật');
      throw new InternalServerErrorException('Lỗi khi sắp xếp lại thứ tự bảng giá');
    }
    return { success: true, message: 'Đã cập nhật thứ tự bảng giá thành công' };
  }

  async create(dto: CreatePricingDto) {
    const features = normalizeFeatures(dto.features);
    const price_display = formatVietnamesePriceDisplay(dto.price_display);

    let display_order = dto.display_order;
    if (display_order === undefined || display_order === null || Number(display_order) <= 0) {
      const { data: maxRow } = await this.supabase.client
        .from('pricing_plans')
        .select('display_order')
        .order('display_order', { ascending: false })
        .limit(1)
        .maybeSingle();
      display_order = (maxRow?.display_order ?? 0) + 1;
    }

    const is_popular = dto.is_popular === true || String(dto.is_popular) === 'true';

    // Đảm bảo tính độc quyền của "Gói phổ biến nhất": nếu gói mới là true, reset các gói khác về false
    if (is_popular) {
      const { error: resetError } = await this.supabase.client
        .from('pricing_plans')
        .update({ is_popular: false })
        .eq('is_popular', true);

      if (resetError) {
        this.logger.warn(`[RESET_POPULAR_PRICING_WARN]: ${resetError.message}`);
      }
    }

    const { data, error } = await this.supabase.client
      .from('pricing_plans')
      .insert({
        tier_name: dto.tier_name,
        target_audience: dto.target_audience || null,
        price_display,
        display_order,
        is_popular,
        features,
      })
      .select()
      .single();

    if (error) {
      this.logger.error(`[CREATE_PRICING_ERROR]: ${error.message}`);
      throw new InternalServerErrorException(error.message || 'Không thể tạo gói giá mới');
    }
    return { success: true, data };
  }

  async update(id: string | number, dto: UpdatePricingDto) {
    const isPopularRequested = dto.is_popular === true || String(dto.is_popular) === 'true';

    // Đảm bảo tính độc quyền: nếu bật is_popular = true cho gói này,
    // tự động cập nhật tất cả các bản ghi khác trong bảng pricing thành is_popular = false
    if (isPopularRequested) {
      const { error: resetError } = await this.supabase.client
        .from('pricing_plans')
        .update({ is_popular: false })
        .eq('is_popular', true)
        .neq('id', id);

      if (resetError) {
        this.logger.warn(`[RESET_POPULAR_PRICING_WARN]: ${resetError.message}`);
      }
    }

    const updatePayload: any = {};
    if (dto.tier_name !== undefined) updatePayload.tier_name = dto.tier_name;
    if (dto.target_audience !== undefined) updatePayload.target_audience = dto.target_audience;
    if (dto.price_display !== undefined) {
      updatePayload.price_display = formatVietnamesePriceDisplay(dto.price_display);
    }
    if (dto.display_order !== undefined) updatePayload.display_order = dto.display_order;
    if (dto.is_popular !== undefined) updatePayload.is_popular = isPopularRequested;
    if (dto.features !== undefined) {
      updatePayload.features = normalizeFeatures(dto.features);
    }

    const { data, error } = await this.supabase.client
      .from('pricing_plans')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      this.logger.error(`[UPDATE_PRICING_ERROR]: ${error.message}`);
      throw new InternalServerErrorException(error.message || 'Không thể cập nhật gói giá');
    }
    return { success: true, data };
  }

  async remove(id: string | number) {
    // 1. Lấy thứ tự hiện tại của mục sắp xóa
    const { data: current } = await this.supabase.client
      .from('pricing_plans')
      .select('display_order')
      .eq('id', id)
      .maybeSingle();

    // 2. Xóa bản ghi
    const { error } = await this.supabase.client.from('pricing_plans').delete().eq('id', id);

    if (error) {
      this.logger.error(`[DELETE_PRICING_ERROR]: ${error.message}`);
      throw new InternalServerErrorException('Không thể xóa gói giá');
    }

    // 3. Tự động dồn các bản ghi phía sau lên để giữ thứ tự liên tục (K -> K-1)
    if (current && typeof current.display_order === 'number') {
      const deletedOrder = current.display_order;
      const { data: remaining } = await this.supabase.client
        .from('pricing_plans')
        .select('id, display_order')
        .gt('display_order', deletedOrder)
        .order('display_order', { ascending: true });

      if (remaining && remaining.length > 0) {
        await Promise.all(
          remaining.map((item) =>
            this.supabase.client
              .from('pricing_plans')
              .update({ display_order: item.display_order - 1 })
              .eq('id', item.id)
          )
        );
      }
    }

    return { success: true };
  }
}

