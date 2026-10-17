'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, ArrowUpRight, Flame, Compass } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Trang chủ', href: '/' },
    { label: 'Về chúng tôi', href: '/#about' },
    { label: 'Dịch vụ', href: '/#services' },
    { label: 'Tại sao chọn S-Digital', href: '/#why-us' },
    { label: 'Đối tác', href: '/#customers' },
    { label: 'Case Study', href: '/case-studies' },
    { label: 'Bảng giá', href: '/#pricing' },
    { label: 'Tin tức', href: '/#blog' },
    { label: 'Liên hệ', href: '/#contact' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 dark:bg-[#060913]/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/10 shadow-xl shadow-slate-200/30 dark:shadow-black/50 py-3.5'
          : 'bg-transparent border-b border-slate-200/40 dark:border-white/5 py-4 md:py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF5722] to-orange-600 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-[#FF5722]/30 group-hover:scale-105 group-hover:shadow-[#FF5722]/50 transition-all">
            S
          </div>
          <div className="flex flex-col">
            <span className="font-black text-lg tracking-wider text-slate-900 dark:text-white flex items-center gap-1">
              S-DIGITAL
              <Flame className="w-4 h-4 text-[#FF5722] inline-block animate-pulse" />
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono tracking-widest uppercase">Media & Sports</span>
          </div>
        </Link>

        {/* DESKTOP NAV */}
        <nav className="hidden xl:flex items-center gap-5 2xl:gap-6 text-xs font-semibold text-slate-600 dark:text-slate-300">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="hover:text-[#FF5722] dark:hover:text-[#FF5722] transition-colors py-1 relative group whitespace-nowrap"
            >
              {link.label}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#FF5722] transition-all duration-200 group-hover:w-full" />
            </a>
          ))}
        </nav>

        {/* CTA DESKTOP */}
        <div className="hidden lg:flex items-center gap-3">
          <ThemeToggle />

          <button
            type="button"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('sdigital:open-wizard'));
            }}
            className="px-4 py-2.5 rounded-xl bg-cyan-500/10 dark:bg-[#0c1222] border border-[#00E5FF]/60 hover:border-[#00E5FF] text-[#0097a7] dark:text-[#00E5FF] hover:text-white hover:bg-[#00E5FF]/20 font-bold text-xs transition-all shadow-sm flex items-center gap-1.5 hover:scale-105 cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5 text-[#0097a7] dark:text-[#00E5FF]" />
            <span>Phân tích nhu cầu</span>
          </button>

          <a
            href="#contact"
            className="px-5 py-2.5 rounded-xl bg-[#FF5722] hover:bg-orange-600 text-white font-bold text-xs transition-all shadow-lg shadow-[#FF5722]/25 hover:shadow-[#FF5722]/40 flex items-center gap-1.5 hover:scale-105"
          >
            <span>Tư vấn ngay</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* MOBILE CONTROLS */}
        <div className="xl:hidden flex items-center gap-2">
          <ThemeToggle />

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* MOBILE DROPDOWN */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white/98 dark:bg-[#060913]/98 backdrop-blur-2xl border-b border-slate-200 dark:border-white/10 px-6 py-6 space-y-4 shadow-2xl">
          <nav className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-[#FF5722] dark:hover:text-[#FF5722] transition-colors py-1.5 border-b border-slate-100 dark:border-white/5"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="flex flex-col gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                window.dispatchEvent(new CustomEvent('sdigital:open-wizard'));
              }}
              className="w-full py-3 rounded-xl bg-cyan-500/10 dark:bg-[#0c1222] border border-[#00E5FF]/60 text-[#0097a7] dark:text-[#00E5FF] font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <Compass className="w-4 h-4 text-[#0097a7] dark:text-[#00E5FF]" />
              <span>Phân tích nhu cầu</span>
            </button>
            <a
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-3.5 rounded-xl bg-[#FF5722] hover:bg-orange-600 text-white font-bold text-sm transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-[#FF5722]/30"
            >
              <span>Tư vấn ngay ↗</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
