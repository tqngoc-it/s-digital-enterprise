'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  Briefcase,
  Menu,
  X,
} from 'lucide-react';

interface AdminNavigationProps {
  userEmail?: string;
  onSignOut?: () => Promise<void>;
}

const NAV_ITEMS = [
  { label: 'Tổng quan', href: '/admin', icon: LayoutDashboard },
  { label: 'Quản lý Leads (CRM)', href: '/admin/leads', icon: Users },
  { label: 'Khách hàng & Đối tác', href: '/admin/partners', icon: Handshake },
  { label: 'Quản lý Dịch vụ', href: '/admin/services', icon: Briefcase },
  { label: 'Bảng giá & Gói dịch vụ', href: '/admin/pricing', icon: Layers },
  { label: 'Case Studies', href: '/admin/case-studies', icon: Award },
  { label: 'Bài viết Blog', href: '/admin/blogs', icon: FileText },
];

export default function AdminNavigation({ userEmail, onSignOut }: AdminNavigationProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const renderNavLinks = () => (
    <nav className="space-y-1.5">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.href === '/admin'
            ? pathname === '/admin'
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              isActive
                ? 'bg-[#FF5722] text-white shadow-lg shadow-[#FF5722]/30 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  const renderFooter = () => (
    <div className="space-y-4 pt-6 border-t border-white/5">
      <Link
        href="/"
        target="_blank"
        className="w-full py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold flex items-center justify-center gap-2 transition-all border border-white/5 hover:border-white/10"
      >
        <Globe className="w-3.5 h-3.5 text-[#00E5FF]" />
        <span>Xem Trang Chủ ↗</span>
      </Link>

      {userEmail && (
        <div className="text-xs p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
          <p className="text-slate-500 text-[10px] uppercase font-mono">Quản trị viên:</p>
          <p className="text-slate-300 truncate font-semibold mt-0.5">{userEmail}</p>
        </div>
      )}

      {onSignOut && (
        <button
          onClick={async () => {
            await onSignOut();
          }}
          className="w-full py-2.5 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer border border-red-500/20"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Đăng xuất</span>
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* MOBILE TOP BAR */}
      <header className="md:hidden flex items-center justify-between p-4 bg-[#0B0F19] border-b border-white/10 sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#FF5722] to-orange-600 flex items-center justify-center text-white font-black text-xs shadow-md shadow-[#FF5722]/30">
            S
          </div>
          <div>
            <span className="font-black text-xs text-white tracking-wider flex items-center gap-1">
              S-DIGITAL
              <Flame className="w-3 h-3 text-[#FF5722]" />
            </span>
            <span className="text-[9px] text-slate-500 font-mono tracking-widest uppercase">
              ADMIN CMS
            </span>
          </div>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-xl bg-white/5 text-slate-300 hover:text-white border border-white/10"
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* MOBILE DRAWER OVERLAY */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />

          <div className="relative w-72 max-w-[80vw] bg-[#0B0F19] border-r border-white/10 p-6 flex flex-col justify-between h-full z-10 animate-in slide-in-from-left duration-200">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#FF5722] to-orange-600 flex items-center justify-center text-white font-black text-xs">
                    S
                  </div>
                  <div>
                    <h2 className="font-black text-xs text-white tracking-wider">S-DIGITAL CMS</h2>
                    <span className="text-[9px] text-slate-500 font-mono tracking-widest uppercase">
                      HỆ THỐNG QUẢN TRỊ
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {renderNavLinks()}
            </div>

            {renderFooter()}
          </div>
        </div>
      )}

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex w-64 border-r border-white/10 bg-[#0B0F19] flex-col justify-between p-6 shrink-0 min-h-screen sticky top-0">
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

          {renderNavLinks()}
        </div>

        {renderFooter()}
      </aside>
    </>
  );
}
