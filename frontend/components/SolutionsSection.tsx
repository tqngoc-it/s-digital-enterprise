'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Award,
  Quote,
  Sparkles,
  Users,
  Newspaper,
  Eye,
  ArrowRight,
  Star,
  ExternalLink,
  ChevronRight,
  X,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import {
  FALLBACK_CASE_STUDIES,
  FALLBACK_TESTIMONIALS,
  CaseStudyItem,
  TestimonialItem,
} from '@/lib/fallbackData';
import { parseCaseStudyMetrics } from '@/lib/caseStudyMetrics';

interface SolutionsSectionProps {
  caseStudies?: CaseStudyItem[];
  testimonials?: TestimonialItem[];
}

export default function SolutionsSection({
  caseStudies = [],
  testimonials = FALLBACK_TESTIMONIALS,
}: SolutionsSectionProps) {
  const [selectedStudy, setSelectedStudy] = useState<CaseStudyItem | null>(null);

  const activeStudies =
    caseStudies && caseStudies.length > 0 ? caseStudies : FALLBACK_CASE_STUDIES;

  // Hiển thị tối đa 3 Case Study nổi bật nhất
  const topStudies = activeStudies.slice(0, 3);

  const testimonialList =
    testimonials && testimonials.length > 0 ? testimonials : FALLBACK_TESTIMONIALS;

  return (
    <section id="solutions" className="py-20 md:py-28 max-w-7xl mx-auto px-4 sm:px-6 space-y-16">
      {/* SECTION HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <span className="text-[#00E5FF] text-xs font-mono tracking-widest uppercase font-bold">
            PROVEN SUCCESS & RESULTS
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white">
            Giải Pháp & Dự Án Tiêu Biểu
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Minh chứng năng lực vận hành giải đấu thể thao chuyên nghiệp và chiến dịch marketing quy mô lớn từ S-Digital.
          </p>
        </div>

        <Link
          href="/case-studies"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold border border-white/10 transition-all self-start md:self-auto hover:border-[#00E5FF]/40 text-[#00E5FF]"
        >
          <span>Xem tất cả {activeStudies.length} Case Studies</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* TOP 3 FULL-WIDTH CASE STUDY CARDS (ALTERNATING Z-PATTERN) */}
      <div className="space-y-10">
        {topStudies.map((study, idx) => {
          const isReversed = idx % 2 === 1;
          const metrics = parseCaseStudyMetrics(study.results);
          const scopeList =
            study.scope_items && study.scope_items.length > 0
              ? study.scope_items
              : [
                  'Tư vấn chiến lược và hoạch định lộ trình triển khai tổng thể',
                  'Sản xuất bộ nhận diện thương hiệu, hình ảnh & video độ phân giải cao',
                  'Vận hành truyền thông đa kênh kết hợp hệ thống đo lường ROI realtime',
                  'Điều phối an ninh, hiện trường và chăm sóc đối tác tài trợ',
                ];

          return (
            <div
              key={study.id || study.slug || `top-case-${idx}`}
              className="p-8 md:p-12 rounded-3xl bg-[#0B111E] border border-white/10 relative overflow-hidden shadow-2xl hover:border-white/20 transition-all group"
            >
              {/* Background ambient lighting */}
              <div
                className={`absolute ${
                  isReversed ? '-left-24' : '-right-24'
                } -top-24 w-96 h-96 bg-gradient-to-br from-[#FF5722]/15 to-[#00E5FF]/10 rounded-full blur-3xl pointer-events-none`}
              />

              <div
                className={`flex flex-col lg:flex-row items-stretch gap-8 lg:gap-12 relative z-10 ${
                  isReversed ? 'lg:flex-row-reverse' : ''
                }`}
              >
                {/* CONTENT COLUMN */}
                <div className="lg:w-7/12 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF5722]/10 border border-[#FF5722]/20 text-[#FF5722] text-xs font-bold font-mono">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>DỰ ÁN #{idx + 1}</span>
                      </span>
                      <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 text-xs font-mono font-bold">
                        {study.client_name}
                      </span>
                      {study.is_featured && (
                        <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold">
                          ★ Tiêu Biểu
                        </span>
                      )}
                    </div>

                    <h3 className="text-2xl sm:text-3xl md:text-3xl font-black text-white leading-tight">
                      {study.title}
                    </h3>

                    <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
                      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                        <span className="text-[#FF5722] font-bold text-xs uppercase tracking-wider block">
                          Thách Thức
                        </span>
                        <p>{study.challenge}</p>
                      </div>

                      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                        <span className="text-[#00E5FF] font-bold text-xs uppercase tracking-wider block">
                          Giải Pháp S-Digital
                        </span>
                        <p>{study.solution}</p>
                      </div>
                    </div>
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      onClick={() => setSelectedStudy(study)}
                      className="px-6 py-3 rounded-xl bg-[#FF5722] hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-[#FF5722]/20 cursor-pointer hover:scale-[1.02]"
                    >
                      <span>Xem Toàn Bộ Chiến Dịch</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <Link
                      href="/case-studies"
                      className="px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-bold text-xs flex items-center gap-2 transition-all border border-white/10"
                    >
                      <span>Danh mục dự án</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* METRICS & DELIVERABLES COLUMN */}
                <div className="lg:w-5/12 flex flex-col justify-between space-y-6 p-6 sm:p-8 rounded-2xl bg-white/[0.03] border border-white/10">
                  {/* 3 DYNAMIC METRIC PILLARS */}
                  <div className="space-y-3">
                    <span className="text-[11px] font-mono text-slate-400 font-bold uppercase tracking-wider block">
                      KẾT QUẢ ĐẠT ĐƯỢC
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {metrics.map((m, mIdx) => (
                        <div
                          key={`metric-${idx}-${mIdx}`}
                          className="p-3.5 rounded-xl bg-[#060913]/60 border border-white/5 space-y-1 text-center sm:text-left"
                        >
                          <div className="flex items-center justify-center sm:justify-start gap-1.5 text-[11px] text-slate-400">
                            {mIdx === 0 && <Users className="w-3.5 h-3.5 text-[#FF5722]" />}
                            {mIdx === 1 && <Newspaper className="w-3.5 h-3.5 text-[#00E5FF]" />}
                            {mIdx === 2 && <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />}
                            <span className="truncate" title={m.label}>{m.label}</span>
                          </div>
                          <div
                            className={`text-lg sm:text-xl font-black ${
                              mIdx === 0
                                ? 'text-[#FF5722]'
                                : mIdx === 1
                                ? 'text-[#00E5FF]'
                                : 'text-emerald-400'
                            }`}
                          >
                            {m.value}
                          </div>
                          {m.sub && (
                            <p className="text-[10px] text-slate-500 truncate" title={m.sub}>
                              {m.sub}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* SCOPE ITEMS / HẠNG MỤC THỰC HIỆN */}
                  <div className="space-y-3 pt-4 border-t border-white/10">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                      <Award className="w-4 h-4 text-amber-400" />
                      <span>Hạng Mục Triển Khai Thực Tế</span>
                    </div>
                    <ul className="space-y-2.5 text-xs text-slate-300">
                      {scopeList.slice(0, 4).map((item, sIdx) => (
                        <li key={`scope-${idx}-${sIdx}`} className="flex items-start gap-2.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#FF5722] mt-1.5 shrink-0" />
                          <span className="leading-snug">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* QUICK VIEW CASE STUDY MODAL */}
      {selectedStudy && (() => {
        const modalMetrics = parseCaseStudyMetrics(selectedStudy.results);
        const modalScope =
          selectedStudy.scope_items && selectedStudy.scope_items.length > 0
            ? selectedStudy.scope_items
            : [
                'Thiết kế nhận diện thương hiệu độc quyền',
                'Khai thác truyền thông & booking KOLs chuyên biệt',
                'Vận hành kỹ thuật đa điểm chạm & báo cáo kết quả',
              ];

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
            <div className="max-w-2xl w-full p-6 sm:p-8 rounded-3xl bg-[#0B111E] border border-white/15 space-y-6 text-xs shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setSelectedStudy(null)}
                className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                aria-label="Đóng"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-3 pr-8">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-[#FF5722]/10 border border-[#FF5722]/20 text-[#FF5722] font-mono font-bold text-xs">
                    {selectedStudy.client_name}
                  </span>
                  {selectedStudy.is_featured && (
                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-[11px]">
                      ★ Tiêu Biểu
                    </span>
                  )}
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                  {selectedStudy.title}
                </h3>
              </div>

              {/* 3 METRIC PILLARS */}
              <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-[#060913] border border-white/5 text-center">
                {modalMetrics.map((m, mIdx) => (
                  <div key={`modal-metric-${mIdx}`} className="space-y-0.5">
                    <div
                      className={`text-base sm:text-lg font-black ${
                        mIdx === 0
                          ? 'text-[#FF5722]'
                          : mIdx === 1
                          ? 'text-[#00E5FF]'
                          : 'text-emerald-400'
                      }`}
                    >
                      {m.value}
                    </div>
                    <div className="text-[11px] text-slate-400 font-semibold">{m.label}</div>
                  </div>
                ))}
              </div>

              {/* CHALLENGE & SOLUTION */}
              <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                  <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF5722]" />
                    <span>Thách Thức Ban Đầu:</span>
                  </h4>
                  <p className="text-slate-300 pl-3">{selectedStudy.challenge}</p>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                  <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF]" />
                    <span>Giải Pháp Chiến Lược Từ S-Digital:</span>
                  </h4>
                  <p className="text-slate-300 pl-3">{selectedStudy.solution}</p>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                  <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-400" />
                    <span>Phạm Vi Triển Khai:</span>
                  </h4>
                  <ul className="space-y-1.5 pl-3">
                    {modalScope.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* MODAL FOOTER */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <a
                  href="#contact"
                  onClick={() => setSelectedStudy(null)}
                  className="w-full sm:flex-1 py-3.5 rounded-xl bg-[#FF5722] hover:bg-orange-600 text-white font-bold text-xs text-center transition-all shadow-lg shadow-[#FF5722]/30 cursor-pointer"
                >
                  Tư Vấn Dự Án Tương Tự
                </a>
                <Link
                  href="/case-studies"
                  onClick={() => setSelectedStudy(null)}
                  className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs text-center transition-all border border-white/10"
                >
                  Xem Tất Cả Dự Án
                </Link>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 3 TESTIMONIALS */}
      <div className="space-y-8 pt-4">
        <div className="text-center space-y-2">
          <span className="text-[#FF5722] text-xs font-mono font-bold uppercase tracking-wider">
            CLIENT TESTIMONIALS
          </span>
          <h3 className="text-2xl sm:text-3xl font-black text-white">
            Đánh Giá Từ Khách Hàng & Đối Tác
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonialList.map((t, idx) => (
            <div
              key={`testimonial-${t.author}-${idx}`}
              className="p-8 rounded-3xl bg-[#0B111E] border border-white/10 flex flex-col justify-between space-y-6 hover:border-white/20 transition-all text-left group shadow-xl"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Quote className="w-7 h-7 text-[#FF5722]/50 group-hover:text-[#FF5722] transition-colors" />
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={`star-${idx}-${i}`} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic">
                  &ldquo;{t.content}&rdquo;
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF5722] to-orange-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                  {t.avatarText}
                </div>
                <div>
                  <div className="text-xs font-bold text-white">{t.author}</div>
                  <div className="text-[11px] text-slate-400">
                    {t.role} · <span className="text-slate-300 font-semibold">{t.brand}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
