import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class StatsService {
  private readonly logger = new Logger(StatsService.name);

  constructor(private readonly supabase: SupabaseService) {}

  async getDashboardStats() {
    try {
      const [leadsRes, partnersRes, servicesRes, pricingRes, caseStudiesRes, blogsRes] =
        await Promise.all([
          this.supabase.client.from('leads').select('*', { count: 'exact', head: true }),
          this.supabase.client.from('partners').select('*', { count: 'exact', head: true }),
          this.supabase.client.from('services').select('*', { count: 'exact', head: true }),
          this.supabase.client.from('pricing_plans').select('*', { count: 'exact', head: true }),
          this.supabase.client.from('case_studies').select('*', { count: 'exact', head: true }),
          this.supabase.client.from('blogs').select('*', { count: 'exact', head: true }),
        ]);

      return {
        leads: leadsRes.count || 0,
        partners: partnersRes.count || 25,
        services: servicesRes.count || 11,
        pricing: pricingRes.count || 3,
        caseStudies: caseStudiesRes.count || 1,
        blogs: blogsRes.count || 3,
      };
    } catch (err: any) {
      this.logger.error(`[STATS_ERROR]: ${err.message}`);
      return {
        leads: 0,
        partners: 25,
        services: 11,
        pricing: 3,
        caseStudies: 1,
        blogs: 3,
      };
    }
  }
}
