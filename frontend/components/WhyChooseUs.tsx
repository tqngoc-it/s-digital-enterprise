import {
  ShieldAlert,
  Users,
  Network,
  Trophy,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Zap,
} from 'lucide-react';
import { FALLBACK_WHY_CHOOSE_US, WhyChooseUsData } from '@/lib/fallbackData';

interface WhyChooseUsProps {
  data?: WhyChooseUsData;
}

export default function WhyChooseUs({ data = FALLBACK_WHY_CHOOSE_US }: WhyChooseUsProps) {
  const iconsMap: Record<string, any> = {
    Users,
    Network,
    Trophy,
    ShieldCheck,
  };

  return (
    <section id="why-us" className="py-20 md:py-28 max-w-7xl mx-auto px-4 sm:px-6 space-y-16 border-t border-white/5">
      {/* SECTION HEADER */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-[#FF5722] text-xs font-mono tracking-widest uppercase font-bold">
          WHY CHOOSE S-DIGITAL
        </span>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white">
          Tại Sao Khách Hàng Tin Chọn Chúng Tôi?
        </h2>
        <p className="text-xs sm:text-sm text-slate-400">
          Sự kết hợp độc bản giữa tư duy chiến lược marketing đa kênh và năng lực điều hành thể thao đỉnh cao.
        </p>
      </div>

      {/* CRISIS HIGHLIGHT HERO CARD (30-MINUTES RESPONSE) */}
      <div className="p-8 md:p-12 rounded-3xl bg-gradient-to-br from-[#1c0d0d] via-[#0B111E] to-[#0B111E] border border-red-500/30 relative overflow-hidden shadow-2xl space-y-8">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono font-bold">
              <Zap className="w-3.5 h-3.5" />
              <span>NĂNG LỰC ĐẶC BIỆT DUY NHẤT</span>
            </div>

            <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-white leading-tight">
              {data.crisis_highlight.title}
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
              {data.crisis_highlight.desc}
            </p>
          </div>

          <div className="lg:col-span-4 grid grid-cols-1 gap-4">
            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
              <div className="text-3xl font-black text-red-400 font-mono">
                {data.crisis_highlight.reaction_time}
              </div>
              <div className="text-xs font-bold text-white">Thời gian tiếp nhận & phản ứng</div>
              <p className="text-[11px] text-slate-400">Trực chiến 24/7 không gián đoạn</p>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
              <div className="text-3xl font-black text-amber-400 font-mono">
                {data.crisis_highlight.cases_handled}
              </div>
              <div className="text-xs font-bold text-white">Xử lý thành công các case lớn</div>
              <p className="text-[11px] text-slate-400">Bảo toàn danh tiếng & doanh số</p>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
              <div className="text-xs font-bold text-emerald-400">Mạng Lưới Rộng Khắp</div>
              <p className="text-xs text-white font-semibold">{data.crisis_highlight.network}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 4 PILLARS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {data.four_pillars.map((pillar, idx) => {
          const Icon = iconsMap[pillar.iconName] || Users;
          return (
            <div
              key={idx}
              className="p-8 rounded-3xl bg-[#0B111E] border border-white/10 hover:border-[#FF5722]/40 transition-all space-y-4 shadow-xl group hover:-translate-y-1.5 duration-300"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#FF5722]/10 border border-[#FF5722]/20 flex items-center justify-center text-[#FF5722] group-hover:scale-110 transition-transform">
                <Icon className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white group-hover:text-[#FF5722] transition-colors">
                {pillar.title}
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">{pillar.desc}</p>
            </div>
          );
        })}
      </div>

      {/* 5-STEP WORKING WORKFLOW */}
      <div className="p-8 md:p-12 rounded-3xl bg-[#0B111E] border border-white/10 space-y-8 shadow-2xl">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-[#00E5FF] text-xs font-mono font-bold uppercase tracking-wider">
            STANDARDIZED WORKFLOW
          </span>
          <h3 className="text-2xl sm:text-3xl font-black text-white">
            Quy Trình 5 Bước Hợp Tác Chuyên Nghiệp
          </h3>
          <p className="text-xs text-slate-400">
            Minh bạch từng bước, kiểm soát tiến độ chặt chẽ và bàn giao kết quả vượt cam kết.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {data.five_steps_process.map((step, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-[#00E5FF]/40 transition-all space-y-3 flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="text-3xl font-black text-[#00E5FF] font-mono group-hover:scale-105 transition-transform">
                  {step.step}
                </div>
                <h4 className="text-xs font-bold text-white leading-snug">{step.title}</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
              <div className="pt-2 border-t border-white/5">
                <span className="text-[10px] font-mono text-[#00E5FF]/80">Giai đoạn {idx + 1}/5</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
