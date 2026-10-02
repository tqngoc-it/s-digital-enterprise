import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreatePartnerDto, UpdatePartnerDto } from './dto/partner.dto';

function normalizePartnerType(type?: string): 'CUSTOMER' | 'STRATEGIC_PARTNER' {
  if (!type) return 'CUSTOMER';
  const upper = type.toUpperCase().trim();
  if (upper === 'PARTNER' || upper === 'STRATEGIC_PARTNER') {
    return 'STRATEGIC_PARTNER';
  }
  return 'CUSTOMER';
}

@Injectable()
export class PartnersService {
  private readonly logger = new Logger(PartnersService.name);

  constructor(private readonly supabase: SupabaseService) {}

  async findAll(type?: string) {
    let query = this.supabase.client
      .from('partners')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false })
      .order('id', { ascending: true });

    if (type) {
      const normalizedType = normalizePartnerType(type);
      query = query.eq('type', normalizedType);
    }

    const { data, error } = await query;
    if (error) {
      this.logger.error(`[FIND_ALL_PARTNERS_ERROR]: ${error.message}`);
      throw new InternalServerErrorException('Lỗi khi lấy danh sách đối tác');
    }
    return data || [];
  }

  async findOne(id: string | number) {
    const { data, error } = await this.supabase.client
      .from('partners')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Không tìm thấy đối tác với ID: ${id}`);
    }
    return data;
  }

  async reorder(orderedIds: (string | number)[]) {
    if (!orderedIds || !orderedIds.length) {
      return { success: true };
    }
    const updatePromises = orderedIds.map((id, index) =>
      this.supabase.client
        .from('partners')
        .update({ display_order: index + 1 })
        .eq('id', id)
    );
    const results = await Promise.all(updatePromises);
    const hasError = results.some((r) => r.error);
    if (hasError) {
      this.logger.error('[REORDER_PARTNERS_ERROR]: Một số bản ghi không thể cập nhật');
      throw new InternalServerErrorException('Lỗi khi sắp xếp lại thứ tự đối tác');
    }
    return { success: true, message: 'Đã cập nhật thứ tự đối tác thành công' };
  }

  async create(dto: CreatePartnerDto) {
    const partnerType = normalizePartnerType(dto.type);

    let display_order = dto.display_order;
    if (display_order === undefined || display_order === null || Number(display_order) <= 0) {
      const { data: maxRow } = await this.supabase.client
        .from('partners')
        .select('display_order')
        .order('display_order', { ascending: false })
        .limit(1)
        .maybeSingle();
      display_order = (maxRow?.display_order ?? 0) + 1;
    }

    const { data, error } = await this.supabase.client
      .from('partners')
      .insert({
        name: dto.name,
        type: partnerType,
        industry: dto.industry || null,
        logo_url: dto.logo_url || null,
        website_url: dto.website_url || null,
        display_order,
      })
      .select()
      .single();

    if (error) {
      this.logger.error(`[CREATE_PARTNER_ERROR]: ${error.message}`);
      throw new InternalServerErrorException(error.message || 'Không thể tạo đối tác mới');
    }
    return { success: true, data };
  }

  async update(id: string | number, dto: UpdatePartnerDto) {
    const updatePayload: any = {};
    if (dto.name !== undefined) updatePayload.name = dto.name;
    if (dto.type !== undefined) updatePayload.type = normalizePartnerType(dto.type);
    if (dto.industry !== undefined) updatePayload.industry = dto.industry;
    if (dto.logo_url !== undefined) updatePayload.logo_url = dto.logo_url;
    if (dto.website_url !== undefined) updatePayload.website_url = dto.website_url;
    if (dto.display_order !== undefined) updatePayload.display_order = dto.display_order;

    const { data, error } = await this.supabase.client
      .from('partners')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      this.logger.error(`[UPDATE_PARTNER_ERROR]: ${error.message}`);
      throw new InternalServerErrorException(error.message || 'Không thể cập nhật đối tác');
    }
    return { success: true, data };
  }

  async remove(id: string | number) {
    // 1. Lấy thứ tự hiện tại của đối tác sắp xóa
    const { data: current } = await this.supabase.client
      .from('partners')
      .select('display_order')
      .eq('id', id)
      .maybeSingle();

    // 2. Xóa bản ghi
    const { error } = await this.supabase.client.from('partners').delete().eq('id', id);

    if (error) {
      this.logger.error(`[DELETE_PARTNER_ERROR]: ${error.message}`);
      throw new InternalServerErrorException('Không thể xóa đối tác');
    }

    // 3. Tự động dồn các bản ghi phía sau lên để giữ thứ tự liên tục (K -> K-1)
    if (current && typeof current.display_order === 'number') {
      const deletedOrder = current.display_order;
      const { data: remaining } = await this.supabase.client
        .from('partners')
        .select('id, display_order')
        .gt('display_order', deletedOrder)
        .order('display_order', { ascending: true });

      if (remaining && remaining.length > 0) {
        await Promise.all(
          remaining.map((item) =>
            this.supabase.client
              .from('partners')
              .update({ display_order: item.display_order - 1 })
              .eq('id', item.id)
          )
        );
      }
    }

    return { success: true };
  }
}
