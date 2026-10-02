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

  async findAll(featuredOnly?: boolean) {
    let query = this.supabase.client
      .from('case_studies')
      .select('*')
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })
      .order('id', { ascending: true });

    if (featuredOnly) {
      query = query.eq('is_featured', true);
    }

    const { data, error } = await query;

    if (error) {
      this.logger.error(`[FIND_ALL_CASE_STUDIES_ERROR]: ${error.message}`);
      throw new InternalServerErrorException('Lỗi khi lấy danh sách Case Studies');
    }

    const studies = (data || []).map((s: any, idx: number) => ({
      ...s,
      display_order: s.results?.display_order ?? idx + 1,
    }));

    // Sắp xếp theo is_featured DESC, display_order ASC, created_at DESC
    return studies.sort((a: any, b: any) => {
      const featA = a.is_featured ? 1 : 0;
      const featB = b.is_featured ? 1 : 0;
      if (featB !== featA) return featB - featA;

      const orderA = a.display_order ?? Number.MAX_SAFE_INTEGER;
      const orderB = b.display_order ?? Number.MAX_SAFE_INTEGER;
      if (orderA !== orderB) return orderA - orderB;

      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    });
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
    return {
      ...data,
      display_order: data.results?.display_order ?? 1,
    };
  }

  async reorder(orderedIds: (string | number)[]) {
    if (!orderedIds || !orderedIds.length) {
      return { success: true };
    }

    const { data: allStudies, error: fetchErr } = await this.supabase.client
      .from('case_studies')
      .select('id, results')
      .in('id', orderedIds);

    if (fetchErr) {
      this.logger.error(`[REORDER_FETCH_CASE_STUDIES_ERROR]: ${fetchErr.message}`);
      throw new InternalServerErrorException('Lỗi khi tải dữ liệu case studies');
    }

    const map = new Map((allStudies || []).map((s) => [String(s.id), s.results || {}]));

    const updatePromises = orderedIds.map((id, index) => {
      const existingResults = map.get(String(id)) || {};
      return this.supabase.client
        .from('case_studies')
        .update({
          results: {
            ...existingResults,
            display_order: index + 1,
          },
        })
        .eq('id', id);
    });

    const results = await Promise.all(updatePromises);
    const hasError = results.some((r) => r.error);
    if (hasError) {
      this.logger.error('[REORDER_CASE_STUDIES_ERROR]: Một số bản ghi không thể cập nhật');
      throw new InternalServerErrorException('Lỗi khi sắp xếp lại thứ tự case studies');
    }
    return { success: true, message: 'Đã cập nhật thứ tự case studies thành công' };
  }

  async create(dto: CreateCaseStudyDto) {
    const slug = dto.slug || generateSlug(dto.title);

    // Tính toán max display_order hiện có
    const { data: allStudies } = await this.supabase.client
      .from('case_studies')
      .select('results');

    let maxOrder = 0;
    (allStudies || []).forEach((s) => {
      const ord = s.results?.display_order;
      if (typeof ord === 'number' && ord > maxOrder) maxOrder = ord;
    });

    const nextOrder = maxOrder + 1;
    const defaultMetrics = [
      { label: 'Quy mô', value: '5.2K+' },
      { label: 'Báo chí PR', value: '50+ Bài' },
      { label: 'Lượt xem MXH', value: '2M Lượt' },
    ];
    const baseResults = dto.results || {
      metrics: defaultMetrics,
      athletes: '5.2K VĐV',
      articles: '50+ Bài Báo',
      views: '2M Lượt Xem',
    };
    const results = {
      ...baseResults,
      metrics: baseResults.metrics || defaultMetrics,
      display_order: nextOrder,
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
    return { success: true, data: { ...data, display_order: nextOrder } };
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
    if (dto.is_featured !== undefined) updatePayload.is_featured = dto.is_featured;

    // Bảo tồn display_order nếu update results
    if (dto.results !== undefined) {
      const { data: current } = await this.supabase.client
        .from('case_studies')
        .select('results')
        .eq('id', id)
        .maybeSingle();

      const existingOrder = current?.results?.display_order;
      updatePayload.results = {
        ...dto.results,
        ...(existingOrder !== undefined ? { display_order: existingOrder } : {}),
      };
    }

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
    // 1. Lấy thứ tự hiện tại
    const { data: current } = await this.supabase.client
      .from('case_studies')
      .select('results')
      .eq('id', id)
      .maybeSingle();

    const { error } = await this.supabase.client.from('case_studies').delete().eq('id', id);

    if (error) {
      this.logger.error(`[DELETE_CASE_STUDY_ERROR]: ${error.message}`);
      throw new InternalServerErrorException('Không thể xóa Case Study');
    }

    // 2. Dồn các case study phía sau lên (-1)
    const deletedOrder = current?.results?.display_order;
    if (typeof deletedOrder === 'number') {
      const { data: remaining } = await this.supabase.client
        .from('case_studies')
        .select('id, results');

      const toUpdate = (remaining || []).filter((s) => {
        const ord = s.results?.display_order;
        return typeof ord === 'number' && ord > deletedOrder;
      });

      if (toUpdate.length > 0) {
        await Promise.all(
          toUpdate.map((s) =>
            this.supabase.client
              .from('case_studies')
              .update({
                results: {
                  ...s.results,
                  display_order: s.results.display_order - 1,
                },
              })
              .eq('id', s.id)
          )
        );
      }
    }

    return { success: true };
  }
}
