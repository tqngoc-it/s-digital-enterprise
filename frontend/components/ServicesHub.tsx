'use client';

import { useState } from 'react';
import {
  TrendingUp,
  Megaphone,
  Globe,
  Video,
  Radio,
  ShieldAlert,
  Trophy,
  CheckCircle2,
  ArrowUpRight,
  Sparkles,
  Layers,
  Activity,
  Award,
  GraduationCap,
} from 'lucide-react';
import { ServiceItem } from '@/lib/fallbackData';

// Map icon động theo tên hoặc theo index
const ICON_MAP: Record<string, any> = {
  TrendingUp,
  Megaphone,
  Globe,
  Video,
  Radio,
  ShieldAlert,
  Trophy,
  Activity,
  Award,
  GraduationCap,
};

function getCategoryGroup(service: ServiceItem): 'DIGITAL' | 'SPORTS' {
  const cat = (service.category || '').toString().toUpperCase().trim();
  const text = `${service.title || ''} ${service.sub_title || ''} ${service.slug || ''}`.toLowerCase();
  if (
    cat === 'SPORTS' ||
    cat.includes('SPORT') ||
    cat.includes('THE_THAO') ||
    text.includes('thể thao') ||
    text.includes('giải đấu') ||
    text.includes('trọng tài') ||
    text.includes('huấn luyện')
  ) {
    return 'SPORTS';
  }
  return 'DIGITAL';
}

