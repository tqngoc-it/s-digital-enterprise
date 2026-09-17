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

@Injectable()
export class PricingService {
  private readonly logger = new Logger(PricingService.name);

  constructor(private readonly supabase: SupabaseService) {}

  async findAll() {
    const { data, error } = await this.supabase.client
      .from('pricing_plans')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      this.logger.error(`[FIND_ALL_PRICING_ERROR]: ${error.message}`);
      throw new InternalServerErrorException('Lỗi khi lấy danh sách bảng giá');
    }
    return data || [];
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

  async create(dto: CreatePricingDto) {
    const features = normalizeFeatures(dto.features);

    const { data, error } = await this.supabase.client
      .from('pricing_plans')
      .insert({
        tier_name: dto.tier_name,
        target_audience: dto.target_audience || null,
        price_display: dto.price_display,
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
    const updatePayload: any = {};
    if (dto.tier_name !== undefined) updatePayload.tier_name = dto.tier_name;
    if (dto.target_audience !== undefined) updatePayload.target_audience = dto.target_audience;
    if (dto.price_display !== undefined) updatePayload.price_display = dto.price_display;
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
    const { error } = await this.supabase.client.from('pricing_plans').delete().eq('id', id);

    if (error) {
      this.logger.error(`[DELETE_PRICING_ERROR]: ${error.message}`);
      throw new InternalServerErrorException('Không thể xóa gói giá');
    }
    return { success: true };
  }
}
