'use client';

import { useState, useEffect } from 'react';
import { submitLeadAction } from '@/app/actions/leads';
import { Send, Loader2, CheckCircle2, AlertCircle, X, Sparkles } from 'lucide-react';

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
  const [message, setMessage] = useState('');

  // Lắng nghe gợi ý từ AI ServiceRecommendationWizard
  useEffect(() => {
    const handleApplyRecommendation = (e: any) => {
      if (e.detail?.message) {
        setMessage(e.detail.message);
      }
    };
    window.addEventListener('sdigital:apply-recommendation', handleApplyRecommendation);
    return () => {
      window.removeEventListener('sdigital:apply-recommendation', handleApplyRecommendation);
    };
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage(null);

    // Client-side quick checks
    if (!fullName.trim()) {
      setErrorMessage('Vui lòng nhập họ và tên.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Vui lòng nhập địa chỉ email hợp lệ.');
      return;
    }
    if (!message.trim() || message.trim().length < 5) {
      setErrorMessage('Vui lòng nhập nội dung lời nhắn (tối thiểu 5 ký tự).');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('full_name', fullName.trim());
      formData.append('email', email.trim());
      formData.append('phone', phone.trim());
      formData.append('company_name', companyName.trim());
      formData.append('message', message.trim());

      const res = await submitLeadAction(formData);

      if (res?.success) {
        setSuccess(true);
        setShowSuccessModal(true);
        // Reset form
        setFullName('');
        setEmail('');
        setPhone('');
        setCompanyName('');
        setMessage('');
      } else {
        setErrorMessage(res?.error || 'Không thể gửi thông tin. Vui lòng thử lại sau.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Đã có lỗi xảy ra. Vui lòng kiểm tra kết nối mạng.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <div id="contact-form" className="p-8 md:p-10 rounded-3xl bg-[#0B111E] border border-white/10 space-y-6 shadow-2xl relative scroll-mt-24">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF5722]/10 border border-[#FF5722]/20 text-[#FF5722] text-[11px] font-mono font-bold">
            <Sparkles className="w-3 h-3" />
            <span>TƯ VẤN 1:1 MIỄN PHÍ</span>
          </div>
          <h3 className="text-xl md:text-2xl font-black text-white">Gửi Yêu Cầu Tư Vấn</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Điền thông tin bên dưới và chuyên viên chiến lược S-Digital sẽ liên hệ lại trực tiếp trong vòng 24 giờ.
          </p>
        </div>

        {/* INLINE SUCCESS NOTIFICATION */}
        {success && (
          <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-start gap-3 text-emerald-400 text-xs animate-in fade-in duration-200">
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">Gửi thông tin thành công!</p>
              <p className="text-emerald-300/90 leading-relaxed">
                Cảm ơn bạn đã liên hệ. Chuyên viên S-Digital sẽ phản hồi sớm nhất qua Email và Số điện thoại bạn cung cấp.
              </p>
            </div>
          </div>
        )}

        {/* ERROR NOTIFICATION */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-start gap-3 text-red-400 text-xs animate-in fade-in duration-200">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{errorMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* HỌ VÀ TÊN & DOANH NGHIỆP */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 font-bold mb-1.5 uppercase tracking-wider text-[11px]">
                Họ và tên <span className="text-[#FF5722]">*</span>
              </label>
              <input
                type="text"
                name="full_name"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="w-full p-3.5 rounded-xl bg-[#060913] border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-[#FF5722] transition-colors"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1.5 uppercase tracking-wider text-[11px]">
                Doanh nghiệp / Tổ chức
              </label>
              <input
                type="text"
                name="company_name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Tên công ty / Câu lạc bộ"
                className="w-full p-3.5 rounded-xl bg-[#060913] border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-[#FF5722] transition-colors"
              />
            </div>
          </div>

          {/* EMAIL & SĐT */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 font-bold mb-1.5 uppercase tracking-wider text-[11px]">
                Email <span className="text-[#FF5722]">*</span>
              </label>
              <input
                type="email"
                name="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full p-3.5 rounded-xl bg-[#060913] border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-[#FF5722] transition-colors"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1.5 uppercase tracking-wider text-[11px]">
                Số điện thoại
              </label>
              <input
                type="tel"
                name="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0826 868 979"
                className="w-full p-3.5 rounded-xl bg-[#060913] border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-[#FF5722] transition-colors"
              />
            </div>
          </div>

          {/* LỜI NHẮN */}
          <div>
            <label className="block text-slate-400 font-bold mb-1.5 uppercase tracking-wider text-[11px]">
              Nhu cầu tư vấn / Lời nhắn <span className="text-[#FF5722]">*</span>
            </label>
            <textarea
              id="contact-message-input"
              name="message"
              rows={4}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tôi muốn nhận tư vấn chiến lược quảng cáo đa kênh, booking KOLs hoặc tổ chức giải chạy marathon doanh nghiệp..."
              className="w-full p-3.5 rounded-xl bg-[#060913] border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-[#FF5722] transition-colors resize-none"
            />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="max-w-md w-full p-8 rounded-3xl bg-[#0B111E] border border-emerald-500/30 space-y-6 text-center shadow-2xl relative">
            <button
              onClick={() => setShowSuccessModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
              aria-label="Đóng"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-16 h-16 rounded-3xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-8 h-8 animate-bounce" />
            </div>

            <div className="space-y-2">
              <h4 className="text-xl font-black text-white">Tiếp Nhận Thành Công!</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Yêu cầu tư vấn của bạn đã được chuyển đến bộ phận chuyên trách S-Digital. Chúng tôi sẽ liên hệ lại trực tiếp với bạn trong thời gian sớm nhất.
              </p>
            </div>

            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-emerald-500/20"
            >
              Hoàn Tất & Đóng
            </button>
          </div>
        </div>
      )}
    </>
  );
}
