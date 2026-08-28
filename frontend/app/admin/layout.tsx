import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Layers, 
  FileText, 
  Award, 
  Handshake, 
  LogOut,
  Flame,
  Globe,
  Briefcase
} from 'lucide-react';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  const navItems = [
    { label: 'Tổng quan', href: '/admin', icon: LayoutDashboard },
    { label: 'Quản lý Leads', href: '/admin/leads', icon: Users },
    { label: 'Khách hàng & Đối tác', href: '/admin/partners', icon: Handshake },
    { label: 'Quản lý Dịch vụ', href: '/admin/services', icon: Briefcase },
    { label: 'Bảng giá & Gói dịch vụ', href: '/admin/pricing', icon: Layers },
    { label: 'Case Studies', href: '/admin/case-studies', icon: Award },
    { label: 'Bài viết Blog', href: '/admin/blogs', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-[#070A10] flex text-slate-200 antialiased">
      {/* SIDEBAR */}
      <aside className="w-64 border-r border-white/10 bg-[#0B0F19] flex flex-col justify-between p-6 shrink-0 min-h-screen sticky top-0">
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF5722] to-orange-600 flex items-center justify-center text-white font-black shadow-lg shadow-[#FF5722]/30">
              S
            </div>
            <div>
              <h2 className="font-black text-sm text-white tracking-wider flex items-center gap-1">
                S-DIGITAL
                <Flame className="w-3.5 h-3.5 text-[#FF5722]" />
              </h2>
              <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">
                ADMIN CMS
              </span>
            </div>
          </div>

          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                >
                  <Icon className="w-4 h-4 text-slate-400" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="space-y-4 pt-6 border-t border-white/5">
          <Link
            href="/"
            target="_blank"
            className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold flex items-center justify-center gap-2 transition-all"
          >
            <Globe className="w-3.5 h-3.5 text-[#00E5FF]" />
            <span>Xem Trang Chủ ↗</span>
          </Link>

          {user && (
            <div className="text-xs">
              <p className="text-slate-500 text-[10px] uppercase font-mono">Tài khoản:</p>
              <p className="text-slate-300 truncate font-semibold">{user.email}</p>
            </div>
          )}

          {user && (
            <form action="/auth/signout" method="post">
              <button
                formAction={async () => {
                  'use server';
                  const sb = await createServerSupabaseClient();
                  await sb.auth.signOut();
                  redirect('/admin');
                }}
                className="w-full py-2 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Đăng xuất</span>
              </button>
            </form>
          )}
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8 md:p-12 overflow-y-auto max-h-screen">
        {children}
      </main>
    </div>
  );
}