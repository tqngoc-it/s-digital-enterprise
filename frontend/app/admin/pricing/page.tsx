import { createServerSupabaseClient } from '@/lib/supabase/server';
import PricingClient from './PricingClient';
import { Layers } from 'lucide-react';
import { FALLBACK_PRICING } from '@/lib/fallbackData';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminPricingPage() {
  const supabase = await createServerSupabaseClient();

  const { data: pricingPlans } = await supabase
    .from('pricing_plans')
    .select('*')
    .order('id', { ascending: true });

  const displayPlans = pricingPlans && pricingPlans.length > 0 ? pricingPlans : FALLBACK_PRICING;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
          <Layers className="w-8 h-8 text-[#FF5722]" />
          <span>Quản Lý Bảng Giá & Gói Dịch Vụ</span>
        </h1>
        <p className="text-xs md:text-sm text-slate-400 mt-1">
          Cập nhật thông tin các gói giá dịch vụ linh hoạt hiển thị trên landing page.
        </p>
      </div>

      <PricingClient initialPlans={displayPlans} />
    </div>
  );
}
