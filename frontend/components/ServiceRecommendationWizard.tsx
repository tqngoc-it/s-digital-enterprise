'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  ArrowRight,
  ArrowLeft,
  Compass,
  Sparkles,
  Check,
  CheckCircle2,
  Clock,
  Layers,
  Target,
  Briefcase,
  DollarSign,
  Building2,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';

export interface RecommendationData {
  recommendedPlan: string;
  estimatedBudget: string;
  analysis: string;
  keyDeliverables: string[];
  timeline: string;
  suggestedServices: string[];
}

const INDUSTRIES = [
  { id: 'fnb_retail', label: 'F&B, Bán Lẻ & Chuỗi Cửa Hàng', desc: 'Nhà hàng, thời trang, tiêu dùng nhanh' },
  { id: 'sports_events', label: 'Thể Thao, Sự Kiện & Giải Đấu', desc: 'Giải chạy marathon, bóng đá, Olympic nội bộ' },
  { id: 'b2b_mfg', label: 'Doanh Nghiệp B2B & Sản Xuất', desc: 'Công nghiệp, xuất nhập khẩu, giải pháp kỹ thuật' },
  { id: 'finance_realestate', label: 'Tài Chính, Ngân Hàng & Bất Động Sản', desc: 'Quỹ đầu tư, sàn môi giới, dịch vụ tài chính' },
  { id: 'tech_ecommerce', label: 'Công Nghệ, TMĐT & Khởi Nghiệp', desc: 'Phần mềm, ứng dụng, sàn thương mại điện tử' },
  { id: 'other', label: 'Lĩnh Vực & Ngành Nghề Khác', desc: 'Tư vấn chiến lược may đo theo đặc thù riêng' },
];

const GOALS = [
  { id: 'sales_roi', label: 'Tăng Trưởng Doanh Số & Tối Ưu ROI', desc: 'Đẩy mạnh đơn hàng qua Google, Meta và TikTok Ads' },
  { id: 'brand_awareness', label: 'Gia Tăng Nhận Diện Thương Hiệu Đa Kênh', desc: 'Booking KOLs/KOCs, viral clips và phủ sóng truyền thông' },
  { id: 'sports_referee', label: 'Tổ Chức Giải Chạy Marathon / Thuê Trọng Tài', desc: 'Hệ thống timing chip AIMS, điều hành 100+ trọng tài quốc tế' },
  { id: 'crisis_management', label: 'Xử Lý Khủng Hoảng Truyền Thông Khẩn Cấp', desc: 'Phản ứng nhanh trong 30 phút, dập tắt rủi ro dư luận' },
  { id: 'website_cro', label: 'Thiết Kế Website Chuẩn UX & Tối Ưu Chuyển Đổi', desc: 'Giao diện độc quyền, tốc độ tải trang cao và tối ưu SEO' },
];

const BUDGETS = [
  { id: '< 20tr', label: 'Dưới 20 Triệu VNĐ / tháng', desc: 'Phù hợp doanh nghiệp nhỏ & startup mới chuyển đổi số' },
  { id: '20-50tr', label: '20 - 50 Triệu VNĐ / tháng', desc: 'Phổ biến cho doanh nghiệp tăng tốc mở rộng thị phần' },
  { id: '50-100tr', label: '50 - 100 Triệu VNĐ / tháng', desc: 'Đầu tư mạnh mẽ cho chiến dịch đa kênh tích hợp' },
  { id: '> 100tr', label: 'Trên 100 Triệu VNĐ', desc: 'Giải pháp tổng thể Omni-channel hoặc giải đấu thể thao lớn' },
];

