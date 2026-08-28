import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateLeadDto } from './dto/create-lead.dto';

@Injectable()
export class LeadsService {
  private readonly logger = new Logger(LeadsService.name);

  constructor(private readonly supabase: SupabaseService) {}

  async create(dto: CreateLeadDto) {
    try {
      const { data, error } = await this.supabase.client
        .from('leads')
        .insert({
          full_name: dto.fullName,
          email: dto.email,
          phone: dto.phone,
          message: dto.message,
          status: 'NEW',
          source: 'CONTACT_FORM',
        })
        .select()
        .single();

      if (error) {
        this.logger.error(`[DB_ERROR]: ${error.message}`, error.details);
        throw new InternalServerErrorException('Lỗi khi lưu dữ liệu vào cơ sở dữ liệu');
      }

      this.logger.log(`Đã tiếp nhận Lead mới từ: ${dto.email}`);
      return { success: true, data };
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
      .order('created_at', { ascending: false });

    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }
}