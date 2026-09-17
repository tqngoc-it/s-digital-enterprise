import ServicesClient from './ServicesClient';
import { Briefcase } from 'lucide-react';
import { FALLBACK_SERVICES, ServiceItem } from '@/lib/fallbackData';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminServicesPage() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
  let services: ServiceItem[] = [];

  try {
    const res = await fetch(`${backendUrl}/api/services`, {
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      services = Array.isArray(data) ? data : data?.data || [];
    }
  } catch (e) {
    console.error('[ADMIN_SERVICES_FETCH_ERROR]:', e);
  }

  const displayServices: ServiceItem[] =
    services && services.length > 0 ? services : FALLBACK_SERVICES;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
          <Briefcase className="w-8 h-8 text-violet-400" />
          <span>Quản Lý Hệ Sinh Thái Dịch Vụ</span>
        </h1>
        <p className="text-xs md:text-sm text-slate-400 mt-1">
          Quản lý toàn bộ danh mục dịch vụ thuộc 2 nhóm Marketing Số (Digital Suite) và Thể Thao & Đào Tạo (Sports Hub).
        </p>
      </div>

      <ServicesClient initialServices={displayServices} />
    </div>
  );
}