interface WizardProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function ServiceRecommendationWizard({
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
}: WizardProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);

  // Cho phép điều khiển từ props hoặc mở bằng custom event toàn cục
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  const handleClose = () => {
    if (controlledOnClose) {
      controlledOnClose();
    } else {
      setInternalIsOpen(false);
    }
  };

  useEffect(() => {
    const handleOpenEvent = () => {
      setInternalIsOpen(true);
    };
    window.addEventListener('sdigital:open-wizard', handleOpenEvent);
    return () => {
      window.removeEventListener('sdigital:open-wizard', handleOpenEvent);
    };
  }, []);

  // Wizard state
  const [step, setStep] = useState<1 | 2 | 3 | 'loading' | 'result'>(1);
  const [selectedIndustry, setSelectedIndustry] = useState(INDUSTRIES[0].label);
  const [selectedGoal, setSelectedGoal] = useState(GOALS[0].label);
  const [selectedBudget, setSelectedBudget] = useState(BUDGETS[1].id);
  const [note, setNote] = useState('');
  const [result, setResult] = useState<RecommendationData | null>(null);
  const [scannerTextIndex, setScannerTextIndex] = useState(0);

  const scannerPhrases = [
    'Hệ thống đang đối chiếu dữ liệu và tính toán phương án tối ưu...',
    'Khoanh vùng bài toán kinh doanh và mục tiêu tăng trưởng...',
    'Đối chiếu ma trận hiệu quả đầu tư thực chiến S-Digital...',
    'Xây dựng kế hoạch thực thi và cam kết đầu việc...',
  ];

  useEffect(() => {
    let interval: any;
    if (step === 'loading') {
      interval = setInterval(() => {
        setScannerTextIndex((prev) => (prev + 1) % scannerPhrases.length);
      }, 700);
    }
    return () => clearInterval(interval);
  }, [step]);

  const handleStartAnalysis = async () => {
    setStep('loading');
    try {
      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          industry: selectedIndustry,
          goal: selectedGoal,
          budget: selectedBudget,
          note: note.trim(),
        }),
      });

      const json = await response.json();
      if (json.success && json.data) {
        setResult(json.data);
      } else {
        throw new Error('Không thể nhận kết quả từ AI');
      }
    } catch (err) {
      console.warn('Fallback recommendation trigger:', err);
      // Fallback an toàn
      setResult({
        recommendedPlan: 'Gói Chuyên Nghiệp (Growth - Đề xuất tối ưu)',
        estimatedBudget: 'Từ 35.000.000 VNĐ / tháng',
        analysis: `Với mục tiêu ${selectedGoal} trong lĩnh vực ${selectedIndustry}, gói giải pháp kết hợp đa kênh giữa quảng cáo tối ưu ROI và sản xuất nội dung video ngắn giúp doanh nghiệp tiếp cận đúng khách hàng tiềm năng và tối ưu chi phí chuyển đổi.`,
        keyDeliverables: [
          'Quảng cáo đa nền tảng Meta, Google & TikTok tối ưu ROAS',
          'Sản xuất 4 video viral ngắn và 1 TVC định kỳ',
          'Booking 3 - 5 KOLs/KOCs theo ngành hàng',
          'Dashboard theo dõi chỉ số realtime 24/7',
        ],
        timeline: '3 - 4 tuần triển khai',
        suggestedServices: [
          'Performance Marketing',
          'Sản xuất Video Viral 4K',
          'Influencer Marketing',
          'Tối ưu Landing Page & SEO',
        ],
      });
    } finally {
      // Đợi hiệu ứng scanner mượt mà
      setTimeout(() => {
        setStep('result');
      }, 900);
    }
  };

  const handleApplyToContactForm = () => {
    if (!result) return;

    const formattedMessage = `[Yêu cầu tư vấn - Đề xuất phương án tối ưu]
- Gói đề xuất: ${result.recommendedPlan}
- Dự toán ngân sách: ${result.estimatedBudget}
- Lĩnh vực hoạt động: ${selectedIndustry}
- Mục tiêu chính: ${selectedGoal}
${note ? `- Ghi chú thêm: ${note}` : ''}
Kính nhờ chuyên viên chiến lược S-Digital liên hệ và gửi bản kế hoạch chi tiết.`;

    // Phát custom event đến ContactForm
    window.dispatchEvent(
      new CustomEvent('sdigital:apply-recommendation', {
        detail: { message: formattedMessage },
      })
    );

    // Đóng modal
    handleClose();

    // Cuộn mượt màn hình tới Form Liên Hệ
    setTimeout(() => {
      const contactEl = document.getElementById('contact-form') || document.getElementById('contact');
      if (contactEl) {
        contactEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 150);
  };

  const handleReset = () => {
    setStep(1);
    setSelectedIndustry(INDUSTRIES[0].label);
    setSelectedGoal(GOALS[0].label);
    setSelectedBudget(BUDGETS[1].id);
    setNote('');
    setResult(null);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wizard-title"
    >
      <div className="relative w-full max-w-2xl bg-[#090d18] border border-slate-700/80 rounded-2xl shadow-[0_25px_70px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Neon Top Accent Line */}
        <div className="h-1 w-full bg-gradient-to-r from-[#FF5722] via-[#00E5FF] to-[#FF5722]" />

        {/* MODAL HEADER */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-[#0c1222]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF5722] to-[#00E5FF] p-[1px]">
              <div className="w-full h-full bg-[#090d18] rounded-[11px] flex items-center justify-center">
                <Compass className="w-4 h-4 text-[#00E5FF]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="wizard-title" className="font-bold text-white text-sm sm:text-base tracking-wide">
                  Khảo sát & Hoạch định giải pháp tối ưu
                </h2>
                <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#FF5722]/15 text-[#FF5722] border border-[#FF5722]/30">
                  HOẠCH ĐỊNH CHIẾN LƯỢC
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Dựa trên mô hình phân tích dữ liệu giải pháp thực tế từ S-Digital Media & Sports
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Đóng cửa sổ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PROGRESS BAR (3 BƯỚC) */}
        {step !== 'loading' && step !== 'result' && (
          <div className="px-6 pt-4 pb-2 bg-[#090d18]">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
              <span className={step >= 1 ? 'text-[#00E5FF]' : ''}>Bước 1: Ngành nghề</span>
              <span className={step >= 2 ? 'text-[#00E5FF]' : ''}>Bước 2: Mục tiêu</span>
              <span className={step === 3 ? 'text-[#FF5722]' : ''}>Bước 3: Ngân sách</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#00E5FF] to-[#FF5722] transition-all duration-300 rounded-full"
                style={{
                  width: step === 1 ? '33%' : step === 2 ? '66%' : '100%',
                }}
              />
            </div>
          </div>
        )}

        {/* MODAL BODY */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 text-slate-200">
          {/* BƯỚC 1: CHỌN NGÀNH NGHỀ */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-white mb-1">
                  1. Doanh nghiệp của bạn hoạt động trong lĩnh vực nào?
                </h3>
                <p className="text-xs text-slate-400">
                  Hệ thống AI sẽ đối chiếu dữ liệu chiến dịch tương ứng để may đo giải pháp phù hợp nhất.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {INDUSTRIES.map((item) => {
                  const isSelected = selectedIndustry === item.label;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedIndustry(item.label)}
                      className={`p-3.5 rounded-xl text-left border transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-[#121c32] border-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.15)] text-white'
                          : 'bg-[#0c1222]/80 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="font-semibold text-xs text-white">{item.label}</span>
                        {isSelected && <Check className="w-4 h-4 text-[#00E5FF]" />}
                      </div>
                      <span className="text-[11px] text-slate-400">{item.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* BƯỚC 2: CHỌN MỤC TIÊU */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-white mb-1">
                  2. Mục tiêu trọng tâm của bạn trong giai đoạn này là gì?
                </h3>
                <p className="text-xs text-slate-400">
                  Xác định đúng mục tiêu giúp phân bổ nguồn lực chuẩn xác giữa Performance Ads, PR hay Sự kiện thể thao.
                </p>
              </div>

              <div className="space-y-2.5">
                {GOALS.map((item) => {
                  const isSelected = selectedGoal === item.label;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedGoal(item.label)}
                      className={`w-full p-3.5 rounded-xl text-left border transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-[#121c32] border-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.15)] text-white'
                          : 'bg-[#0c1222]/80 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <span className="font-semibold text-xs text-white block">{item.label}</span>
                        <span className="text-[11px] text-slate-400 block">{item.desc}</span>
                      </div>
                      <div className="shrink-0 ml-3">
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            isSelected
                              ? 'border-[#00E5FF] bg-[#00E5FF]/20 text-[#00E5FF]'
                              : 'border-slate-700'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* BƯỚC 3: CHỌN NGÂN SÁCH & GHI CHÚ */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-white mb-1">
                  3. Mức ngân sách dự kiến đầu tư hàng tháng hoặc theo chiến dịch?
                </h3>
                <p className="text-xs text-slate-400">
                  S-Digital cam kết minh bạch 100% chi phí và tối ưu hóa tỷ suất hoàn vốn ROI trên từng mức ngân sách.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {BUDGETS.map((item) => {
                  const isSelected = selectedBudget === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedBudget(item.id)}
                      className={`p-3.5 rounded-xl text-left border transition-all ${
                        isSelected
                          ? 'bg-[#1a141f] border-[#FF5722] shadow-[0_0_15px_rgba(255,87,34,0.15)] text-white'
                          : 'bg-[#0c1222]/80 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-white">{item.label}</span>
                        {isSelected && <Check className="w-4 h-4 text-[#FF5722]" />}
                      </div>
                      <span className="text-[11px] text-slate-400">{item.desc}</span>
                    </button>
                  );
                })}
              </div>

              {/* Ô ghi chú ngắn tùy chọn */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Ghi chú thêm về yêu cầu cụ thể (tùy chọn):
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ví dụ: Cần chạy chiến dịch trong tháng tới, đã có fanpage nhưng chưa có website..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#060913] border border-slate-700 focus:border-[#00E5FF] text-white text-xs placeholder-slate-500 focus:outline-none transition-colors"
                />
              </div>
            </div>
          )}

          {/* MÀN HÌNH LOADING / SCANNER */}
          {step === 'loading' && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
              <div className="relative flex items-center justify-center">
                {/* Scanner rings */}
                <div className="w-24 h-24 rounded-full border-2 border-dashed border-[#00E5FF] animate-spin" />
                <div className="w-16 h-16 rounded-full border-2 border-[#FF5722] animate-ping absolute opacity-40" />
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#FF5722] to-[#00E5FF] flex items-center justify-center absolute shadow-[0_0_20px_rgba(0,229,255,0.6)]">
                  <Compass className="w-6 h-6 text-white animate-pulse" />
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-white text-sm tracking-wide">
                  HỆ THỐNG ĐANG PHÂN TÍCH
                </h4>
                <p className="text-xs text-[#00E5FF] font-mono h-5 transition-all">
                  {scannerPhrases[scannerTextIndex]}
                </p>
                <p className="text-[11px] text-slate-400">
                  Dữ liệu: {selectedIndustry} • {selectedGoal}
                </p>
              </div>
            </div>
          )}

          {/* MÀN HÌNH KẾT QUẢ ĐỀ XUẤT */}
          {step === 'result' && result && (
            <div className="space-y-5">
              {/* Result Header Badge */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-[#FF5722]/15 via-[#00E5FF]/10 to-transparent border border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold text-[#00E5FF]">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>PHƯƠNG ÁN TỐI ƯU TỪ S-DIGITAL</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-white">
                    {result.recommendedPlan}
                  </h3>
                </div>
                <div className="text-left sm:text-right shrink-0">
                  <span className="text-[11px] text-slate-400 block">Dự toán ngân sách</span>
                  <span className="text-sm sm:text-base font-bold text-[#FF5722]">
                    {result.estimatedBudget}
                  </span>
                </div>
              </div>

              {/* Analysis Text */}
              <div className="p-3.5 rounded-xl bg-[#0c1222] border border-slate-800 text-xs text-slate-300 leading-relaxed">
                <span className="font-semibold text-white block mb-1">Đánh giá chiến lược:</span>
                {result.analysis}
              </div>

              {/* Key Deliverables */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Đầu việc và cam kết thực thi trọng tâm:
                </span>
                <div className="grid grid-cols-1 gap-2">
                  {result.keyDeliverables.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-[#0c1222]/80 border border-slate-800/80 flex items-start gap-2.5 text-xs text-slate-200"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#00E5FF] shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Suggested Services & Timeline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-xl bg-[#060913] border border-slate-800">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 mb-2">
                    <Clock className="w-3.5 h-3.5 text-[#FF5722]" />
                    <span>Thời gian triển khai:</span>
                  </div>
                  <span className="font-bold text-xs text-white">{result.timeline}</span>
                </div>

                <div className="p-3 rounded-xl bg-[#060913] border border-slate-800">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 mb-2">
                    <Layers className="w-3.5 h-3.5 text-[#00E5FF]" />
                    <span>Dịch vụ tích hợp:</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {result.suggestedServices.map((srv, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700"
                      >
                        {srv}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOOTER / ACTIONS */}
        <div className="px-5 py-4 border-t border-slate-800 bg-[#0c1222] flex items-center justify-between">
          {step !== 'loading' && step !== 'result' && (
            <>
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => {
                    if (step === 2) setStep(1);
                    else if (step === 3) setStep(2);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Quay lại</span>
                </button>
              ) : (
                <div />
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={() => {
                    if (step === 1) setStep(2);
                    else if (step === 2) setStep(3);
                  }}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#FF5722] to-orange-600 hover:brightness-110 shadow-lg shadow-[#FF5722]/30 transition-all flex items-center gap-1.5"
                >
                  <span>Tiếp tục</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStartAnalysis}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#00E5FF] to-[#0099FF] text-slate-950 font-black hover:brightness-110 shadow-lg shadow-[#00E5FF]/30 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Hoạch định phương án</span>
                </button>
              )}
            </>
          )}

          {step === 'result' && (
            <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Chọn lại thông số</span>
              </button>

              <button
                type="button"
                onClick={handleApplyToContactForm}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-black text-white bg-gradient-to-r from-[#FF5722] to-orange-600 hover:brightness-110 shadow-lg shadow-[#FF5722]/40 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] cursor-pointer"
              >
                <span>Đăng ký tư vấn theo phương án này</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Helper function để mở Wizard từ bất kỳ đâu trên client
 */
export function openServiceWizard() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('sdigital:open-wizard'));
  }
}
