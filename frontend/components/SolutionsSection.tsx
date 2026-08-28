import { Award, Quote, Sparkles, Users, Newspaper, Eye, ArrowRight, Star } from 'lucide-react';
import {
  FALLBACK_CASE_STUDIES,
  FALLBACK_TESTIMONIALS,
  CaseStudyItem,
  TestimonialItem,
} from '@/lib/fallbackData';

interface SolutionsSectionProps {
  caseStudies?: CaseStudyItem[];
  testimonials?: TestimonialItem[];
}

export default function SolutionsSection({
  caseStudies = [],
  testimonials = FALLBACK_TESTIMONIALS,
}: SolutionsSectionProps) {
  const featuredCase =
    caseStudies.length > 0 ? caseStudies[0] : FALLBACK_CASE_STUDIES[0];

  const testimonialList =
    testimonials && testimonials.length > 0 ? testimonials : FALLBACK_TESTIMONIALS;

  return (
    <section id="solutions" className="py-20 md:py-28 max-w-7xl mx-auto px-4 sm:px-6 space-y-16">
      {/* SECTION HEADER */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-[#00E5FF] text-xs font-mono tracking-widest uppercase font-bold">
          PROVEN SUCCESS & RESULTS
        </span>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white">
          Giải Pháp & Dự Án Tiêu Biểu
        </h2>
        <p className="text-xs sm:text-sm text-slate-400">
          Minh chứng năng lực vận hành giải đấu thể thao và chiến dịch marketing quy mô lớn.
        </p>
      </div>

      {/* FEATURED CASE STUDY HERO CARD */}
      <div className="p-8 md:p-12 rounded-3xl bg-[#0B111E] border border-white/10 relative overflow-hidden shadow-2xl space-y-8">
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-gradient-to-br from-[#FF5722]/15 to-[#00E5FF]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FF5722]/10 border border-[#FF5722]/20 text-[#FF5722] text-xs font-bold font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              <span>CASE STUDY TIÊU BIỂU</span>
            </div>

            <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-white leading-tight">
              {featuredCase.title}
            </h3>

            <p className="text-xs font-mono text-[#00E5FF]">
              Đơn vị chủ quản: <span className="text-white font-bold">{featuredCase.client_name}</span>
            </p>

            <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
              <p>
                <strong className="text-white">Thách thức: </strong>
                {featuredCase.challenge}
              </p>
              <p>
                <strong className="text-white">Giải pháp S-Digital: </strong>
                {featuredCase.solution}
              </p>
            </div>

            {/* 3 METRIC PILLARS */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-4 border-t border-white/10">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-400">
                  <Users className="w-3.5 h-3.5 text-[#FF5722]" />
                  <span>Quy mô VĐV</span>
                </div>
                <div className="text-xl sm:text-2xl md:text-3xl font-black text-[#FF5722]">
                  {featuredCase.results?.athletes || '5.2K Vận Động Viên'}
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-500">Tham gia thi đấu</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-400">
                  <Newspaper className="w-3.5 h-3.5 text-[#00E5FF]" />
                  <span>Báo chí đưa tin</span>
                </div>
                <div className="text-xl sm:text-2xl md:text-3xl font-black text-[#00E5FF]">
                  {featuredCase.results?.articles || '50+ Bài Báo'}
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-500">Độ phủ chính thống</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-400">
                  <Eye className="w-3.5 h-3.5 text-[#10B981]" />
                  <span>Lượt xem MXH</span>
                </div>
                <div className="text-xl sm:text-2xl md:text-3xl font-black text-[#10B981]">
                  {featuredCase.results?.views || '2M Lượt Xem'}
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-500">Lan tỏa đa kênh</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 p-6 sm:p-8 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Hạng Mục S-Digital Phụ Trách Trọn Gói</span>
            </div>
            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF5722] mt-1.5 shrink-0" />
                <span>Sản xuất toàn bộ ấn phẩm nhận diện thương hiệu & race-kit</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF5722] mt-1.5 shrink-0" />
                <span>Booking 20+ KOLs thể thao tham gia thi đấu và lan tỏa</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF5722] mt-1.5 shrink-0" />
                <span>Livestream trực tiếp trận đấu với hệ thống 8 góc máy 4K</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF5722] mt-1.5 shrink-0" />
                <span>Cung cấp đội ngũ 60+ Trọng tài quốc tế & Điều phối đường chạy</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

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
              key={idx}
              className="p-8 rounded-3xl bg-[#0B111E] border border-white/10 flex flex-col justify-between space-y-6 hover:border-white/20 transition-all text-left group shadow-xl"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Quote className="w-7 h-7 text-[#FF5722]/50 group-hover:text-[#FF5722] transition-colors" />
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
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
