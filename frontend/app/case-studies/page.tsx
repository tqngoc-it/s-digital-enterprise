import { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CaseStudiesClient from './CaseStudiesClient';
import { FALLBACK_CASE_STUDIES, FALLBACK_COMPANY, CaseStudyItem } from '@/lib/fallbackData';
import { ArrowLeft, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Dự Án Tiêu Biểu & Case Studies | S-Digital Enterprise Platform',
  description:
    'Khám phá các case study thành công trong lĩnh vực tổ chức giải đấu thể thao chuyên nghiệp và chiến dịch Digital Marketing toàn diện từ S-Digital.',
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function CaseStudiesPage() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

  let caseStudies: CaseStudyItem[] = FALLBACK_CASE_STUDIES;

  try {
    const res = await fetch(`${backendUrl}/api/case-studies`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        caseStudies = data;
      }
    }
  } catch (err) {
    console.warn('Could not fetch case studies from backend, using fallback:', err);
  }

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 selection:bg-[#FF5722] selection:text-white flex flex-col antialiased">
      <Navbar />

      <main className="flex-1 py-12 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 w-full space-y-12">
        {/* BREADCRUMB & HEADER */}
        <div className="space-y-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-[#00E5FF] transition-colors font-mono"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Trở về Trang chủ S-Digital</span>
          </Link>

          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FF5722]/10 border border-[#FF5722]/20 text-[#FF5722] text-xs font-bold font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              <span>PORTFOLIO & RESULTS</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
              Dự Án & Chiến Dịch Tiêu Biểu
            </h1>

            <p className="text-sm sm:text-base text-slate-400 max-w-3xl leading-relaxed">
              Minh chứng thực tế cho năng lực tổ chức giải thể thao quy mô lớn và triển khai giải pháp Digital Marketing tăng trưởng doanh số vượt bậc của S-Digital.
            </p>
          </div>
        </div>

        {/* INTERACTIVE CASE STUDIES CLIENT */}
        <CaseStudiesClient initialStudies={caseStudies} />
      </main>

      <Footer companyInfo={FALLBACK_COMPANY} />
    </div>
  );
}
