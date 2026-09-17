import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import CustomersPartners from '@/components/CustomersPartners';
import MilestonesSection from '@/components/MilestonesSection';
import AboutSection from '@/components/AboutSection';
import ServicesHub from '@/components/ServicesHub';
import WhyChooseUs from '@/components/WhyChooseUs';
import SolutionsSection from '@/components/SolutionsSection';
import PricingSection from '@/components/PricingSection';
import BlogSection from '@/components/BlogSection';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';
import AiChatWidget from '@/components/AiChatWidget';
import ServiceRecommendationWizard from '@/components/ServiceRecommendationWizard';
import {
  FALLBACK_COMPANY,
  FALLBACK_PARTNERS,
  FALLBACK_PRICING,
  FALLBACK_CASE_STUDIES,
  FALLBACK_BLOGS,
  FALLBACK_SERVICES,
} from '@/lib/fallbackData';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HomePage() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

  // Truy vấn song song các endpoints từ NestJS Core Backend
  const [partnersRes, servicesRes, pricingRes, caseStudiesRes, blogsRes] = await Promise.allSettled([
    fetch(`${backendUrl}/api/partners`, { cache: 'no-store' }).then((r) => (r.ok ? r.json() : null)),
    fetch(`${backendUrl}/api/services`, { cache: 'no-store' }).then((r) => (r.ok ? r.json() : null)),
    fetch(`${backendUrl}/api/pricing`, { cache: 'no-store' }).then((r) => (r.ok ? r.json() : null)),
    fetch(`${backendUrl}/api/case-studies`, { cache: 'no-store' }).then((r) => (r.ok ? r.json() : null)),
    fetch(`${backendUrl}/api/blogs`, { cache: 'no-store' }).then((r) => (r.ok ? r.json() : null)),
  ]);

  const companyInfo = FALLBACK_COMPANY;

  const partners =
    partnersRes.status === 'fulfilled' && Array.isArray(partnersRes.value) && partnersRes.value.length > 0
      ? partnersRes.value
      : FALLBACK_PARTNERS;

  const services =
    servicesRes.status === 'fulfilled' && Array.isArray(servicesRes.value) && servicesRes.value.length > 0
      ? servicesRes.value
      : (FALLBACK_SERVICES || []);

  const pricingPlans =
    pricingRes.status === 'fulfilled' && Array.isArray(pricingRes.value) && pricingRes.value.length > 0
      ? pricingRes.value
      : FALLBACK_PRICING;

  const caseStudies =
    caseStudiesRes.status === 'fulfilled' && Array.isArray(caseStudiesRes.value) && caseStudiesRes.value.length > 0
      ? caseStudiesRes.value
      : FALLBACK_CASE_STUDIES;

  const blogs =
    blogsRes.status === 'fulfilled' && Array.isArray(blogsRes.value) && blogsRes.value.length > 0
      ? blogsRes.value
      : FALLBACK_BLOGS;

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 selection:bg-[#FF5722] selection:text-white flex flex-col antialiased">
      {/* 1. NAVBAR */}
      <Navbar />

      {/* MAIN SECTIONS MAP */}
      <main className="flex-1 space-y-6 md:space-y-10">
        {/* 2. HERO BANNER */}
        <HeroSection
          brandSlogan={companyInfo?.brand_slogan}
          aboutText={companyInfo?.about_text}
        />

        {/* 3. LOGO MARQUEE (16 CUSTOMERS & 9 STRATEGIC PARTNERS) */}
        <CustomersPartners partners={partners} />

        {/* 4. MILESTONES & STATS (95% - 80% - 90% - 85%) */}
        <MilestonesSection stats={companyInfo?.highlights_stats} />

        {/* 5. ABOUT US & 4 CORE CAPABILITIES */}
        <AboutSection companyInfo={companyInfo} />

        {/* 6. SERVICES HUB (DIGITAL SUITE & SPORTS HUB) */}
        <ServicesHub services={services} />

        {/* 7. WHY CHOOSE US (CRISIS 30-MIN, 4 PILLARS & 5-STEP WORKFLOW) */}
        <WhyChooseUs />

        {/* 8. CASE STUDY MARATHON & 3 TESTIMONIALS */}
        <SolutionsSection caseStudies={caseStudies} />

        {/* 9. PRICING PLANS & 4 QUALITY COMMITMENTS */}
        <PricingSection plans={pricingPlans} />

        {/* 10. BLOG & INSIGHTS */}
        <BlogSection blogs={blogs} />

        {/* 11. CONTACT & LEAD FORM */}
        <ContactSection companyInfo={companyInfo} />
      </main>

      {/* 12. FOOTER */}
      <Footer companyInfo={companyInfo} />

      {/* 13. AI CHATBOT WIDGET (S-DIGITAL AI ASSISTANT 24/7) */}
      <AiChatWidget />

      {/* 14. AI SERVICE RECOMMENDATION WIZARD (MODAL) */}
      <ServiceRecommendationWizard />
    </div>
  );
}