import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateCaseStudyDto, UpdateCaseStudyDto } from './dto/case-study.dto';

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

@Injectable()
export class CaseStudiesService {
  private readonly logger = new Logger(CaseStudiesService.name);

  constructor(private readonly supabase: SupabaseService) {}

  async findAll() {
    const { data, error } = await this.supabase.client
      .from('case_studies')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      this.logger.error(`[FIND_ALL_CASE_STUDIES_ERROR]: ${error.message}`);
      throw new InternalServerErrorException('Lỗi khi lấy danh sách Case Studies');
    }
    return data || [];
  }

  async findOne(id: string | number) {
    const { data, error } = await this.supabase.client
      .from('case_studies')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Không tìm thấy Case Study với ID: ${id}`);
    }
    return data;
  }

  async create(dto: CreateCaseStudyDto) {
    const slug = dto.slug || generateSlug(dto.title);
    const results =
      dto.results || {
        athletes: '5.2K VĐV',
        articles: '50+ Bài Báo',
        views: '2M Lượt Xem',
      };

    const { data, error } = await this.supabase.client
      .from('case_studies')
      .insert({
        title: dto.title,
        slug,
        client_name: dto.client_name,
        challenge: dto.challenge || null,
        solution: dto.solution || null,
        results,
        is_featured: dto.is_featured ?? false,
      })
      .select()
      .single();

    if (error) {
      this.logger.error(`[CREATE_CASE_STUDY_ERROR]: ${error.message}`);
      throw new InternalServerErrorException(error.message || 'Không thể tạo Case Study mới');
    }
    return { success: true, data };
  }

  async update(id: string | number, dto: UpdateCaseStudyDto) {
    const updatePayload: any = {};
    if (dto.title !== undefined) {
      updatePayload.title = dto.title;
      if (!dto.slug) updatePayload.slug = generateSlug(dto.title);
    }
    if (dto.client_name !== undefined) updatePayload.client_name = dto.client_name;
    if (dto.slug !== undefined) updatePayload.slug = dto.slug;
    if (dto.challenge !== undefined) updatePayload.challenge = dto.challenge;
    if (dto.solution !== undefined) updatePayload.solution = dto.solution;
    if (dto.results !== undefined) updatePayload.results = dto.results;
    if (dto.is_featured !== undefined) updatePayload.is_featured = dto.is_featured;

    const { data, error } = await this.supabase.client
      .from('case_studies')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      this.logger.error(`[UPDATE_CASE_STUDY_ERROR]: ${error.message}`);
      throw new InternalServerErrorException(error.message || 'Không thể cập nhật Case Study');
    }
    return { success: true, data };
  }

  async remove(id: string | number) {
    const { error } = await this.supabase.client.from('case_studies').delete().eq('id', id);

    if (error) {
      this.logger.error(`[DELETE_CASE_STUDY_ERROR]: ${error.message}`);
      throw new InternalServerErrorException('Không thể xóa Case Study');
    }
    return { success: true };
  }
}
