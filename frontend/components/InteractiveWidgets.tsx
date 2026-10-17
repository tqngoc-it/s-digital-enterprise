'use client';

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
  return (
    <>
      <AiChatWidget />
      <ServiceRecommendationWizard />
    </>
  );
}
