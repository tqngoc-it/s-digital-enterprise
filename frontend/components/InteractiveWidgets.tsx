'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

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
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Kích hoạt ngay lập tức nếu người dùng bấm nút mở wizard
    const handleImmediate = () => setIsMounted(true);
    window.addEventListener('sdigital:open-wizard', handleImmediate);

    let idleId: number | undefined;
    let timerId: NodeJS.Timeout | undefined;

    if ('requestIdleCallback' in window) {
      idleId = (window as any).requestIdleCallback(
        () => setIsMounted(true),
        { timeout: 1500 }
      );
    } else {
      timerId = setTimeout(() => setIsMounted(true), 1500);
    }

    return () => {
      window.removeEventListener('sdigital:open-wizard', handleImmediate);
      if (idleId && 'cancelIdleCallback' in window) {
        (window as any).cancelIdleCallback(idleId);
      }
      if (timerId) {
        clearTimeout(timerId);
      }
    };
  }, []);

  if (!isMounted) return null;

  return (
    <>
      <AiChatWidget />
      <ServiceRecommendationWizard />
    </>
  );
}
