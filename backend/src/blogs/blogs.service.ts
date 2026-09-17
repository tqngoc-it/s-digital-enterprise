import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateBlogDto, UpdateBlogDto } from './dto/blog.dto';

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
export class BlogsService {
  private readonly logger = new Logger(BlogsService.name);

  constructor(private readonly supabase: SupabaseService) {}

  async findAll() {
    const { data, error } = await this.supabase.client
      .from('blogs')
      .select('*')
      .order('published_at', { ascending: false });

    if (error) {
      this.logger.error(`[FIND_ALL_BLOGS_ERROR]: ${error.message}`);
      throw new InternalServerErrorException('Lỗi khi lấy danh sách bài viết');
    }
    return data || [];
  }

  async findOne(id: string | number) {
    const { data, error } = await this.supabase.client
      .from('blogs')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Không tìm thấy bài viết với ID: ${id}`);
    }
    return data;
  }

  async create(dto: CreateBlogDto) {
    const slug = dto.slug || generateSlug(dto.title);
    const content = dto.content || dto.excerpt;
    const status = dto.status || 'PUBLISHED';
    const published_at = dto.published_at || new Date().toISOString();

    const { data, error } = await this.supabase.client
      .from('blogs')
      .insert({
        title: dto.title,
        slug,
        excerpt: dto.excerpt,
        content,
        status,
        published_at,
      })
      .select()
      .single();

    if (error) {
      this.logger.error(`[CREATE_BLOG_ERROR]: ${error.message}`);
      throw new InternalServerErrorException(error.message || 'Không thể tạo bài viết mới');
    }
    return { success: true, data };
  }

  async update(id: string | number, dto: UpdateBlogDto) {
    const updatePayload: any = {};
    if (dto.title !== undefined) {
      updatePayload.title = dto.title;
      if (!dto.slug) updatePayload.slug = generateSlug(dto.title);
    }
    if (dto.slug !== undefined) updatePayload.slug = dto.slug;
    if (dto.excerpt !== undefined) updatePayload.excerpt = dto.excerpt;
    if (dto.content !== undefined) updatePayload.content = dto.content;
    if (dto.status !== undefined) updatePayload.status = dto.status;
    if (dto.published_at !== undefined) updatePayload.published_at = dto.published_at;

    const { data, error } = await this.supabase.client
      .from('blogs')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      this.logger.error(`[UPDATE_BLOG_ERROR]: ${error.message}`);
      throw new InternalServerErrorException(error.message || 'Không thể cập nhật bài viết');
    }
    return { success: true, data };
  }

  async remove(id: string | number) {
    const { error } = await this.supabase.client.from('blogs').delete().eq('id', id);

    if (error) {
      this.logger.error(`[DELETE_BLOG_ERROR]: ${error.message}`);
      throw new InternalServerErrorException('Không thể xóa bài viết');
    }
    return { success: true };
  }
}
