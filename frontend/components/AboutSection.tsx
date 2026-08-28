import { Compass, Share2, Cpu, BarChart3, CheckCircle2, ArrowRight } from 'lucide-react';
import { CompanyInfo, FALLBACK_COMPANY } from '@/lib/fallbackData';

interface AboutSectionProps {
  companyInfo?: Partial<CompanyInfo>;
}

export default function AboutSection({ companyInfo }: AboutSectionProps) {
  const data = {
    about_heading: companyInfo?.about_heading || FALLBACK_COMPANY.about_heading,
    about_text: companyInfo?.about_text || FALLBACK_COMPANY.about_text,
    about_description_2: companyInfo?.about_description_2 || FALLBACK_COMPANY.about_description_2,
    core_capabilities: companyInfo?.core_capabilities || FALLBACK_COMPANY.core_capabilities,
  };

  const iconsMap: Record<string, any> = {
    Compass,
    Share2,
    Cpu,
    BarChart3,
  };

  return (
    <section id="about" className="py-20 md:py-28 max-w-7xl mx-auto px-4 sm:px-6 space-y-16 border-t border-white/5">
      {/* HEADER WITH H1 & H2 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
        <div className="lg:col-span-6 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FF5722]/10 border border-[#FF5722]/20 text-[#FF5722] text-xs font-mono font-bold">
            <span>ABOUT S-DIGITAL</span>
          </div>
          <h1 className="text-xs uppercase tracking-widest text-slate-500 font-mono font-semibold">
            Về Chúng Tôi
          </h1>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight">
            {data.about_heading}
          </h2>
        </div>

        <div className="lg:col-span-6 space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <p>{data.about_text}</p>
          <p className="text-slate-400">{data.about_description_2}</p>
        </div>
      </div>

      {/* 4 CORE CAPABILITIES CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {data.core_capabilities.map((item, idx) => {
          const Icon = iconsMap[item.iconName] || Compass;
          return (
            <div
              key={idx}
              className="p-8 rounded-3xl bg-[#0B111E] border border-white/10 hover:border-[#FF5722]/40 transition-all space-y-5 text-left group hover:-translate-y-1.5 duration-300 shadow-xl flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#FF5722]/10 border border-[#FF5722]/20 flex items-center justify-center text-[#FF5722] group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-white group-hover:text-[#FF5722] transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center gap-1.5 text-[11px] font-bold text-[#FF5722] opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Khám phá năng lực</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
