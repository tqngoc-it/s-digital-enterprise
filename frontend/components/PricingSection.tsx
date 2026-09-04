'use client';

import { CheckCircle2, Sparkles, ArrowRight, ShieldCheck, Award, Clock, Zap } from 'lucide-react';
import {
  FALLBACK_PRICING,
  FALLBACK_COMMITMENTS,
  PricingPlanItem,
  QualityCommitment,
} from '@/lib/fallbackData';

interface PricingSectionProps {
  plans?: PricingPlanItem[];
  commitments?: QualityCommitment[];
}

export default function PricingSection({
  plans = FALLBACK_PRICING,
  commitments = FALLBACK_COMMITMENTS,
}: PricingSectionProps) {
  const planList = plans && plans.length > 0 ? plans : FALLBACK_PRICING;
  const commitmentList = commitments && commitments.length > 0 ? commitments : FALLBACK_COMMITMENTS;

  const commitmentIcons: Record<string, any> = {
    ShieldCheck,
    Award,
    Clock,
    Sparkles,
    Zap,
  };

  return (
    <section id="pricing" className="py-20 md:py-28 max-w-7xl mx-auto px-4 sm:px-6 space-y-12 border-t border-white/5">
      {/* HEADER */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-[#FF5722] text-xs font-mono tracking-widest uppercase font-bold">
          TRANSPARENT & FLEXIBLE TIERS
        </span>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white">
          Bảng Giá Dịch Vụ Linh Hoạt
        </h2>
        <p className="text-xs sm:text-sm text-slate-400">
          Lựa chọn phương án đầu tư tối ưu phù hợp với quy mô và mục tiêu tăng trưởng của doanh nghiệp bạn.
        </p>
      </div>

      {/* STRATEGIC RECOMMENDATION BANNER */}
      <div className="max-w-3xl mx-auto p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#FF5722]/10 via-[#00E5FF]/10 to-[#FF5722]/10 border border-[#00E5FF]/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_0_25px_rgba(0,229,255,0.08)]">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-sm sm:text-base font-bold text-white">
            Chưa chắc chắn gói nào phù hợp với doanh nghiệp?
          </h3>
          <p className="text-xs text-slate-400">
            Hệ thống sẽ đối chiếu lĩnh vực, mục tiêu và mức đầu tư để gợi ý phương án tối ưu ROI cho doanh nghiệp trong 30 giây.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('sdigital:open-wizard'));
            }
          }}
          className="shrink-0 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF5722] to-orange-600 hover:brightness-110 text-white font-bold text-xs shadow-lg shadow-[#FF5722]/30 hover:shadow-[#FF5722]/50 transition-all flex items-center gap-2 cursor-pointer hover:scale-105"
        >
          <span>Tìm phương án phù hợp</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 3 PRICING TIERS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        {planList.map((plan, idx) => {
          const isPopular = plan.popular || plan.tier_name.includes('Chuyên Nghiệp');
          return (
            <div
              key={idx}
              className={`p-8 md:p-10 rounded-3xl bg-[#0B111E] flex flex-col justify-between space-y-8 relative transition-all duration-300 ${
                isPopular
                  ? 'border-2 border-[#FF5722] shadow-2xl shadow-[#FF5722]/15 lg:-translate-y-3'
                  : 'border border-white/10 hover:border-white/25'
              }`}
            >
              {isPopular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#FF5722] text-white text-[10px] font-black tracking-widest uppercase shadow-lg shadow-[#FF5722]/40 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" />
                  <span>PHỔ BIẾN NHẤT</span>
                </div>
              )}

              <div className="space-y-6">
                <div className="space-y-2">
                  {!isPopular && (
                    <span className="text-[10px] font-mono font-bold uppercase px-3 py-1 rounded-full bg-white/5 text-slate-400 border border-white/10">
                      {plan.badge || 'Lựa Chọn'}
                    </span>
                  )}
                  <h3 className="text-2xl font-black text-white pt-2">{plan.tier_name}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed min-h-[36px]">
                    {plan.target_audience}
                  </p>
                </div>

                <div className="flex items-baseline gap-1.5 pt-2 pb-4 border-b border-white/10">
                  <span className={`text-4xl font-black ${isPopular ? 'text-[#FF5722]' : 'text-white'}`}>
                    {plan.price_display}
                  </span>
                  {plan.period && (
                    <span className="text-xs font-normal text-slate-400">{plan.period}</span>
                  )}
                </div>

                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Quyền lợi chi tiết bao gồm:
                  </span>
                  <ul className="space-y-3 pt-1 text-xs text-slate-300">
                    {plan.features.map((f, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2.5">
                        <CheckCircle2
                          className={`w-4 h-4 shrink-0 mt-0.5 ${
                            isPopular ? 'text-[#FF5722]' : 'text-emerald-400'
                          }`}
                        />
                        <span className="leading-relaxed">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <a
                href="#contact"
                className={`w-full py-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer ${
                  isPopular
                    ? 'bg-[#FF5722] hover:bg-orange-600 text-white shadow-xl shadow-[#FF5722]/30 hover:scale-[1.02]'
                    : 'bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20'
                }`}
              >
                <span>{isPopular ? 'Đăng Ký Gói Chuyên Nghiệp' : 'Đăng Ký Tư Vấn'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          );
        })}
      </div>

      {/* 4 QUALITY COMMITMENTS */}
      <div className="p-8 md:p-10 rounded-3xl bg-[#0B111E] border border-white/10 space-y-6 shadow-2xl">
        <div className="text-center space-y-1">
          <span className="text-[#00E5FF] text-xs font-mono font-bold uppercase tracking-wider">
            QUALITY GUARANTEE
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-white">4 Cam Kết Chất Lượng S-Digital</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
          {commitmentList.map((c, cIdx) => {
            const Icon = commitmentIcons[c.iconName] || ShieldCheck;
            return (
              <div
                key={cIdx}
                className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-[#00E5FF]/40 transition-all space-y-3 group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/20 flex items-center justify-center text-[#00E5FF] group-hover:scale-110 transition-transform">
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-white group-hover:text-[#00E5FF] transition-colors">
                  {c.title}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">{c.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
