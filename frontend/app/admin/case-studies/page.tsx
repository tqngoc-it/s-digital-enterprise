import CaseStudiesClient from './CaseStudiesClient';
import { Award } from 'lucide-react';
import { FALLBACK_CASE_STUDIES } from '@/lib/fallbackData';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminCaseStudiesPage() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
  let caseStudies: any[] = [];

  try {
    const res = await fetch(`${backendUrl}/api/case-studies`, {
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      caseStudies = Array.isArray(data) ? data : data?.data || [];
    }
  } catch (e) {
    console.error('[ADMIN_CASE_STUDIES_FETCH_ERROR]:', e);
  }

  const displayStudies =
    caseStudies && caseStudies.length > 0 ? caseStudies : FALLBACK_CASE_STUDIES;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
          <Award className="w-8 h-8 text-emerald-400" />
          <span>Quản Lý Case Studies & Dự Án Tiêu Biểu</span>
        </h1>
        <p className="text-xs md:text-sm text-slate-400 mt-1">
          Quản lý các case study giải chạy marathon, chiến dịch truyền thông thành công hiển thị cho khách hàng.
        </p>
      </div>

      <CaseStudiesClient initialStudies={displayStudies} />
    </div>
  );
}
