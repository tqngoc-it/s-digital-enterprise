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

interface BlogMeta {
  author?: string;
  category?: string;
  read_time?: string;
  external_url?: string;
}

function packBlogContent(rawContent: string, meta: BlogMeta): string {
  const metaComment = `<!-- BLOG_META:${JSON.stringify(meta)} -->\n`;
  return metaComment + (rawContent || '');
}

function unpackBlog(blog: any) {
  if (!blog) return blog;
  let author = 'S-Digital Strategy Team';
  let category = Array.isArray(blog.tags) && blog.tags[0] ? blog.tags[0] : 'Digital Marketing';
  let read_time = '5 phút đọc';
  let external_url: string | null = null;
  let cleanContent = blog.content || '';

  if (typeof cleanContent === 'string') {
    const metaMatch = cleanContent.match(/<!-- BLOG_META:(.*?) -->/);
    if (metaMatch) {
      try {
        const parsed = JSON.parse(metaMatch[1]);
        if (parsed.author) author = parsed.author;
        if (parsed.category) category = parsed.category;
        if (parsed.read_time) read_time = parsed.read_time;
        if (parsed.external_url) external_url = parsed.external_url;
      } catch (e) {
        // ignore parse error
      }
      cleanContent = cleanContent.replace(/<!-- BLOG_META:.*? -->\n?/, '');
    }
  }

  return {
    ...blog,
    author: blog.author || author,
    category: blog.category || category,
    read_time: blog.read_time || read_time,
    external_url: blog.external_url || external_url,
    content: cleanContent,
  };
}

@Injectable()
export class BlogsService {
  private readonly logger = new Logger(BlogsService.name);

  constructor(private readonly supabase: SupabaseService) {}

  async findAll(status?: string) {
    let query = this.supabase.client
      .from('blogs')
      .select('*')
      .order('published_at', { ascending: false })
      .order('created_at', { ascending: false })
      .order('id', { ascending: true });

    if (status) {
      query = query.eq('status', status.toUpperCase());
    }

    const { data, error } = await query;

    if (error) {
      this.logger.error(`[FIND_ALL_BLOGS_ERROR]: ${error.message}`);
      throw new InternalServerErrorException('Lỗi khi lấy danh sách bài viết');
    }
    return (data || []).map(unpackBlog);
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
    return unpackBlog(data);
  }

  async create(dto: CreateBlogDto) {
    const slug = dto.slug || generateSlug(dto.title);
    const rawContent = dto.content || dto.excerpt;
    const category = dto.category || 'Digital Marketing';
    const author = dto.author || 'S-Digital Strategy Team';
    const read_time = dto.read_time || '5 phút đọc';
    const external_url = dto.external_url || undefined;

    const content = packBlogContent(rawContent, {
      category,
      author,
      read_time,
      external_url,
    });

    const status = dto.status || 'PUBLISHED';
    const published_at = dto.published_at || new Date().toISOString();

    const { data, error } = await this.supabase.client
      .from('blogs')
      .insert({
        title: dto.title,
        slug,
        excerpt: dto.excerpt,
        content,
        tags: [category],
        status,
        published_at,
      })
      .select()
      .single();

    if (error) {
      this.logger.error(`[CREATE_BLOG_ERROR]: ${error.message}`);
      throw new InternalServerErrorException(error.message || 'Không thể tạo bài viết mới');
    }
    return { success: true, data: unpackBlog(data) };
  }

  async update(id: string | number, dto: UpdateBlogDto) {
    const updatePayload: any = {};
    if (dto.title !== undefined) {
      updatePayload.title = dto.title;
      if (!dto.slug) updatePayload.slug = generateSlug(dto.title);
    }
    if (dto.slug !== undefined) updatePayload.slug = dto.slug;
    if (dto.excerpt !== undefined) updatePayload.excerpt = dto.excerpt;
    if (dto.status !== undefined) updatePayload.status = dto.status;
    if (dto.published_at !== undefined) updatePayload.published_at = dto.published_at;
    if (dto.category !== undefined) {
      updatePayload.tags = [dto.category];
    }

    if (
      dto.content !== undefined ||
      dto.author !== undefined ||
      dto.category !== undefined ||
      dto.read_time !== undefined ||
      dto.external_url !== undefined
    ) {
      // Lấy thông tin bài hiện tại để giữ meta nếu không truyền
      const { data: current } = await this.supabase.client
        .from('blogs')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      const unpacked = unpackBlog(current);
      const rawContent = dto.content !== undefined ? dto.content : unpacked.content;
      const meta: BlogMeta = {
        author: dto.author !== undefined ? dto.author : unpacked.author,
        category: dto.category !== undefined ? dto.category : unpacked.category,
        read_time: dto.read_time !== undefined ? dto.read_time : unpacked.read_time,
        external_url: dto.external_url !== undefined ? dto.external_url : unpacked.external_url,
      };
      updatePayload.content = packBlogContent(rawContent, meta);
    }

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
    return { success: true, data: unpackBlog(data) };
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
