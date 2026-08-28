'use client';

import { useState } from 'react';
import { FALLBACK_PARTNERS, PartnerItem } from '@/lib/fallbackData';
import { Building2, Handshake, Sparkles } from 'lucide-react';

interface CustomersPartnersProps {
  partners?: PartnerItem[];
}

export default function CustomersPartners({ partners = [] }: CustomersPartnersProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'customers' | 'partners'>('all');

  const sourceData = partners && partners.length > 0 ? partners : FALLBACK_PARTNERS;

  const customers = sourceData.filter((p) => p.type === 'CUSTOMER' || !p.type);
  const strategicPartners = sourceData.filter((p) => p.type === 'PARTNER');

  // Nhân bản để chạy marquee vô tận mượt mà
  const row1Customers = [...customers, ...customers];
  const row2Partners = [...strategicPartners, ...strategicPartners, ...strategicPartners];

  return (
    <section id="customers" className="py-20 border-y border-white/5 bg-[#080D1A]/70 overflow-hidden relative space-y-12">
      {/* SECTION HEADER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-[#00E5FF] text-xs font-mono font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>TRUSTED NETWORK & ALLIANCES</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-black text-white">
          Khách Hàng & Đối Tác Chiến Lược
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
          Đồng hành cùng 16+ tập đoàn, thương hiệu lớn và 9+ tổ chức, học viện thể thao hàng đầu Việt Nam.
        </p>

        {/* STATS SUMMARY BAR */}
        <div className="flex justify-center gap-8 pt-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
            <Building2 className="w-4 h-4 text-[#FF5722]" />
            <span>16+ Khách Hàng Tiêu Biểu</span>
          </div>
          <div className="w-px h-4 bg-white/10 self-center" />
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
            <Handshake className="w-4 h-4 text-[#00E5FF]" />
            <span>9+ Đối Tác Học Viện & Media</span>
          </div>
        </div>
      </div>

      {/* CONTINUOUS DUAL MARQUEE TICKER */}
      <div className="relative w-full overflow-hidden space-y-4">
        {/* GRADIENT EDGES OVERLAY */}
        <div className="absolute left-0 top-0 bottom-0 w-20 md:w-48 bg-gradient-to-r from-[#060913] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-20 md:w-48 bg-gradient-to-l from-[#060913] to-transparent z-10 pointer-events-none" />

        {/* ROW 1: 16 ENTERPRISE CLIENTS (LEFT TO RIGHT) */}
        <div className="flex overflow-hidden py-1">
          <div className="animate-marquee gap-3 md:gap-4 items-center">
            {row1Customers.map((item, idx) => (
              <div
                key={`c-${idx}`}
                className="px-5 py-3 rounded-2xl bg-[#0B111E] border border-white/10 text-slate-300 hover:text-white hover:border-[#FF5722]/50 hover:bg-[#FF5722]/5 transition-all text-xs font-bold whitespace-nowrap shadow-sm cursor-default flex items-center gap-2.5 group"
              >
                <span className="w-2 h-2 rounded-full bg-[#FF5722] group-hover:scale-125 transition-transform shadow-[0_0_8px_#FF5722]" />
                <span>{item.name}</span>
                {item.industry && (
                  <span className="text-[10px] text-slate-500 font-normal">({item.industry})</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ROW 2: 9 STRATEGIC PARTNERS (RIGHT TO LEFT) */}
        <div className="flex overflow-hidden py-1">
          <div className="animate-marquee-reverse gap-3 md:gap-4 items-center">
            {row2Partners.map((item, idx) => (
              <div
                key={`p-${idx}`}
                className="px-5 py-3 rounded-2xl bg-[#0B111E] border border-white/10 text-slate-300 hover:text-[#00E5FF] hover:border-[#00E5FF]/50 hover:bg-[#00E5FF]/5 transition-all text-xs font-bold whitespace-nowrap shadow-sm cursor-default flex items-center gap-2.5 group"
              >
                <span className="w-2 h-2 rounded-full bg-[#00E5FF] group-hover:scale-125 transition-transform shadow-[0_0_8px_#00E5FF]" />
                <span>{item.name}</span>
                {item.industry && (
                  <span className="text-[10px] text-slate-500 font-normal">({item.industry})</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
