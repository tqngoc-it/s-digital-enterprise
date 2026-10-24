'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { MessageSquare } from 'lucide-react';

// Nạp động On-Demand: Chỉ tải bundle khi người dùng thực sự kích hoạt tương tác
const AiChatWidget = dynamic(() => import('@/components/AiChatWidget'), {
  ssr: false,
});

const ServiceRecommendationWizard = dynamic(
  () => import('@/components/ServiceRecommendationWizard'),
  {
    ssr: false,
  }
);

export default function InteractiveWidgets() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  // Lắng nghe sự kiện mở khảo sát từ các nút bấm trên trang (Navbar, Pricing, CTA)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOpenWizard = () => {
      setIsWizardOpen(true);
    };

    window.addEventListener('open-recommendation-wizard', handleOpenWizard);
    window.addEventListener('sdigital:open-wizard', handleOpenWizard);

    return () => {
      window.removeEventListener('open-recommendation-wizard', handleOpenWizard);
      window.removeEventListener('sdigital:open-wizard', handleOpenWizard);
    };
  }, []);

  return (
    <>
      {/* 1. KHẢO SÁT WIZARD: CHỈ MOUNT DOM ON-DEMAND KHI ĐƯỢC GỌI */}
      {isWizardOpen && (
        <ServiceRecommendationWizard
          isOpen={isWizardOpen}
          onClose={() => setIsWizardOpen(false)}
        />
      )}

      {/* 2. CHATBOT AI:
          - TRẠNG THÁI MẶC ĐỊNH LÚC TẢI TRANG: Chỉ render 1 nút tròn tĩnh chứa icon MessageSquare (Zero reflow, Zero markdown, Zero chat state).
          - KHI NGƯỜI DÙNG BẤM MỞ (isChatOpen = true): Mới kích hoạt nạp động khung chat chi tiết.
      */}
      {isChatOpen ? (
        <AiChatWidget
          isOpen={true}
          onClose={() => setIsChatOpen(false)}
        />
      ) : (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
          <button
            type="button"
            onClick={() => setIsChatOpen(true)}
            className="relative group flex items-center justify-center rounded-full w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-tr from-[#FF5722] via-[#F4511E] to-[#FF8A65] border-2 border-[#00E5FF] text-white shadow-[0_0_30px_rgba(255,87,34,0.65)] hover:shadow-[0_0_35px_rgba(0,229,255,0.85)] hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
            aria-label="Mở S-Digital AI Chatbot"
            title="Tư vấn AI 24/7 cùng S-Digital"
          >
            {/* Radar pulse rings */}
            <span className="absolute -inset-1 rounded-full bg-[#00E5FF]/30 blur-sm animate-ping opacity-60 pointer-events-none" />

            {/* Icon MessageSquare */}
            <MessageSquare className="w-7 h-7 sm:w-8 sm:h-8 drop-shadow-md transition-transform group-hover:scale-110" />

            {/* Online status indicator */}
            <span className="absolute top-0 right-0 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white dark:border-[#060913]" />
            </span>
          </button>
        </div>
      )}
    </>
  );
}
