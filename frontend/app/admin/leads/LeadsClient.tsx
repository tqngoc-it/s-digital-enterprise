'use client';

import { useState } from 'react';
import { updateLeadStatusAction, deleteLeadAction } from '@/app/actions/admin-leads';
import {
  Search,
  Trash2,
  Eye,
  X,
  Loader2,
  Mail,
  Phone,
  Building,
  Sparkles,
  RefreshCw,
  Clock,
  Target,
  ShieldCheck,
  Inbox,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  NEW: { label: 'Mới tiếp nhận', color: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  CONTACTED: { label: 'Đang tư vấn', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  QUALIFIED: { label: 'Tiềm năng cao', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  CLOSED: { label: 'Đã chốt HĐ', color: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
  REJECTED: { label: 'Từ chối / Spam', color: 'bg-red-500/15 text-red-400 border-red-500/30' },
};

export default function LeadsClient({ initialLeads }: { initialLeads: any[] }) {
  const [leads, setLeads] = useState<any[]>(initialLeads || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [tierFilter, setTierFilter] = useState('ALL');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [scoringId, setScoringId] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Cập nhật trạng thái xử lý Lead
  async function handleStatusChange(id: string, newStatus: string) {
    setUpdatingId(id);
    const res = await updateLeadStatusAction(id, newStatus);
    if (res.success) {
      setLeads((prev) =>
        prev.map((lead) => (lead.id === id ? { ...lead, status: newStatus } : lead))
      );
      if (selectedLead && selectedLead.id === id) {
        setSelectedLead({ ...selectedLead, status: newStatus });
      }
    } else {
      alert(res.error || 'Cập nhật trạng thái thất bại');
    }
    setUpdatingId(null);
  }

  // Xóa Lead
  async function handleDelete(id: string) {
    if (!confirm('Bạn có chắc chắn muốn xóa khách hàng tiềm năng này?')) return;
    setUpdatingId(id);
    const res = await deleteLeadAction(id);
    if (res.success) {
      setLeads((prev) => prev.filter((lead) => lead.id !== id));
      if (selectedLead?.id === id) setSelectedLead(null);
    } else {
      alert(res.error || 'Xóa thất bại');
    }
    setUpdatingId(null);
  }

  // Thẩm định chất lượng Lead
  async function handleScoreLead(lead: any) {
    setScoringId(lead.id);
    setNotification(null);

    try {
      const res = await fetch('/api/admin/score-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: lead.full_name,
          email: lead.email,
          phone: lead.phone,
          company: lead.company_name,
          service: lead.service || 'Tư vấn giải pháp',
          budget: lead.budget || 'Chưa xác định',
          message: lead.message || lead.notes,
        }),
      });

      const result = await res.json();

      if (result.success || result.score !== undefined) {
        const scoreData = result.data || result;
        const tierText =
          scoreData.tier === 'HOT'
            ? 'Tiềm năng cao'
            : scoreData.tier === 'WARM'
            ? 'Tiềm năng'
            : 'Ít tiềm năng';

        const updatedLead = {
          ...lead,
          ai_score: scoreData.score,
          ai_tier: scoreData.tier,
          ai_summary: scoreData.summary,
          ai_action_plan: scoreData.actionPlan,
          ai_estimated_value: scoreData.estimatedValue,
        };

        setLeads((prev) => prev.map((l) => (l.id === lead.id ? updatedLead : l)));

        if (selectedLead && selectedLead.id === lead.id) {
          setSelectedLead(updatedLead);
        }

        setNotification({
          type: 'success',
          message: `Thẩm định hoàn tất cho "${lead.full_name}": ${scoreData.score}/100 điểm (${tierText})`,
        });

        // Thử đồng bộ dữ liệu vào Supabase nếu bảng có sẵn các cột
        try {
          const { createBrowserSupabaseClient } = await import('@/lib/supabase/client');
          const supabase = createBrowserSupabaseClient();
          await supabase
            .from('leads')
            .update({
              ai_score: scoreData.score,
              ai_tier: scoreData.tier,
              ai_summary: scoreData.summary,
              ai_action_plan: scoreData.actionPlan,
              ai_estimated_value: scoreData.estimatedValue,
            })
            .eq('id', lead.id);
        } catch {
          // Bỏ qua nếu cột chưa tồn tại trong schema Supabase
        }
      } else {
        throw new Error(result.error || 'Không nhận được kết quả thẩm định');
      }
    } catch (err: any) {
      console.error('[SCORE_LEAD_CLIENT_ERROR]:', err);
      setNotification({
        type: 'error',
        message: err.message || 'Lỗi thẩm định chất lượng Lead, vui lòng thử lại.',
      });
    } finally {
      setScoringId(null);
    }
  }

  // Bộ lọc tìm kiếm & trạng thái & mức tiềm năng
  const filteredLeads = leads.filter((lead) => {
    const matchSearch =
      lead.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone?.includes(searchTerm) ||
      lead.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.message?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = statusFilter === 'ALL' || lead.status === statusFilter;

    const leadTier = lead.ai_tier || lead.aiTier;
    const matchTier =
      tierFilter === 'ALL' ||
      (tierFilter === 'UNSCORED' && lead.ai_score === undefined && lead.aiScore === undefined) ||
      leadTier === tierFilter;

    return matchSearch && matchStatus && matchTier;
  });

  return (
    <div className="space-y-6">
      {/* THÔNG BÁO HOẠT ĐỘNG */}
      {notification && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between text-xs font-medium transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* FILTER & SEARCH */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo họ tên, email, SĐT, công ty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-[#0B0F19] border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-[#FF5722] placeholder:text-slate-600 transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* 1. THAY THẾ DROPDOWN BỘ LỌC */}
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="p-2.5 rounded-xl bg-[#0B0F19] border border-slate-800 text-xs text-slate-300 cursor-pointer focus:outline-none focus:border-[#FF5722]"
          >
            <option value="ALL">Tất cả mức tiềm năng</option>
            <option value="HOT">Tiềm năng cao</option>
            <option value="WARM">Tiềm năng</option>
            <option value="COLD">Ít tiềm năng</option>
            <option value="UNSCORED">Chưa thẩm định</option>
          </select>

          {/* STATUS FILTER */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2.5 rounded-xl bg-[#0B0F19] border border-slate-800 text-xs text-slate-300 cursor-pointer focus:outline-none focus:border-[#FF5722]"
          >
            <option value="ALL">Tất cả trạng thái ({leads.length})</option>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label} ({leads.filter((l) => l.status === k).length})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* EMPTY STATE KIỂM TRA NGUỒN LEADS */}
      {leads.length === 0 ? (
        <div className="py-20 px-6 text-center rounded-3xl bg-[#0B0F19] border border-slate-800 space-y-4 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-slate-500">
            <Inbox className="w-7 h-7" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-sm font-bold text-white">Chưa có liên hệ mới từ khách hàng</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Dữ liệu sẽ xuất hiện khi có khách gửi yêu cầu từ Website.
            </p>
          </div>
        </div>
      ) : (
        /* TABLE */
        <div className="rounded-2xl bg-[#0B0F19] border border-slate-800 overflow-x-auto shadow-xl">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#090D18] border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-4 px-6 font-semibold">Khách Hàng</th>
                <th className="py-4 px-6 font-semibold">Liên Hệ</th>
                <th className="py-4 px-6 font-semibold">Công Ty</th>
                <th className="py-4 px-6 font-semibold">Lời Nhắn</th>
                <th className="py-4 px-6 font-semibold text-center">Thẩm Định Chất Lượng</th>
                <th className="py-4 px-6 font-semibold">Trạng Thái</th>
                <th className="py-4 px-6 font-semibold">Ngày Gửi</th>
                <th className="py-4 px-6 font-semibold text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    Không tìm thấy dữ liệu Lead phù hợp với bộ lọc tìm kiếm.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => {
                  const isScoring = scoringId === lead.id;
                  const score = lead.ai_score ?? lead.aiScore;
                  const tier = lead.ai_tier ?? lead.aiTier;
                  const hasScore = score !== undefined;

                  return (
                    <tr
                      key={lead.id}
                      onClick={() => setSelectedLead(lead)}
                      className="hover:bg-white/[0.02] transition-colors cursor-pointer group"
                    >
                      {/* KHÁCH HÀNG */}
                      <td className="py-4 px-6 font-bold text-white whitespace-nowrap group-hover:text-[#FF5722] transition-colors">
                        {lead.full_name}
                      </td>

                      {/* LIÊN HỆ */}
                      <td className="py-4 px-6 text-slate-300">
                        <p className="font-medium text-white">{lead.email}</p>
                        <p className="text-slate-500 text-[11px] font-mono">{lead.phone || 'Chưa cung cấp SĐT'}</p>
                      </td>

                      {/* CÔNG TY */}
                      <td className="py-4 px-6 text-slate-300 whitespace-nowrap">
                        {lead.company_name || '---'}
                      </td>

                      {/* LỜI NHẮN */}
                      <td className="py-4 px-6 text-slate-400 max-w-xs truncate">
                        {lead.message || lead.notes || '---'}
                      </td>

                      {/* 2. CỘT THẨM ĐỊNH CHẤT LƯỢNG (ĐỔI NHÃN BADGE) */}
                      <td className="py-4 px-6 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        {isScoring ? (
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FF5722]/10 border border-[#FF5722]/30 text-[#FF5722] text-[11px] font-bold">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Đang thẩm định...</span>
                          </div>
                        ) : hasScore ? (
                          <div className="flex flex-col items-center gap-1.5">
                            <div className="flex items-center gap-2">
                              {/* BADGE PHÂN CẤP CHUẨN HOÁ TEXT */}
                              {tier === 'HOT' && (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide bg-[#FF5722]/20 text-[#FF5722] border border-[#FF5722]/40 shadow-sm shadow-[#FF5722]/20">
                                  Tiềm năng cao
                                </span>
                              )}
                              {tier === 'WARM' && (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/40 shadow-sm shadow-[#F59E0B]/20">
                                  Tiềm năng
                                </span>
                              )}
                              {tier === 'COLD' && (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide bg-[#64748B]/25 text-slate-300 border border-[#64748B]/40">
                                  Ít tiềm năng
                                </span>
                              )}

                              {/* ĐIỂM SỐ TRỰC QUAN */}
                              <span className="font-mono font-bold text-white text-xs">
                                {score}/100
                              </span>
                            </div>

                            {/* THANH ĐIỂM TIẾN ĐỘ NHỎ */}
                            <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/60">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  tier === 'HOT'
                                    ? 'bg-gradient-to-r from-orange-500 to-[#FF5722]'
                                    : tier === 'WARM'
                                    ? 'bg-[#F59E0B]'
                                    : 'bg-[#64748B]'
                                }`}
                                style={{ width: `${Math.max(8, score)}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleScoreLead(lead)}
                            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-[#FF5722]/20 border border-slate-800 hover:border-[#FF5722]/40 text-slate-400 hover:text-[#FF5722] text-[11px] font-medium transition-all cursor-pointer inline-flex items-center gap-1.5"
                            title="Bấm để kích hoạt thẩm định chất lượng"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>Thẩm định ngay</span>
                          </button>
                        )}
                      </td>

                      {/* TRẠNG THÁI */}
                      <td className="py-4 px-6 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <select
                          disabled={updatingId === lead.id}
                          value={lead.status || 'NEW'}
                          onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                          className={`p-1.5 rounded-lg text-[11px] font-bold border cursor-pointer focus:outline-none ${
                            STATUS_CONFIG[lead.status]?.color || 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                            <option key={k} value={k} className="bg-[#0B0F19] text-white">
                              {v.label}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* NGÀY GỬI */}
                      <td className="py-4 px-6 text-slate-400 font-mono whitespace-nowrap text-[11px]">
                        {lead.created_at ? new Date(lead.created_at).toLocaleDateString('vi-VN') : '---'}
                      </td>

                      {/* THAO TÁC */}
                      <td className="py-4 px-6 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            disabled={isScoring}
                            onClick={() => handleScoreLead(lead)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-[#FF5722]/20 text-slate-300 hover:text-[#FF5722] border border-white/5 hover:border-[#FF5722]/30 transition-all cursor-pointer"
                            title={hasScore ? 'Thẩm định lại' : 'Thẩm định chất lượng Lead'}
                          >
                            {isScoring ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FF5722]" />
                            ) : (
                              <Sparkles className="w-3.5 h-3.5" />
                            )}
                          </button>

                          <button
                            onClick={() => setSelectedLead(lead)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 transition-all cursor-pointer"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            disabled={updatingId === lead.id}
                            onClick={() => handleDelete(lead.id)}
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all cursor-pointer"
                            title="Xóa lead"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 3. VIEW LEAD DETAILS & EVALUATION MODAL */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="max-w-2xl w-full max-h-[90vh] flex flex-col rounded-3xl bg-[#090D18] border border-slate-800 space-y-0 shadow-2xl relative text-xs text-slate-300 overflow-hidden">
            {/* MODAL HEADER */}
            <div className="p-6 md:p-7 border-b border-slate-800 flex items-start justify-between bg-[#0B0F19]">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase text-[#FF5722] font-bold px-2 py-0.5 rounded bg-[#FF5722]/10 border border-[#FF5722]/30">
                    HỒ SƠ LEAD #{selectedLead.id?.slice(0, 10)}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      STATUS_CONFIG[selectedLead.status]?.color || 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {STATUS_CONFIG[selectedLead.status]?.label || selectedLead.status}
                  </span>
                </div>
                <h3 className="text-2xl font-black text-white pt-1">{selectedLead.full_name}</h3>
                <p className="text-slate-400 text-xs flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-slate-500" />
                  <span>{selectedLead.company_name || 'Khách hàng cá nhân'}</span>
                </p>
              </div>

              <button
                onClick={() => setSelectedLead(null)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* MODAL BODY (SCROLLABLE) */}
            <div className="p-6 md:p-7 overflow-y-auto space-y-6">
              {/* LIÊN HỆ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-[#070A10] border border-slate-800">
                <div className="flex items-center gap-2.5 text-slate-300">
                  <Mail className="w-4 h-4 text-[#FF5722] shrink-0" />
                  <div className="overflow-hidden">
                    <p className="text-[10px] text-slate-500 uppercase font-mono">Email</p>
                    <p className="font-semibold text-white truncate">{selectedLead.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 text-slate-300">
                  <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-mono">Số điện thoại</p>
                    <p className="font-semibold text-white font-mono">{selectedLead.phone || 'Chưa cung cấp'}</p>
                  </div>
                </div>
              </div>

              {/* LỜI NHẮN */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  Nội dung yêu cầu / Lời nhắn:
                </label>
                <div className="p-4 rounded-xl bg-[#070A10] border border-slate-800 text-slate-200 leading-relaxed max-h-36 overflow-y-auto whitespace-pre-wrap font-sans text-xs">
                  {selectedLead.message || selectedLead.notes || 'Không có lời nhắn.'}
                </div>
              </div>

              {/* KHU VỰC THẨM ĐỊNH CƠ HỘI & ĐỀ XUẤT TIẾP CẬN */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-[#FF5722]" />
                    <span>Thẩm định cơ hội & Đề xuất tiếp cận</span>
                  </div>

                  <button
                    disabled={scoringId === selectedLead.id}
                    onClick={() => handleScoreLead(selectedLead)}
                    className="px-3 py-1.5 rounded-lg bg-[#FF5722]/15 hover:bg-[#FF5722]/25 border border-[#FF5722]/30 text-[#FF5722] text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    {scoringId === selectedLead.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <RefreshCw className="w-3 h-3" />
                    )}
                    <span>
                      {(selectedLead.ai_score ?? selectedLead.aiScore) !== undefined
                        ? 'Thẩm định lại'
                        : 'Kích hoạt thẩm định'}
                    </span>
                  </button>
                </div>

                {(selectedLead.ai_score ?? selectedLead.aiScore) !== undefined ? (
                  <div className="space-y-4">
                    {/* SCORE & TIER GAUGE + ESTIMATED CONTRACT VALUE */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                      {/* CỘT ĐIỂM & TIER */}
                      <div className="sm:col-span-5 p-4 rounded-2xl bg-[#070A10] border border-slate-800 flex flex-col justify-between">
                        <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">
                          Chỉ số tiềm năng & Phân hạng
                        </span>

                        <div className="flex items-baseline gap-3 my-2">
                          <span className="text-4xl font-black text-white font-mono">
                            {selectedLead.ai_score ?? selectedLead.aiScore}
                          </span>
                          <span className="text-slate-500 font-mono text-sm">/ 100</span>

                          {(selectedLead.ai_tier || selectedLead.aiTier) === 'HOT' && (
                            <span className="ml-auto px-3 py-1 rounded-full text-xs font-bold tracking-wide bg-[#FF5722]/20 text-[#FF5722] border border-[#FF5722]/40 shadow-md shadow-[#FF5722]/20">
                              Tiềm năng cao
                            </span>
                          )}
                          {(selectedLead.ai_tier || selectedLead.aiTier) === 'WARM' && (
                            <span className="ml-auto px-3 py-1 rounded-full text-xs font-bold tracking-wide bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/40 shadow-md shadow-[#F59E0B]/20">
                              Tiềm năng
                            </span>
                          )}
                          {(selectedLead.ai_tier || selectedLead.aiTier) === 'COLD' && (
                            <span className="ml-auto px-3 py-1 rounded-full text-xs font-bold tracking-wide bg-[#64748B]/25 text-slate-300 border border-[#64748B]/40">
                              Ít tiềm năng
                            </span>
                          )}
                        </div>

                        {/* THANH ĐIỂM TIẾN ĐỘ */}
                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              (selectedLead.ai_tier || selectedLead.aiTier) === 'HOT'
                                ? 'bg-gradient-to-r from-orange-500 to-[#FF5722]'
                                : (selectedLead.ai_tier || selectedLead.aiTier) === 'WARM'
                                ? 'bg-[#F59E0B]'
                                : 'bg-[#64748B]'
                            }`}
                            style={{
                              width: `${Math.max(10, selectedLead.ai_score ?? selectedLead.aiScore ?? 0)}%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* CỘT GIÁ TRỊ HỢP ĐỒNG ƯỚC TÍNH */}
                      <div className="sm:col-span-7 p-4 rounded-2xl bg-gradient-to-br from-[#070A10] to-[#0D1527] border border-slate-800 flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono uppercase text-[#00E5FF] font-bold">
                            Giá Trị Hợp Đồng Ước Tính (Estimated Value)
                          </span>
                          <ShieldCheck className="w-3.5 h-3.5 text-[#00E5FF]" />
                        </div>
                        <p className="text-xl md:text-2xl font-black text-white font-mono my-2 text-[#00E5FF]">
                          {selectedLead.ai_estimated_value || selectedLead.aiEstimatedValue || 'Chưa xác định'}
                        </p>
                        <span className="text-[10px] text-slate-400">
                          Dựa trên mức ngân sách dự kiến và bảng giá dịch vụ thực tế S-Digital.
                        </span>
                      </div>
                    </div>

                    {/* MỤC SUMMARY -> NHẬN ĐỊNH NHU CẦU */}
                    <div className="p-4 rounded-2xl bg-[#070A10] border border-slate-800 space-y-1.5">
                      <div className="flex items-center gap-2 text-slate-300 font-bold text-[11px] uppercase font-mono">
                        <Target className="w-3.5 h-3.5 text-[#FF5722]" />
                        <span>Nhận định nhu cầu:</span>
                      </div>
                      <p className="text-slate-200 leading-relaxed font-normal text-xs">
                        {selectedLead.ai_summary || selectedLead.aiSummary}
                      </p>
                    </div>

                    {/* MỤC ACTIONPLAN -> KỊCH BẢN TƯ VẤN ĐỀ XUẤT */}
                    <div className="p-4 rounded-2xl bg-[#070A10] border border-slate-800 space-y-1.5">
                      <div className="flex items-center gap-2 text-slate-300 font-bold text-[11px] uppercase font-mono">
                        <Clock className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Kịch bản tư vấn đề xuất:</span>
                      </div>
                      <p className="text-slate-200 leading-relaxed font-normal text-xs">
                        {selectedLead.ai_action_plan || selectedLead.aiActionPlan}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 rounded-2xl bg-[#070A10] border border-dashed border-slate-800 text-center space-y-3">
                    <p className="text-slate-400 text-xs">
                      Khách hàng này chưa có dữ liệu thẩm định chất lượng.
                    </p>
                    <button
                      disabled={scoringId === selectedLead.id}
                      onClick={() => handleScoreLead(selectedLead)}
                      className="px-4 py-2 rounded-xl bg-[#FF5722] hover:bg-[#FF5722]/90 text-white font-bold text-xs inline-flex items-center gap-2 cursor-pointer shadow-lg shadow-[#FF5722]/20"
                    >
                      {scoringId === selectedLead.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4" />
                      )}
                      <span>Kích hoạt thẩm định ngay</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* MODAL FOOTER */}
            <div className="p-4 md:p-5 border-t border-slate-800 bg-[#0B0F19] flex items-center justify-between">
              <div className="text-[10px] text-slate-500 font-mono">
                {selectedLead.source || 'Landing Page'} · Tiếp nhận:{' '}
                {selectedLead.created_at ? new Date(selectedLead.created_at).toLocaleString('vi-VN') : '---'}
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}