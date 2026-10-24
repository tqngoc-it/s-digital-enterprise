import TypewriterTitle from './TypewriterTitle';
import { ArrowUpRight, Sparkles, TrendingUp, Users, Target, ShieldCheck, ChevronRight } from 'lucide-react';

interface HeroSectionProps {
  brandSlogan?: string;
  aboutText?: string;
}

export default function HeroSection({ brandSlogan, aboutText }: HeroSectionProps) {
  const defaultSlogan = brandSlogan || 'Tổ Hợp Tiếp Thị Số & Giải Pháp Thể Thao Đột Phá';
  const defaultAboutText =
    aboutText ||
    'Chúng tôi giúp doanh nghiệp tăng trưởng bền vững - xây dựng thương hiệu - thu hút khách hàng - tối ưu chuyển đổi bằng hệ thống marketing đa kênh kết hợp với các giải pháp truyền thông thể thao chuyên nghiệp.';

  const quickStats = [
    { value: '500+', label: 'Dự Án Đã Triển Khai', icon: Target, color: 'text-[#FF5722]' },
    { value: '96.8%', label: 'Khách Hàng Hài Lòng', icon: ShieldCheck, color: 'text-emerald-400' },
    { value: '3.5x', label: 'Tăng Trưởng ROI Trung Bình', icon: TrendingUp, color: 'text-cyan-400' },
    { value: '100+', label: 'Trọng Tài & Chuyên Gia', icon: Users, color: 'text-amber-400' },
  ];

  return (
    <section id="home" className="pt-32 md:pt-40 pb-16 max-w-7xl mx-auto px-4 sm:px-6 text-center space-y-10 relative">
      {/* BACKGROUND GLOW EFFECT */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 md:w-[680px] h-96 bg-gradient-to-r from-[#FF5722]/15 to-[#00E5FF]/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* TOP BADGE */}
      <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-slate-200/60 dark:bg-white/5 border border-slate-300/80 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-inner backdrop-blur-md">
        <span className="w-2 h-2 rounded-full bg-[#FF5722] animate-ping" />
        <Sparkles className="w-3.5 h-3.5 text-[#FF5722]" />
        <span className="tracking-wide">{defaultSlogan}</span>
      </div>

      {/* SINGLE H1 HEADING (WCAG HIERARCHY COMPLIANT) */}
      <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tight leading-tight space-y-2 md:space-y-3">
        <span className="block">Giải Pháp Truyền Thông &</span>
        <span className="flex items-center justify-center gap-3 md:gap-4 flex-wrap">
          <span>Marketing</span>
          <TypewriterTitle text="Toàn Diện" words={['Toàn Diện', 'Đột Phá', 'Đa Kênh', 'Hiệu Quả']} />
        </span>
      </h1>

      {/* ABOUT INTRO TEXT (100% SPEC) */}
      <p className="max-w-3xl mx-auto text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
        {defaultAboutText}
      </p>

      {/* 2 CTA BUTTONS */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
        <a
          href="#contact"
          className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#FF5722] hover:bg-orange-600 text-white font-bold text-sm transition-all shadow-xl shadow-[#FF5722]/30 hover:scale-105 flex items-center justify-center gap-2"
        >
          <span>Tư Vấn Miễn Phí</span>
          <ArrowUpRight className="w-4 h-4" />
        </a>
        <a
          href="#services"
          className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-800 border-slate-200 dark:bg-white/5 dark:hover:bg-white/10 dark:text-white dark:border-white/15 font-bold text-sm border transition-all hover:scale-105 flex items-center justify-center gap-2 backdrop-blur-sm shadow-sm"
        >
          <span>Tìm Hiểu Thêm</span>
          <ChevronRight className="w-4 h-4 text-slate-500 dark:text-slate-400" />
        </a>
      </div>

      {/* 4 QUICK STATS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 pt-10">
        {quickStats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-white dark:bg-[#0B111E]/80 border border-slate-200/80 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-all text-left flex flex-col justify-between space-y-4 group hover:-translate-y-1 duration-200 backdrop-blur-sm shadow-md shadow-slate-200/50 dark:shadow-lg"
            >
              <div className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center">
                <Icon className={`w-5 h-5 ${stat.color} group-hover:scale-110 transition-transform`} />
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">{stat.value}</div>
                <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-1">{stat.label}</div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
