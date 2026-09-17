import { Users, Handshake, Layers, Award, FileText, ArrowUpRight, TrendingUp, Briefcase } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminDashboardPage() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
  let statsData = {
    leads: 0,
    partners: 25,
    services: 11,
    pricing: 3,
    caseStudies: 1,
    blogs: 3,
  };

  try {
    const res = await fetch(`${backendUrl}/api/stats`, {
      cache: 'no-store',
    });
    if (res.ok) {
      statsData = await res.json();
    }
  } catch (e) {
    console.error('[ADMIN_STATS_FETCH_ERROR]:', e);
  }

  const stats = [
    {
      label: 'Khách Hàng Tiềm Năng (Leads)',
      value: statsData.leads,
      icon: Users,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/20',
      href: '/admin/leads',
    },
    {
      label: 'Khách Hàng & Đối Tác',
      value: statsData.partners,
      icon: Handshake,
      color: 'text-[#00E5FF]',
      bg: 'bg-[#00E5FF]/10 border-[#00E5FF]/20',
      href: '/admin/partners',
    },
    {
      label: 'Hệ Sinh Thái Dịch Vụ',
      value: statsData.services,
      icon: Briefcase,
      color: 'text-violet-400',
      bg: 'bg-violet-500/10 border-violet-500/20',
      href: '/admin/services',
    },
    {
      label: 'Bảng Giá & Gói Dịch Vụ',
      value: statsData.pricing,
      icon: Layers,
      color: 'text-[#FF5722]',
      bg: 'bg-[#FF5722]/10 border-[#FF5722]/20',
      href: '/admin/pricing',
    },
    {
      label: 'Case Studies Tiêu Biểu',
      value: statsData.caseStudies,
      icon: Award,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
      href: '/admin/case-studies',
    },
    {
      label: 'Bài Viết Blog & Tin Tức',
      value: statsData.blogs,
      icon: FileText,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
      href: '/admin/blogs',
    },
  ];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">Dashboard Quản Trị Hệ Thống</h1>
        <p className="text-xs md:text-sm text-slate-400 mt-1">
          Hệ thống điều hành và thống kê dữ liệu trực tiếp của S-Digital Media & Sports qua NestJS Core Backend.
        </p>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((st, i) => {
          const Icon = st.icon;
          return (
            <Link
              key={i}
              href={st.href}
              className="p-6 rounded-3xl bg-[#0B0F19] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between space-y-6 group hover:-translate-y-1 shadow-xl"
            >
              <div className="flex items-center justify-between">
                <div className={`w-12 h-12 rounded-2xl ${st.bg} border flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${st.color} group-hover:scale-110 transition-transform`} />
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors" />
              </div>

              <div>
                <p className="text-xs text-slate-400 font-semibold">{st.label}</p>
                <p className="text-3xl font-black text-white mt-1.5 font-mono">{st.value}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* QUICK ACTIONS BANNER */}
      <div className="p-8 rounded-3xl bg-gradient-to-br from-[#0B0F19] to-[#141B2D] border border-white/10 space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-[#FF5722]">
          <TrendingUp className="w-4 h-4" />
          <span>HƯỚNG DẪN QUẢN TRỊ VIÊN</span>
        </div>
        <h3 className="text-xl font-black text-white">Kiến Trúc Phân Tầng Độc Lập (NestJS Backend Core)</h3>
        <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
          Mọi thao tác quản lý dữ liệu (Leads, Đối tác, Dịch vụ, Bảng giá, Case Studies, Blogs) đã được chuyển giao hoàn toàn sang NestJS Core Backend độc lập. Frontend Next.js hoạt động thuần túy dưới vai trò Presentation Layer, tự động đồng bộ thời gian thực qua REST API tiêu chuẩn.
        </p>
      </div>
    </div>
  );
}