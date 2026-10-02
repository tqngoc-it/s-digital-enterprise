'use client';

import { FALLBACK_PARTNERS, PartnerItem } from '@/lib/fallbackData';
import { Building2, Handshake, Sparkles } from 'lucide-react';

interface CustomersPartnersProps {
  partners?: PartnerItem[];
}

export default function CustomersPartners({ partners = [] }: CustomersPartnersProps) {
  const sourceData = partners && partners.length > 0 ? partners : FALLBACK_PARTNERS;

  const isStrategicPartner = (p: PartnerItem) => {
    const t = (p.type || '').toUpperCase();
    return t === 'STRATEGIC_PARTNER' || t === 'PARTNER';
  };

  const isCustomer = (p: PartnerItem) => {
    const t = (p.type || '').toUpperCase();
    return t === 'CUSTOMER' || (!t && !isStrategicPartner(p));
  };

  let customers = sourceData.filter(isCustomer);
  let strategicPartners = sourceData.filter(isStrategicPartner);

  // Đảm bảo không bao giờ bị rỗng một trong 2 hàng marquee nếu DB chỉ chứa 1 loại
  if (customers.length === 0) {
    customers = FALLBACK_PARTNERS.filter(isCustomer);
  }
  if (strategicPartners.length === 0) {
    strategicPartners = FALLBACK_PARTNERS.filter(isStrategicPartner);
  }

  // Tạo chuỗi lặp đảm bảo độ dài lấp đầy màn hình và chu kỳ -50% hoàn hảo
  const makeMarqueeList = (items: PartnerItem[], minCount = 12) => {
    let list = [...items];
    while (list.length < minCount) {
      list = [...list, ...items];
    }
    return [...list, ...list];
  };

  const row1Customers = makeMarqueeList(customers);
  const row2Partners = makeMarqueeList(strategicPartners);

  return (
    <section
      id="customers"
      className="py-20 border-y border-white/5 bg-[#060913] overflow-hidden relative space-y-12"
    >
      {/* SECTION HEADER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-orange-400 text-xs font-mono font-bold">
          <Sparkles className="w-3.5 h-3.5 text-orange-400" />
          <span>TRUSTED NETWORK & ALLIANCES</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-black text-white">
          Khách Hàng & Đối Tác Chiến Lược
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
          Đồng hành cùng các tập đoàn, thương hiệu lớn và các tổ chức, học viện thể thao hàng đầu Việt Nam.
        </p>

        {/* STATS SUMMARY BAR */}
        <div className="flex justify-center gap-8 pt-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
            <Building2 className="w-4 h-4 text-orange-400" />
            <span>{customers.length}+ Khách Hàng Tiêu Biểu</span>
          </div>
          <div className="w-px h-4 bg-white/10 self-center" />
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
            <Handshake className="w-4 h-4 text-orange-400" />
            <span>{strategicPartners.length}+ Đối Tác Chiến Lược</span>
          </div>
        </div>
      </div>

      {/* CONTINUOUS DUAL MARQUEE TICKER WITH FADE GRADIENT MASK */}
      <div
        className="relative w-full overflow-hidden space-y-4"
        style={{
          maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
        }}
      >
        {/* GRADIENT EDGES OVERLAY (BACKUP DEPTH) */}
        <div className="absolute left-0 top-0 bottom-0 w-20 md:w-48 bg-gradient-to-r from-[#060913] via-[#060913]/70 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-20 md:w-48 bg-gradient-to-l from-[#060913] via-[#060913]/70 to-transparent z-10 pointer-events-none" />

        {/* ROW 1: ENTERPRISE CLIENTS (LEFT TO RIGHT) */}
        <div className="flex overflow-hidden py-1">
          <div className="animate-marquee gap-3 md:gap-4 items-center">
            {row1Customers.map((item, idx) => (
              <div
                key={item.id ? `customer-${item.id}-${idx}` : `customer-${idx}-${item.name}`}
                className="rounded-xl bg-white/[0.04] border border-white/10 hover:border-orange-500/60 hover:bg-orange-500/[0.06] px-5 py-2.5 flex items-center gap-2.5 transition-all duration-300 shadow-sm cursor-default group shrink-0 whitespace-nowrap"
              >
                <Building2 className="w-4 h-4 text-orange-400 group-hover:scale-110 transition-transform shrink-0" />
                <span className="text-white font-medium text-sm tracking-wide">
                  {item.name}
                </span>
                {item.industry && (
                  <span className="text-xs text-zinc-400 font-normal tracking-normal group-hover:text-zinc-300 transition-colors">
                    · {item.industry}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ROW 2: STRATEGIC PARTNERS (RIGHT TO LEFT) */}
        <div className="flex overflow-hidden py-1">
          <div className="animate-marquee-reverse gap-3 md:gap-4 items-center">
            {row2Partners.map((item, idx) => (
              <div
                key={item.id ? `partner-${item.id}-${idx}` : `partner-${idx}-${item.name}`}
                className="rounded-xl bg-white/[0.04] border border-white/10 hover:border-orange-500/60 hover:bg-orange-500/[0.06] px-5 py-2.5 flex items-center gap-2.5 transition-all duration-300 shadow-sm cursor-default group shrink-0 whitespace-nowrap"
              >
                <Handshake className="w-4 h-4 text-orange-400 group-hover:scale-110 transition-transform shrink-0" />
                <span className="text-white font-medium text-sm tracking-wide">
                  {item.name}
                </span>
                {item.industry && (
                  <span className="text-xs text-zinc-400 font-normal tracking-normal group-hover:text-zinc-300 transition-colors">
                    · {item.industry}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
