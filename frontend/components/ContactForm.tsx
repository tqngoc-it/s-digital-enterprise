'use client';

import { useState, useEffect } from 'react';
import { Send, Loader2, CheckCircle2, AlertCircle, X, Sparkles } from 'lucide-react';

const VN_PHONE_REGEX = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form field state for real-time 2-way client validation
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('sports_entertainment');
  const [companySize, setCompanySize] = useState('20_100');
  const [budget, setBudget] = useState('50m_100m');
  const [timeline, setTimeline] = useState('urgent_this_month');
  const [message, setMessage] = useState('');

  // Per-field validation errors
  const [fieldErrors, setFieldErrors] = useState<{
    fullName?: string;
    email?: string;
    phone?: string;
    message?: string;
  }>({});

  // Robust Mapping Helpers: Chuẩn hóa dữ liệu B2B sang đúng giá trị enum của ContactForm
  function mapToIndustryValue(val?: string, contextText?: string): string {
    const trimmed = String(val || '').trim();
    const valid = ['sports_entertainment', 'fnb', 'real_estate', 'retail_ecommerce', 'tech_services', 'other'];
    if (valid.includes(trimmed)) {
      if (trimmed === 'other' && contextText) {
        const lowerCtx = contextText.toLowerCase();
        if (
          lowerCtx.includes('website') ||
          lowerCtx.includes('landing page') ||
          lowerCtx.includes('công nghệ') ||
          lowerCtx.includes('phần mềm') ||
          lowerCtx.includes('ux') ||
          lowerCtx.includes('cro') ||
          lowerCtx.includes('dịch vụ số')
        ) {
          return 'tech_services';
        }
      }
      return trimmed;
    }

    const lower = `${trimmed} ${contextText || ''}`.toLowerCase();
    if (
      lower.includes('bán lẻ') ||
      lower.includes('e-commerce') ||
      lower.includes('retail') ||
      lower.includes('tmđt') ||
      lower.includes('thương mại điện tử') ||
      lower.includes('chuỗi cửa hàng') ||
      lower.includes('tiêu dùng')
    ) {
      return 'retail_ecommerce';
    }
    if (
      lower.includes('công nghệ') ||
      lower.includes('khởi nghiệp') ||
      lower.includes('tech') ||
      lower.includes('phần mềm') ||
      lower.includes('software') ||
      lower.includes('website') ||
      lower.includes('landing page') ||
      lower.includes('web') ||
      lower.includes('cro') ||
      lower.includes('ux') ||
      lower.includes('dịch vụ số')
    ) {
      return 'tech_services';
    }
    if (
      lower.includes('thể thao') ||
      lower.includes('sự kiện') ||
      lower.includes('giải đấu') ||
      lower.includes('sports') ||
      lower.includes('marathon')
    ) {
      return 'sports_entertainment';
    }
    if (
      lower.includes('bán lẻ') ||
      lower.includes('e-commerce') ||
      lower.includes('retail') ||
      lower.includes('chuỗi cửa hàng') ||
      lower.includes('tiêu dùng')
    ) {
      return 'retail_ecommerce';
    }
    if (
      lower.includes('f&b') ||
      lower.includes('ẩm thực') ||
      lower.includes('nhà hàng') ||
      lower.includes('đồ uống') ||
      lower.includes('quán café') ||
      lower.includes('coffee')
    ) {
      return 'fnb';
    }
    if (
      lower.includes('bất động sản') ||
      lower.includes('địa ốc') ||
      lower.includes('tài chính') ||
      lower.includes('ngân hàng') ||
      lower.includes('real_estate')
    ) {
      return 'real_estate';
    }
    return 'other';
  }

  function mapToBudgetValue(val?: string): string {
    if (!val) return '50m_100m';
    const trimmed = String(val).trim();
    const valid = ['under_20m', '20m_50m', '50m_100m', 'above_100m'];
    if (valid.includes(trimmed)) return trimmed;

    const lower = trimmed.toLowerCase();
    if (
      lower.includes('dưới 20') ||
      lower.includes('< 20') ||
      lower.includes('<20') ||
      lower.includes('under_20') ||
      lower.includes('15.000.000') ||
      lower.includes('15 triệu')
    ) {
      return 'under_20m';
    }
    if (
      lower.includes('trên 100') ||
      lower.includes('> 100') ||
      lower.includes('>100') ||
      lower.includes('above_100')
    ) {
      return 'above_100m';
    }
    if (
      (lower.includes('20') && lower.includes('50')) ||
      lower.includes('20 - 50') ||
      lower.includes('20-50') ||
      lower.includes('20m_50m') ||
      lower.includes('35.000.000') ||
      lower.includes('35 triệu')
    ) {
      return '20m_50m';
    }
    if (
      (lower.includes('50') && lower.includes('100')) ||
      lower.includes('50 - 100') ||
      lower.includes('50-100') ||
      lower.includes('50m_100m')
    ) {
      return '50m_100m';
    }
    return '20m_50m';
  }

  function mapToCompanySizeValue(val?: string): string {
    if (!val) return '20_100';
    const trimmed = String(val).trim();
    const valid = ['under_20', '20_100', 'above_100'];
    if (valid.includes(trimmed)) return trimmed;

    const lower = trimmed.toLowerCase();
    if (
      lower.includes('dưới 20') ||
      lower.includes('< 20') ||
      lower.includes('<20') ||
      lower.includes('under_20') ||
      lower.includes('nhỏ') ||
      lower.includes('startup')
    ) {
      return 'under_20';
    }
    if (
      lower.includes('trên 100') ||
      lower.includes('> 100') ||
      lower.includes('>100') ||
      lower.includes('above_100') ||
      lower.includes('lớn') ||
      lower.includes('tập đoàn')
    ) {
      return 'above_100';
    }
    if (
      lower.includes('20 - 100') ||
      lower.includes('20-100') ||
      lower.includes('20_100')
    ) {
      return '20_100';
    }
    return '20_100';
  }

  function mapToTimelineValue(val?: string): string {
    if (!val) return 'urgent_this_month';
    const trimmed = String(val).trim();
    const valid = ['urgent_this_month', 'next_1_3_months', 'exploring'];
    if (valid.includes(trimmed)) return trimmed;

    const lower = trimmed.toLowerCase();
    if (
      lower.includes('gấp') ||
      lower.includes('trong tháng') ||
      lower.includes('ngay') ||
      lower.includes('urgent') ||
      lower.includes('khẩn cấp') ||
      lower.includes('30 phút')
    ) {
      return 'urgent_this_month';
    }
    if (
      lower.includes('1 - 3') ||
      lower.includes('1-3') ||
      lower.includes('1_3') ||
      lower.includes('tháng tới') ||
      lower.includes('tuần')
    ) {
      return 'next_1_3_months';
    }
    if (
      lower.includes('khảo sát') ||
      lower.includes('ý tưởng') ||
      lower.includes('exploring') ||
      lower.includes('tìm hiểu')
    ) {
      return 'exploring';
    }
    return 'urgent_this_month';
  }

  // Lắng nghe sự kiện đồng bộ từ ServiceRecommendationWizard (prefill_lead_form & sdigital:apply-recommendation)
  useEffect(() => {
    const handlePrefill = (event: CustomEvent<any> | Event) => {
      const customEvent = event as CustomEvent<any>;
      const data = customEvent.detail;
      if (!data) return;

      if (data.message) {
        setMessage(data.message);
        setFieldErrors((prev) => ({ ...prev, message: undefined }));
      }
      if (data.industry) {
        setIndustry(mapToIndustryValue(data.industry, data.message));
      }
      if (data.company_size || data.companySize) {
        setCompanySize(mapToCompanySizeValue(data.company_size || data.companySize));
      }
      if (data.budget) {
        setBudget(mapToBudgetValue(data.budget));
      }
      if (data.timeline) {
        setTimeline(mapToTimelineValue(data.timeline));
      }
    };

    window.addEventListener('prefill_lead_form', handlePrefill as EventListener);
    window.addEventListener('sdigital:apply-recommendation', handlePrefill as EventListener);
    return () => {
      window.removeEventListener('prefill_lead_form', handlePrefill as EventListener);
      window.removeEventListener('sdigital:apply-recommendation', handlePrefill as EventListener);
    };
  }, []);

  function validateFullName(val: string): string | undefined {
    if (!val.trim()) return 'Vui lòng nhập họ và tên của bạn.';
    return undefined;
  }

  function validateEmail(val: string): string | undefined {
    if (!val.trim()) return 'Vui lòng nhập địa chỉ email.';
    if (!EMAIL_REGEX.test(val.trim())) {
      return 'Email không đúng định dạng (VD: example@domain.com).';
    }
    return undefined;
  }

  function validatePhone(val: string): string | undefined {
    if (!val.trim()) return undefined; // Tùy chọn, nhưng nếu nhập thì phải chuẩn
    const cleanPhone = val.replace(/[\s.-]/g, '').replace(/^\+/, '');
    if (!VN_PHONE_REGEX.test(cleanPhone)) {
      return 'Số điện thoại không hợp lệ (yêu cầu số ĐT Việt Nam 10 chữ số: 09x, 08x, 03x, 05x, 07x hoặc +84).';
    }
    return undefined;
  }

  function validateMessage(val: string): string | undefined {
    if (!val.trim()) return 'Vui lòng nhập nội dung yêu cầu tư vấn.';
    if (val.trim().length < 5) return 'Nội dung yêu cầu tư vấn tối thiểu 5 ký tự.';
    return undefined;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage(null);

    // Validate all fields
    const nameErr = validateFullName(fullName);
    const emailErr = validateEmail(email);
    const phoneErr = validatePhone(phone);
    const msgErr = validateMessage(message);

    const errors = {
      fullName: nameErr,
      email: emailErr,
      phone: phoneErr,
      message: msgErr,
    };

    setFieldErrors(errors);

    if (nameErr || emailErr || phoneErr || msgErr) {
      setErrorMessage('Vui lòng kiểm tra và sửa các thông tin chưa chính xác bên dưới.');
      return;
    }

    setIsSubmitting(true);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      const cleanPhone = phone.trim() ? phone.trim().replace(/[\s.-]/g, '').replace(/^\+/, '') : undefined;

      const res = await fetch(`${backendUrl}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName.trim(),
          email: email.trim(),
          phone: cleanPhone,
          company_name: companyName.trim() || undefined,
          industry,
          company_size: companySize,
          budget,
          timeline,
          message: message.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok && data?.success) {
        setSuccess(true);
        setShowSuccessModal(true);
        // Reset form
        setFullName('');
        setEmail('');
        setPhone('');
        setCompanyName('');
        setIndustry('sports_entertainment');
        setCompanySize('20_100');
        setBudget('50m_100m');
        setTimeline('urgent_this_month');
        setMessage('');
        setFieldErrors({});
      } else {
        setErrorMessage(
          Array.isArray(data?.message)
            ? data.message.join(', ')
            : data?.message || data?.error || 'Không thể gửi thông tin. Vui lòng thử lại sau.'
        );
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Đã có lỗi xảy ra. Vui lòng kiểm tra kết nối mạng.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <div id="contact-form" className="p-8 md:p-10 rounded-3xl bg-white dark:bg-[#0B111E] border border-slate-200 dark:border-white/10 space-y-6 shadow-xl shadow-slate-200/50 dark:shadow-2xl relative scroll-mt-24 transition-colors">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF5722]/10 border border-[#FF5722]/20 text-[#FF5722] text-[11px] font-mono font-bold">
            <Sparkles className="w-3 h-3" />
            <span>TƯ VẤN 1:1 MIỄN PHÍ</span>
          </div>
          <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">Gửi Yêu Cầu Tư Vấn</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Điền thông tin bên dưới và chuyên viên chiến lược S-Digital sẽ liên hệ lại trực tiếp trong vòng 24 giờ.
          </p>
        </div>

        {/* INLINE SUCCESS NOTIFICATION */}
        {success && (
          <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-start gap-3 text-emerald-600 dark:text-emerald-400 text-xs animate-in fade-in duration-200">
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">Gửi thông tin thành công!</p>
              <p className="text-emerald-700/90 dark:text-emerald-300/90 leading-relaxed">
                Cảm ơn bạn đã liên hệ. Chuyên viên S-Digital sẽ phản hồi sớm nhất qua Email và Số điện thoại bạn cung cấp.
              </p>
            </div>
          </div>
        )}

        {/* ERROR NOTIFICATION */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-start gap-3 text-red-600 dark:text-red-400 text-xs animate-in fade-in duration-200">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{errorMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4 text-xs">
          {/* HỌ VÀ TÊN & DOANH NGHIỆP */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 dark:text-slate-400 font-bold mb-1.5 uppercase tracking-wider text-[11px]">
                Họ và tên <span className="text-[#FF5722]">*</span>
              </label>
              <input
                type="text"
                name="full_name"
                required
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (fieldErrors.fullName) {
                    setFieldErrors((prev) => ({ ...prev, fullName: validateFullName(e.target.value) }));
                  }
                }}
                onBlur={(e) => {
                  setFieldErrors((prev) => ({ ...prev, fullName: validateFullName(e.target.value) }));
                }}
                placeholder="Nguyễn Văn A"
                className={`w-full p-3.5 rounded-xl bg-slate-50 dark:bg-[#060913] border text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none transition-colors ${
                  fieldErrors.fullName
                    ? 'border-red-500/70 focus:border-red-500 bg-red-500/[0.02]'
                    : 'border-slate-200 dark:border-white/10 focus:border-[#FF5722]'
                }`}
              />
              {fieldErrors.fullName && (
                <p className="text-red-500 dark:text-red-400 text-[11px] mt-1.5 flex items-center gap-1 animate-in fade-in duration-150">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{fieldErrors.fullName}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-400 font-bold mb-1.5 uppercase tracking-wider text-[11px]">
                Doanh nghiệp / Tổ chức
              </label>
              <input
                type="text"
                name="company_name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Tên công ty / Câu lạc bộ"
                className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-[#060913] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-[#FF5722] transition-colors"
              />
            </div>
          </div>

          {/* EMAIL & SĐT */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 dark:text-slate-400 font-bold mb-1.5 uppercase tracking-wider text-[11px]">
                Email <span className="text-[#FF5722]">*</span>
              </label>
              <input
                type="email"
                name="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) {
                    setFieldErrors((prev) => ({ ...prev, email: validateEmail(e.target.value) }));
                  }
                }}
                onBlur={(e) => {
                  setFieldErrors((prev) => ({ ...prev, email: validateEmail(e.target.value) }));
                }}
                placeholder="email@example.com"
                className={`w-full p-3.5 rounded-xl bg-slate-50 dark:bg-[#060913] border text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none transition-colors ${
                  fieldErrors.email
                    ? 'border-red-500/70 focus:border-red-500 bg-red-500/[0.02]'
                    : 'border-slate-200 dark:border-white/10 focus:border-[#FF5722]'
                }`}
              />
              {fieldErrors.email && (
                <p className="text-red-500 dark:text-red-400 text-[11px] mt-1.5 flex items-center gap-1 animate-in fade-in duration-150">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{fieldErrors.email}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-400 font-bold mb-1.5 uppercase tracking-wider text-[11px]">
                Số điện thoại (Việt Nam)
              </label>
              <input
                type="tel"
                name="phone"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (fieldErrors.phone) {
                    setFieldErrors((prev) => ({ ...prev, phone: validatePhone(e.target.value) }));
                  }
                }}
                onBlur={(e) => {
                  setFieldErrors((prev) => ({ ...prev, phone: validatePhone(e.target.value) }));
                }}
                placeholder="0933 798 609 hoặc +84..."
                className={`w-full p-3.5 rounded-xl bg-slate-50 dark:bg-[#060913] border text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none transition-colors ${
                  fieldErrors.phone
                    ? 'border-red-500/70 focus:border-red-500 bg-red-500/[0.02]'
                    : 'border-slate-200 dark:border-white/10 focus:border-[#FF5722]'
                }`}
              />
              {fieldErrors.phone && (
                <p className="text-red-500 dark:text-red-400 text-[11px] mt-1.5 flex items-center gap-1 animate-in fade-in duration-150">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{fieldErrors.phone}</span>
                </p>
              )}
            </div>
          </div>

          {/* PHÂN LOẠI KHÁCH HÀNG B2B: NGÀNH NGHỀ & QUY MÔ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 dark:text-slate-400 font-bold mb-1.5 uppercase tracking-wider text-[11px]">
                Ngành nghề hoạt động
              </label>
              <select
                name="industry"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-[#060913] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-[#FF5722] transition-colors cursor-pointer"
              >
                <option value="sports_entertainment" className="bg-white dark:bg-[#0B111E] text-slate-900 dark:text-white">Thể thao & Sự kiện</option>
                <option value="fnb" className="bg-white dark:bg-[#0B111E] text-slate-900 dark:text-white">F&B (Ẩm thực & Đồ uống)</option>
                <option value="real_estate" className="bg-white dark:bg-[#0B111E] text-slate-900 dark:text-white">Bất động sản</option>
                <option value="retail_ecommerce" className="bg-white dark:bg-[#0B111E] text-slate-900 dark:text-white">Bán lẻ & E-commerce</option>
                <option value="tech_services" className="bg-white dark:bg-[#0B111E] text-slate-900 dark:text-white">Công nghệ & Dịch vụ</option>
                <option value="other" className="bg-white dark:bg-[#0B111E] text-slate-900 dark:text-white">Khác</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-400 font-bold mb-1.5 uppercase tracking-wider text-[11px]">
                Quy mô doanh nghiệp
              </label>
              <select
                name="company_size"
                value={companySize}
                onChange={(e) => setCompanySize(e.target.value)}
                className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-[#060913] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-[#FF5722] transition-colors cursor-pointer"
              >
                <option value="under_20" className="bg-white dark:bg-[#0B111E] text-slate-900 dark:text-white">Dưới 20 nhân sự</option>
                <option value="20_100" className="bg-white dark:bg-[#0B111E] text-slate-900 dark:text-white">20 - 100 nhân sự</option>
                <option value="above_100" className="bg-white dark:bg-[#0B111E] text-slate-900 dark:text-white">Trên 100 nhân sự</option>
              </select>
            </div>
          </div>

          {/* PHÂN LOẠI KHÁCH HÀNG B2B: NGÂN SÁCH & THỜI GIAN */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 dark:text-slate-400 font-bold mb-1.5 uppercase tracking-wider text-[11px]">
                Ngân sách dự kiến
              </label>
              <select
                name="budget"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-[#060913] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-[#FF5722] transition-colors cursor-pointer"
              >
                <option value="under_20m" className="bg-white dark:bg-[#0B111E] text-slate-900 dark:text-white">Dưới 20 triệu</option>
                <option value="20m_50m" className="bg-white dark:bg-[#0B111E] text-slate-900 dark:text-white">20 - 50 triệu</option>
                <option value="50m_100m" className="bg-white dark:bg-[#0B111E] text-slate-900 dark:text-white">50 - 100 triệu</option>
                <option value="above_100m" className="bg-white dark:bg-[#0B111E] text-slate-900 dark:text-white">Trên 100 triệu</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-400 font-bold mb-1.5 uppercase tracking-wider text-[11px]">
                Thời gian triển khai
              </label>
              <select
                name="timeline"
                value={timeline}
                onChange={(e) => setTimeline(e.target.value)}
                className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-[#060913] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-[#FF5722] transition-colors cursor-pointer"
              >
                <option value="urgent_this_month" className="bg-white dark:bg-[#0B111E] text-slate-900 dark:text-white">Cần triển khai gấp trong tháng</option>
                <option value="next_1_3_months" className="bg-white dark:bg-[#0B111E] text-slate-900 dark:text-white">Trong 1 - 3 tháng tới</option>
                <option value="exploring" className="bg-white dark:bg-[#0B111E] text-slate-900 dark:text-white">Đang khảo sát ý tưởng</option>
              </select>
            </div>
          </div>

          {/* LỜI NHẮN */}
          <div>
            <label className="block text-slate-700 dark:text-slate-400 font-bold mb-1.5 uppercase tracking-wider text-[11px]">
              Nhu cầu tư vấn / Lời nhắn <span className="text-[#FF5722]">*</span>
            </label>
            <textarea
              id="contact-message-input"
              name="message"
              rows={4}
              required
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                if (fieldErrors.message) {
                  setFieldErrors((prev) => ({ ...prev, message: validateMessage(e.target.value) }));
                }
              }}
              onBlur={(e) => {
                setFieldErrors((prev) => ({ ...prev, message: validateMessage(e.target.value) }));
              }}
              placeholder="Tôi muốn nhận tư vấn chiến lược quảng cáo đa kênh, booking KOLs hoặc tổ chức giải chạy marathon doanh nghiệp..."
              className={`w-full p-3.5 rounded-xl bg-slate-50 dark:bg-[#060913] border text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none transition-colors resize-none ${
                fieldErrors.message
                  ? 'border-red-500/70 focus:border-red-500 bg-red-500/[0.02]'
                  : 'border-slate-200 dark:border-white/10 focus:border-[#FF5722]'
              }`}
            />
            {fieldErrors.message && (
              <p className="text-red-500 dark:text-red-400 text-[11px] mt-1.5 flex items-center gap-1 animate-in fade-in duration-150">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{fieldErrors.message}</span>
              </p>
            )}
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-xl bg-[#FF5722] hover:bg-orange-600 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#FF5722]/30 cursor-pointer disabled:cursor-not-allowed hover:scale-[1.01]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang gửi thông tin...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Gửi Yêu Cầu Tư Vấn Ngay ↗</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* SUCCESS POPUP MODAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="max-w-md w-full p-8 rounded-3xl bg-white dark:bg-[#0B111E] border border-emerald-500/30 space-y-6 text-center shadow-2xl relative">
            <button
              onClick={() => setShowSuccessModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
              aria-label="Đóng"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-16 h-16 rounded-3xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-500 dark:text-emerald-400">
              <CheckCircle2 className="w-8 h-8 animate-bounce" />
            </div>

            <div className="space-y-2">
              <h4 className="text-xl font-black text-slate-900 dark:text-white">Tiếp Nhận Thành Công!</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Yêu cầu tư vấn của bạn đã được chuyển đến bộ phận chuyên trách S-Digital. Chúng tôi sẽ liên hệ lại trực tiếp với bạn trong thời gian sớm nhất.
              </p>
            </div>

            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              Hoàn Tất & Đóng
            </button>
          </div>
        </div>
      )}
    </>
  );
}
