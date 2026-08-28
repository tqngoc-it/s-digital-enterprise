import Link from 'next/link';
import { Flame, ArrowUp, Mail, Phone, MapPin, Clock } from 'lucide-react';
import { FALLBACK_COMPANY, CompanyInfo } from '@/lib/fallbackData';

interface FooterProps {
  companyInfo?: Partial<CompanyInfo>;
}

export default function Footer({ companyInfo }: FooterProps) {
  const companyName = companyInfo?.company_name || FALLBACK_COMPANY.company_name;
  const address = companyInfo?.address || FALLBACK_COMPANY.address;
  const contactEmail = companyInfo?.contact_email || FALLBACK_COMPANY.contact_email;
  const contactPhone = companyInfo?.contact_phone || FALLBACK_COMPANY.contact_phone;
  const copyrightText = companyInfo?.copyright_text || FALLBACK_COMPANY.copyright_text;

  return (
    <footer className="border-t border-white/10 bg-[#04060C] text-xs text-slate-400 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
          {/* COL 1: BRAND INFO (5 COLS) */}
          <div className="lg:col-span-5 space-y-4">
            <Link href="#home" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF5722] to-orange-600 flex items-center justify-center font-black text-lg text-white shadow-lg shadow-[#FF5722]/30">
                S
              </div>
              <div className="flex flex-col">
                <span className="font-black text-base tracking-wider text-white flex items-center gap-1">
                  S-DIGITAL
                  <Flame className="w-3.5 h-3.5 text-[#FF5722]" />
                </span>
                <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">
                  Media & Sports Solutions
                </span>
              </div>
            </Link>
            <p className="text-slate-400 leading-relaxed text-xs max-w-sm">
              {companyName} - Tổ hợp tiếp thị số đa kênh và giải pháp tổ chức giải đấu thể thao chuyên nghiệp hàng đầu Việt Nam.
            </p>
            <p className="text-[11px] text-slate-500 font-mono">
              MST: 0317589920 · Giấy phép ĐKKD cấp bởi Sở KH&ĐT TP.HCM
            </p>
          </div>

          {/* COL 2: QUICK NAVIGATION (3 COLS) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Hệ Sinh Thái</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#about" className="hover:text-[#FF5722] transition-colors">
                  Về chúng tôi
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-[#FF5722] transition-colors">
                  Marketing Số (Digital Suite)
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-[#FF5722] transition-colors">
                  Tiếp Thị Thể Thao (Sports Hub)
                </a>
              </li>
              <li>
                <a href="#why-us" className="hover:text-[#FF5722] transition-colors">
                  Xử lý khủng hoảng 30 phút
                </a>
              </li>
              <li>
                <a href="#customers" className="hover:text-[#FF5722] transition-colors">
                  Khách hàng & Đối tác
                </a>
              </li>
              <li>
                <a href="#solutions" className="hover:text-[#FF5722] transition-colors">
                  Dự án tiêu biểu
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-[#FF5722] transition-colors">
                  Bảng giá dịch vụ
                </a>
              </li>
              <li>
                <a href="#blog" className="hover:text-[#FF5722] transition-colors">
                  Tin tức & Xu hướng
                </a>
              </li>
            </ul>
          </div>

          {/* COL 3: CONTACT & HEADQUARTER (4 COLS) */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Thông Tin Liên Hệ</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#FF5722] shrink-0 mt-0.5" />
                <span className="leading-relaxed">{address}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#FF5722] shrink-0" />
                <span className="text-white font-bold">{contactPhone}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#FF5722] shrink-0" />
                <span>{contactEmail}</span>
              </div>
              <div className="flex items-start gap-2.5 pt-1 text-slate-500">
                <Clock className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <span>Thứ 2 - Thứ 6: 8:00 - 18:00 | Thứ 7: 8:00 - 12:00</span>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM COPYRIGHT */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>{copyrightText}</p>
          <a
            href="#home"
            className="flex items-center gap-1.5 hover:text-[#FF5722] transition-colors group cursor-pointer"
          >
            <span>Về đầu trang</span>
            <ArrowUp className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
        </div>
      </div>
    </footer>
  );
}
