import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateServiceDto, UpdateServiceDto } from './dto/service.dto';

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

function normalizeBulletPoints(raw: any): string[] {
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
export class ServicesService {
  private readonly logger = new Logger(ServicesService.name);

  constructor(private readonly supabase: SupabaseService) {}

  async findAll(category?: string) {
    let query = this.supabase.client
      .from('services')
      .select('*')
      .order('display_order', { ascending: true });

    if (category) {
      query = query.eq('category', category.toUpperCase());
    }

    const { data, error } = await query;
    if (error) {
      this.logger.error(`[FIND_ALL_SERVICES_ERROR]: ${error.message}`);
      throw new InternalServerErrorException('Lỗi khi lấy danh sách dịch vụ');
    }
    return data || [];
  }

  async findOne(id: string) {
    const { data, error } = await this.supabase.client
      .from('services')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Không tìm thấy dịch vụ với ID: ${id}`);
    }
    return data;
  }

  async create(dto: CreateServiceDto) {
    const slug = dto.slug || generateSlug(dto.title);
    const bullet_points = normalizeBulletPoints(dto.bullet_points);
    const category = dto.category === 'SPORTS' ? 'SPORTS' : 'DIGITAL';
    const display_order = dto.display_order ?? 0;
    const is_active = dto.is_active !== undefined ? dto.is_active : true;

    const { data, error } = await this.supabase.client
      .from('services')
      .insert({
        title: dto.title,
        slug,
        sub_title: dto.sub_title || null,
        short_description: dto.short_description || null,
        bullet_points,
        category,
        display_order,
        icon_name: dto.icon_name || null,
        thumbnail_url: dto.thumbnail_url || null,
        is_active,
      })
      .select()
      .single();

    if (error) {
      this.logger.error(`[CREATE_SERVICE_ERROR]: ${error.message}`);
      throw new InternalServerErrorException(error.message || 'Không thể tạo dịch vụ mới');
    }
    return { success: true, data };
  }

  async update(id: string, dto: UpdateServiceDto) {
    const updatePayload: any = {};
    if (dto.title !== undefined) {
      updatePayload.title = dto.title;
      if (!dto.slug) updatePayload.slug = generateSlug(dto.title);
    }
    if (dto.slug !== undefined) updatePayload.slug = dto.slug;
    if (dto.sub_title !== undefined) updatePayload.sub_title = dto.sub_title;
    if (dto.short_description !== undefined) updatePayload.short_description = dto.short_description;
    if (dto.bullet_points !== undefined) {
      updatePayload.bullet_points = normalizeBulletPoints(dto.bullet_points);
    }
    if (dto.category !== undefined) {
      updatePayload.category = dto.category === 'SPORTS' ? 'SPORTS' : 'DIGITAL';
    }
    if (dto.display_order !== undefined) updatePayload.display_order = dto.display_order;
    if (dto.icon_name !== undefined) updatePayload.icon_name = dto.icon_name;
    if (dto.thumbnail_url !== undefined) updatePayload.thumbnail_url = dto.thumbnail_url;
    if (dto.is_active !== undefined) updatePayload.is_active = dto.is_active;

    const { data, error } = await this.supabase.client
      .from('services')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      this.logger.error(`[UPDATE_SERVICE_ERROR]: ${error.message}`);
      throw new InternalServerErrorException(error.message || 'Không thể cập nhật dịch vụ');
    }
    return { success: true, data };
  }

  async remove(id: string) {
    const { error } = await this.supabase.client.from('services').delete().eq('id', id);

    if (error) {
      this.logger.error(`[DELETE_SERVICE_ERROR]: ${error.message}`);
      throw new InternalServerErrorException('Không thể xóa dịch vụ');
    }
    return { success: true };
  }
}
