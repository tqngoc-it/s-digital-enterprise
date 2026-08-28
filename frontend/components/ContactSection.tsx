import ContactForm from './ContactForm';
import { MapPin, Phone, Mail, Clock, ShieldCheck, Sparkles, Headphones } from 'lucide-react';
import { FALLBACK_COMPANY, CompanyInfo } from '@/lib/fallbackData';

interface ContactSectionProps {
  companyInfo?: Partial<CompanyInfo>;
}

export default function ContactSection({ companyInfo }: ContactSectionProps) {
  const address = companyInfo?.address || FALLBACK_COMPANY.address;
  const contactEmail = companyInfo?.contact_email || FALLBACK_COMPANY.contact_email;
  const contactPhone = companyInfo?.contact_phone || FALLBACK_COMPANY.contact_phone;
  const workingHours = companyInfo?.working_hours || FALLBACK_COMPANY.working_hours;

  const contactInfo = [
    {
      title: 'Văn Phòng Trụ Sở Chính',
      content: address,
      subContent: 'Phục vụ tư vấn và tiếp đón khách hàng',
      icon: MapPin,
    },
    {
      title: 'Hotline Tư Vấn Trực Tiếp',
      content: contactPhone,
      subContent: 'Hỗ trợ tư vấn giải pháp 24/7',
      icon: Phone,
    },
    {
      title: 'Email Doanh Nghiệp',
      content: contactEmail,
      subContent: 'Phản hồi trong vòng 2 giờ làm việc',
      icon: Mail,
    },
    {
      title: 'Thời Gian Làm Việc',
      content: workingHours.weekday,
      subContent: workingHours.weekend,
      icon: Clock,
    },
  ];

  return (
    <section id="contact" className="py-20 md:py-28 max-w-7xl mx-auto px-4 sm:px-6 relative border-t border-white/5">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* LEFT COLUMN: INFO */}
        <div className="lg:col-span-5 space-y-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FF5722]/10 border border-[#FF5722]/20 text-[#FF5722] text-xs font-mono font-bold">
              <Headphones className="w-3.5 h-3.5" />
              <span>GET IN TOUCH WITH US</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight">
              Sẵn Sàng Bứt Phá Doanh Thu Cùng S-Digital?
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Đội ngũ chuyên gia chiến lược của S-Digital sẵn sàng lắng nghe và xây dựng kế hoạch truyền thông, marketing & giải pháp thể thao phù hợp nhất cho thương hiệu của bạn.
            </p>
          </div>

          <div className="space-y-4 text-xs text-slate-300">
            {contactInfo.map((info, idx) => {
              const Icon = info.icon;
              return (
                <div
                  key={idx}
                  className="flex items-start gap-4 p-4 rounded-2xl bg-[#0B111E] border border-white/10 hover:border-[#FF5722]/40 transition-all group"
                >
                  <div className="w-11 h-11 rounded-xl bg-[#FF5722]/10 border border-[#FF5722]/20 flex items-center justify-center text-[#FF5722] shrink-0 group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-white text-xs">{info.title}</h4>
                    <p className="text-slate-200 font-medium">{info.content}</p>
                    {info.subContent && (
                      <p className="text-slate-500 text-[11px]">{info.subContent}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-3 text-xs text-slate-400">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>Cam kết bảo mật 100% dữ liệu dự án và thông tin đối tác theo tiêu chuẩn NDA.</span>
          </div>
        </div>

        {/* RIGHT COLUMN: CLIENT FORM */}
        <div className="lg:col-span-7">
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
