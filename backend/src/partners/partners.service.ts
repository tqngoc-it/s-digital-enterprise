import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreatePartnerDto, UpdatePartnerDto } from './dto/partner.dto';

@Injectable()
export class PartnersService {
  private readonly logger = new Logger(PartnersService.name);

  constructor(private readonly supabase: SupabaseService) {}

  async findAll(type?: string) {
    let query = this.supabase.client
      .from('partners')
      .select('*')
      .order('display_order', { ascending: true });

    if (type) {
      query = query.eq('type', type.toUpperCase());
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

  async create(dto: CreatePartnerDto) {
    const { data, error } = await this.supabase.client
      .from('partners')
      .insert({
        name: dto.name,
        type: dto.type || 'CUSTOMER',
        industry: dto.industry || null,
        logo_url: dto.logo_url || null,
        website_url: dto.website_url || null,
        display_order: dto.display_order ?? 0,
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
    if (dto.type !== undefined) updatePayload.type = dto.type;
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
    const { error } = await this.supabase.client.from('partners').delete().eq('id', id);

    if (error) {
      this.logger.error(`[DELETE_PARTNER_ERROR]: ${error.message}`);
      throw new InternalServerErrorException('Không thể xóa đối tác');
    }
    return { success: true };
  }
}
