import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
  public client: SupabaseClient;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('NEXT_PUBLIC_SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      this.logger.error('Thiếu thông tin cấu hình SUPABASE trong file .env');
      throw new Error('Supabase credentials missing');
    }

    this.client = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    });
    this.logger.log('Kết nối Supabase SDK thành công');
  }
}