import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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
    SupabaseModule,
    LeadsModule,
    ServicesModule,
    PricingModule,
    PartnersModule,
    CaseStudiesModule,
    BlogsModule,
    StatsModule,
  ],
})
export class AppModule {}