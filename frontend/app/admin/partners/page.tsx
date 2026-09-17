import PartnersClient from './PartnersClient';
import { Handshake } from 'lucide-react';
import { FALLBACK_PARTNERS } from '@/lib/fallbackData';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminPartnersPage() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
  let partners: any[] = [];

  try {
    const res = await fetch(`${backendUrl}/api/partners`, {
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      partners = Array.isArray(data) ? data : data?.data || [];
    }
  } catch (e) {
    console.error('[ADMIN_PARTNERS_FETCH_ERROR]:', e);
  }

  const displayPartners =
    partners && partners.length > 0 ? partners : FALLBACK_PARTNERS;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
          <Handshake className="w-8 h-8 text-[#00E5FF]" />
          <span>Quản Lý Đối Tác & Khách Hàng</span>
        </h1>
        <p className="text-xs md:text-sm text-slate-400 mt-1">
          Quản lý danh sách 16 khách hàng tiêu biểu và 9 đối tác chiến lược hiển thị trên dải logo trang chủ.
        </p>
      </div>

      <PartnersClient initialPartners={displayPartners} />
    </div>
  );
}
