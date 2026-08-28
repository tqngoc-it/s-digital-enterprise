import { createServerSupabaseClient } from '@/lib/supabase/server';
import ServicesClient from './ServicesClient';
import { Briefcase } from 'lucide-react';
import { FALLBACK_SERVICES, ServiceItem } from '@/lib/fallbackData';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminServicesPage() {
  const supabase = await createServerSupabaseClient();

  const { data: services } = await supabase
    .from('services')
    .select('*')
    .order('display_order', { ascending: true });

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
