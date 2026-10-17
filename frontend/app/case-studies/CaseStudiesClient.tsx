'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Users,
  Newspaper,
  Eye,
  Award,
  Search,
  ArrowLeft,
  ChevronRight,
  Filter,
  CheckCircle2,
  ExternalLink,
  X,
} from 'lucide-react';
import { CaseStudyItem } from '@/lib/fallbackData';
import { parseCaseStudyMetrics } from '@/lib/caseStudyMetrics';

export default function CaseStudiesClient({ initialStudies }: { initialStudies: CaseStudyItem[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'FEATURED'>('ALL');
  const [selectedCase, setSelectedCase] = useState<CaseStudyItem | null>(null);

  const filteredStudies = initialStudies.filter((item) => {
    const matchSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.challenge.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFilter = activeFilter === 'ALL' || (activeFilter === 'FEATURED' && item.is_featured);
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-12">
      {/* FILTER & SEARCH BAR */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-[#0B111E] p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-xl">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên dự án, đối tác, lĩnh vực..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#060913] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-cyan-500 dark:focus:border-[#00E5FF] transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeFilter === 'ALL'
                ? 'bg-cyan-500 dark:bg-[#00E5FF] text-slate-950 shadow-lg shadow-cyan-500/20 dark:shadow-[#00E5FF]/20'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-white/5 text-slate-700 dark:text-slate-300 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10'
            }`}
          >
            Tất cả ({initialStudies.length})
          </button>
          <button
            onClick={() => setActiveFilter('FEATURED')}
            className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeFilter === 'FEATURED'
                ? 'bg-[#FF5722] text-white shadow-lg shadow-[#FF5722]/20'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-white/5 text-slate-700 dark:text-slate-300 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10'
            }`}
          >
            Tiêu biểu ({initialStudies.filter((s) => s.is_featured).length})
          </button>
        </div>
      </div>

      {/* CASE STUDIES CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredStudies.map((study, idx) => {
          const metrics = parseCaseStudyMetrics(study.results);
          return (
            <div
              key={study.id || study.slug || `study-item-${idx}`}
              className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0B111E] border border-slate-200 dark:border-white/10 hover:border-cyan-500/50 dark:hover:border-[#00E5FF]/40 transition-all flex flex-col justify-between space-y-6 shadow-sm hover:shadow-xl dark:shadow-xl group relative overflow-hidden"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-xs font-mono text-cyan-600 dark:text-[#00E5FF] font-bold truncate max-w-[200px]">
                    {study.client_name}
                  </span>
                  {study.is_featured && (
                    <span className="px-2.5 py-0.5 rounded-full bg-[#FF5722]/10 border border-[#FF5722]/20 text-[#FF5722] text-[10px] font-bold uppercase tracking-wider shrink-0">
                      Featured
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-black text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-[#00E5FF] transition-colors leading-snug">
                  {study.title}
                </h3>

                <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  <p className="line-clamp-2">
                    <strong className="text-slate-900 dark:text-white">Thách thức: </strong>
                    {study.challenge}
                  </p>
                  <p className="line-clamp-2">
                    <strong className="text-cyan-600 dark:text-[#00E5FF]">Giải pháp: </strong>
                    {study.solution}
                  </p>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-white/5">
                {/* 3 mini metric cards */}
                <div className="grid grid-cols-3 gap-2">
                  {metrics.map((m, mIdx) => (
                    <div
                      key={`metric-box-${idx}-${mIdx}`}
                      className="p-2 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 text-center"
                    >
                      <div className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">{m.value}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{m.label}</div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setSelectedCase(study)}
                  className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-[#FF5722] text-slate-700 dark:bg-white/5 dark:text-slate-300 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>Chi Tiết Chiến Dịch</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredStudies.length === 0 && (
        <div className="text-center py-16 p-8 rounded-3xl bg-white dark:bg-[#0B111E] border border-slate-200 dark:border-white/10 space-y-3">
          <p className="text-sm text-slate-500 dark:text-slate-400">Không tìm thấy case study nào khớp với từ khóa tìm kiếm.</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setActiveFilter('ALL');
            }}
            className="text-xs text-cyan-600 dark:text-[#00E5FF] font-bold hover:underline"
          >
            Xóa bộ lọc tìm kiếm
          </button>
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 dark:bg-black/80 backdrop-blur-md">
          <div className="max-w-2xl w-full p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0B111E] border border-slate-200 dark:border-white/15 space-y-6 text-xs shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-mono text-cyan-600 dark:text-[#00E5FF] font-bold">
                  {selectedCase.client_name}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                  {selectedCase.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedCase(null)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 dark:bg-white/5 dark:hover:bg-white/10 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 space-y-1.5">
                <span className="text-[11px] font-mono text-[#FF5722] uppercase tracking-wider font-bold">
                  Thách thức ban đầu
                </span>
                <p className="text-slate-700 dark:text-slate-200">{selectedCase.challenge}</p>
              </div>

              <div className="p-4 rounded-2xl bg-cyan-50 dark:bg-[#00E5FF]/5 border border-cyan-200 dark:border-[#00E5FF]/20 space-y-1.5">
                <span className="text-[11px] font-mono text-cyan-600 dark:text-[#00E5FF] uppercase tracking-wider font-bold">
                  Giải pháp thực thi từ S-Digital
                </span>
                <p className="text-slate-700 dark:text-slate-200">{selectedCase.solution}</p>
              </div>
            </div>

            {/* METRICS */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                Chỉ số hiệu quả đạt được
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {parseCaseStudyMetrics(selectedCase.results).map((m, idx) => (
                  <div key={`modal-m-${idx}`} className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-center">
                    <div className="text-xl font-black text-[#FF5722]">{m.value}</div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">{m.label}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{m.sub}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* SCOPE ITEMS */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                Hạng mục S-Digital phụ trách trọn gói
              </h4>
              <ul className="space-y-2.5">
                {(selectedCase.scope_items && selectedCase.scope_items.length > 0
                  ? selectedCase.scope_items
                  : [
                      'Lập kế hoạch tổng thể & chiến lược truyền thông đa kênh',
                      'Sản xuất toàn bộ ấn phẩm nhận diện thương hiệu & media 4K',
                      'Booking mạng lưới KOLs / VĐV chuyên nghiệp lan tỏa',
                      'Vận hành kỹ thuật trực tiếp & kiểm soát rủi ro 24/7',
                    ]
                ).map((item, idx) => (
                  <li key={`modal-scope-${idx}`} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-[#10B981] mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex justify-end gap-3">
              <button
                onClick={() => setSelectedCase(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-white font-bold text-xs cursor-pointer"
              >
                Đóng
              </button>
              <Link
                href="/#contact"
                className="px-5 py-2.5 rounded-xl bg-[#FF5722] hover:bg-orange-600 text-white font-bold text-xs shadow-lg shadow-[#FF5722]/30 flex items-center gap-1.5"
              >
                <span>Nhận Tư Vấn Chiến Dịch Tương Tự</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