export default function ServicesHub({
  services = [],
}: {
  services?: ServiceItem[];
}) {
  const [activeTab, setActiveTab] = useState<'DIGITAL' | 'SPORTS'>('DIGITAL');

  // Lọc động dịch vụ theo Database
  const digitalServices = services.filter(
    (s) => getCategoryGroup(s) === 'DIGITAL' && s.is_active !== false
  );
  const sportsServices = services.filter(
    (s) => getCategoryGroup(s) === 'SPORTS' && s.is_active !== false
  );

  return (
    <section id="services" className="py-24 bg-[#060913] relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[350px] bg-gradient-to-tr from-[#FF5722]/10 via-[#00E5FF]/5 to-transparent blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* HEADER SECTION */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-[#FF5722]" />
            <span>HỆ SINH THÁI GIẢI PHÁP TOÀN DIỆN</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            Dịch Vụ Của <span className="text-[#FF5722]">Chúng Tôi</span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Chúng tôi cung cấp giải pháp truyền thông toàn diện, từ quảng cáo số đến tổ chức sự kiện thể thao, giúp doanh nghiệp tiếp cận khách hàng hiệu quả và xây dựng thương hiệu bền vững.
          </p>
        </div>

        {/* 2 MAIN TABS (DIGITAL SUITE VS SPORTS HUB) */}
        <div className="flex justify-center mb-12">
          <div className="p-1.5 rounded-2xl bg-[#0B0F19] border border-white/10 flex gap-2 shadow-2xl">
            <button
              onClick={() => setActiveTab('DIGITAL')}
              className={`px-6 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2.5 transition-all cursor-pointer ${
                activeTab === 'DIGITAL'
                  ? 'bg-[#FF5722] text-white shadow-lg shadow-[#FF5722]/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Nhóm 1: Marketing Số (Digital Suite)</span>
              <span className="px-2 py-0.5 rounded-full bg-black/20 text-xs">
                {digitalServices.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('SPORTS')}
              className={`px-6 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2.5 transition-all cursor-pointer ${
                activeTab === 'SPORTS'
                  ? 'bg-[#00E5FF] text-slate-950 shadow-lg shadow-[#00E5FF]/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>Nhóm 2: Thể Thao & Đào Tạo (Sports Hub)</span>
              <span className="px-2 py-0.5 rounded-full bg-black/20 text-xs">
                {sportsServices.length}
              </span>
            </button>
          </div>
        </div>

        {/* TAB 1: MARKETING SỐ (RENDER ĐỘNG 100% THEO DATABASE) */}
        {activeTab === 'DIGITAL' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {digitalServices.map((service, index) => {
              const IconComponent =
                ICON_MAP[service.icon_name || ''] ||
                [TrendingUp, Megaphone, Globe, Video, Radio, ShieldAlert][
                  index % 6
                ];
              const bulletPoints =
                service.bullet_points || service.features || service.points || [];

              return (
                <div
                  key={service.id || index}
                  className="group relative rounded-3xl bg-[#0D1322]/80 hover:bg-[#0D1322] border border-white/10 hover:border-[#FF5722]/50 p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-[#FF5722]/10 hover:-translate-y-1"
                >
                  <div className="space-y-5">
                    {/* Top: Icon + Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="w-12 h-12 rounded-2xl bg-[#FF5722]/10 border border-[#FF5722]/20 flex items-center justify-center text-[#FF5722] group-hover:scale-110 transition-transform">
                        <IconComponent className="w-6 h-6" />
                      </div>
                      {(service.sub_title || service.subtitle || service.badge) && (
                        <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                          {service.sub_title || service.subtitle || service.badge}
                        </span>
                      )}
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3 className="text-xl font-bold text-white group-hover:text-[#FF5722] transition-colors leading-snug">
                        {service.title}
                      </h3>
                      <p className="mt-2.5 text-xs sm:text-sm text-slate-400 leading-relaxed line-clamp-3">
                        {service.short_description || service.desc}
                      </p>
                    </div>

                    {/* Dynamic Bullet points */}
                    {bulletPoints.length > 0 && (
                      <div className="pt-2 border-t border-white/5 space-y-2">
                        {bulletPoints.map((point, pIdx) => (
                          <div
                            key={pIdx}
                            className="flex items-start gap-2.5 text-xs text-slate-300"
                          >
                            <CheckCircle2 className="w-4 h-4 text-[#FF5722] shrink-0 mt-0.5" />
                            <span className="leading-snug">{point}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* CTA Link */}
                  <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between">
                    <a
                      href="#contact"
                      className="text-xs font-bold text-[#FF5722] group-hover:text-orange-400 flex items-center gap-1.5 transition-colors"
                    >
                      <span>Nhận tư vấn giải pháp</span>
                      <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </a>
                    <span className="text-[10px] font-mono text-slate-600">
                      0{index + 1}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 2: THỂ THAO & ĐÀO TẠO (RENDER ĐỘNG THEO DATABASE) */}
        {activeTab === 'SPORTS' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sportsServices.map((service, index) => {
              const IconComponent =
                ICON_MAP[service.icon_name || ''] ||
                [Trophy, Activity, Award, GraduationCap][index % 4];
              const bulletPoints =
                service.bullet_points || service.features || service.points || [];

              return (
                <div
                  key={service.id || index}
                  className="group relative rounded-3xl bg-[#0D1322]/80 hover:bg-[#0D1322] border border-white/10 hover:border-[#00E5FF]/50 p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-[#00E5FF]/10 hover:-translate-y-1"
                >
                  <div className="space-y-5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="w-12 h-12 rounded-2xl bg-[#00E5FF]/10 border border-[#00E5FF]/20 flex items-center justify-center text-[#00E5FF] group-hover:scale-110 transition-transform">
                        <IconComponent className="w-6 h-6" />
                      </div>
                      {(service.sub_title || service.subtitle || service.badge) && (
                        <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider">
                          {service.sub_title || service.subtitle || service.badge}
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-white group-hover:text-[#00E5FF] transition-colors leading-snug">
                        {service.title}
                      </h3>
                      <p className="mt-2.5 text-xs sm:text-sm text-slate-400 leading-relaxed line-clamp-3">
                        {service.short_description || service.desc}
                      </p>
                    </div>

                    {bulletPoints.length > 0 && (
                      <div className="pt-2 border-t border-white/5 space-y-2">
                        {bulletPoints.map((point, pIdx) => (
                          <div
                            key={pIdx}
                            className="flex items-start gap-2.5 text-xs text-slate-300"
                          >
                            <CheckCircle2 className="w-4 h-4 text-[#00E5FF] shrink-0 mt-0.5" />
                            <span className="leading-snug">{point}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between">
                    <a
                      href="#contact"
                      className="text-xs font-bold text-[#00E5FF] group-hover:text-cyan-300 flex items-center gap-1.5 transition-colors"
                    >
                      <span>Đăng ký tham gia / Đặt lịch</span>
                      <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </a>
                    <span className="text-[10px] font-mono text-slate-600">
                      0{index + 1}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}