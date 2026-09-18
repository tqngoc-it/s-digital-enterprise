import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

import { SupabaseModule } from './supabase/supabase.module';
import { LeadsModule } from './leads/leads.module';
import { ServicesModule } from './services/services.module';
import { PricingModule } from './pricing/pricing.module';
import { PartnersModule } from './partners/partners.module';
import { CaseStudiesModule } from './case-studies/case-studies.module';
import { BlogsModule } from './blogs/blogs.module';
import { StatsModule } from './stats/stats.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    // 1. Cấu hình Rate Limiting: 60 request trong vòng 60 giây (60000 ms)
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 60,
      },
    ]),

    SupabaseModule,
    LeadsModule,
    ServicesModule,
    PricingModule,
    PartnersModule,
    CaseStudiesModule,
    BlogsModule,
    StatsModule,
  ],
  providers: [
    // 2. Kích hoạt Guard toàn cục để bảo vệ tất cả API endpoints
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}