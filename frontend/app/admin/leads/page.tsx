import { createServerSupabaseClient } from '@/lib/supabase/server';
import LeadsClient from './LeadsClient';
import { Users } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminLeadsPage() {
  const supabase = await createServerSupabaseClient();

  const { data: leads } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
          <Users className="w-8 h-8 text-[#FF5722]" />
          <span>Quản Lý Leads & Khách Hàng Tiềm Năng</span>
        </h1>
        <p className="text-xs md:text-sm text-slate-400 mt-1">
          Theo dõi và xử lý danh sách liên hệ gửi về từ form đăng ký trang chủ.
        </p>
      </div>

      <LeadsClient initialLeads={leads || []} />
    </div>
  );
}