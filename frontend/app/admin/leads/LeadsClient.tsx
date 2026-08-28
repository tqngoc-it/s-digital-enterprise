'use client';

import { useState } from 'react';
import { updateLeadStatusAction, deleteLeadAction } from '@/app/actions/admin-leads';
import { Search, Trash2, Eye, X, Loader2, CheckCircle2, UserCheck, Mail, Phone, Building } from 'lucide-react';

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  NEW: { label: 'Mới tiếp nhận', color: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  CONTACTED: { label: 'Đang tư vấn', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  QUALIFIED: { label: 'Tiềm năng cao', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  CLOSED: { label: 'Đã chốt HĐ', color: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
  REJECTED: { label: 'Từ chối / Spam', color: 'bg-red-500/15 text-red-400 border-red-500/30' },
};

export default function LeadsClient({ initialLeads }: { initialLeads: any[] }) {
  const [leads, setLeads] = useState(initialLeads);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<any | null>(null);

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
      alert(res.error || 'Cập nhật thất bại');
    }
    setUpdatingId(null);
  }

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

  const filteredLeads = leads.filter((lead) => {
    const matchSearch =
      lead.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone?.includes(searchTerm) ||
      lead.company_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || lead.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* FILTER & SEARCH */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo họ tên, email, SĐT, công ty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-[#0B0F19] border border-white/10 text-white text-xs focus:outline-none focus:border-[#FF5722]"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="p-2.5 rounded-xl bg-[#0B0F19] border border-white/10 text-xs text-white cursor-pointer"
        >
          <option value="ALL">Tất cả trạng thái ({leads.length})</option>
          {Object.entries(STATUS_CONFIG).map(([k, v]) => (
            <option key={k} value={k}>
              {v.label} ({leads.filter((l) => l.status === k).length})
            </option>
          ))}
        </select>
      </div>

      {/* TABLE */}
      <div className="rounded-2xl bg-[#0B0F19] border border-white/10 overflow-x-auto shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-white/[0.02] border-b border-white/5 text-slate-400 uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-4 px-6 font-semibold">Khách Hàng</th>
              <th className="py-4 px-6 font-semibold">Liên Hệ</th>
              <th className="py-4 px-6 font-semibold">Công Ty</th>
              <th className="py-4 px-6 font-semibold">Lời Nhắn</th>
              <th className="py-4 px-6 font-semibold">Trạng Thái</th>
              <th className="py-4 px-6 font-semibold">Ngày Gửi</th>
              <th className="py-4 px-6 font-semibold text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredLeads.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500">
                  Không tìm thấy dữ liệu Lead nào.
                </td>
              </tr>
            ) : (
              filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-6 font-bold text-white whitespace-nowrap">
                    {lead.full_name}
                  </td>
                  <td className="py-4 px-6 text-slate-300">
                    <p className="font-medium text-white">{lead.email}</p>
                    <p className="text-slate-500 text-[11px] font-mono">{lead.phone || 'Chưa cung cấp SĐT'}</p>
                  </td>
                  <td className="py-4 px-6 text-slate-300 whitespace-nowrap">
                    {lead.company_name || '---'}
                  </td>
                  <td className="py-4 px-6 text-slate-400 max-w-xs truncate">
                    {lead.message || lead.notes || '---'}
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    <select
                      disabled={updatingId === lead.id}
                      value={lead.status || 'NEW'}
                      onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                      className={`p-1.5 rounded-lg text-[11px] font-bold border cursor-pointer ${
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
                  <td className="py-4 px-6 text-slate-400 font-mono whitespace-nowrap text-[11px]">
                    {lead.created_at ? new Date(lead.created_at).toLocaleDateString('vi-VN') : '---'}
                  </td>
                  <td className="py-4 px-6 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedLead(lead)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        disabled={updatingId === lead.id}
                        onClick={() => handleDelete(lead.id)}
                        className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400"
                        title="Xóa lead"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* VIEW LEAD DETAILS MODAL */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="max-w-lg w-full p-6 md:p-8 rounded-3xl bg-[#0B0F19] border border-white/15 space-y-6 shadow-2xl relative text-xs">
            <button
              onClick={() => setSelectedLead(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <span className="text-[10px] font-mono uppercase text-[#FF5722] font-bold">
                LEAD DETAILS #{selectedLead.id?.slice(0, 8)}
              </span>
              <h3 className="text-xl font-black text-white mt-1">{selectedLead.full_name}</h3>
            </div>

            <div className="space-y-3 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="flex items-center gap-2 text-slate-300">
                <Mail className="w-4 h-4 text-[#FF5722]" />
                <span>{selectedLead.email}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>{selectedLead.phone || 'Chưa cung cấp'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Building className="w-4 h-4 text-cyan-400" />
                <span>{selectedLead.company_name || 'Không có tên công ty'}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Nội dung tư vấn / Lời nhắn:
              </label>
              <div className="p-4 rounded-xl bg-[#060913] border border-white/10 text-slate-200 leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap">
                {selectedLead.message || selectedLead.notes || 'Không có lời nhắn.'}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div>
                <span className="text-[10px] text-slate-500">
                  Nguồn: {selectedLead.source || 'Landing Page'} · {selectedLead.created_at ? new Date(selectedLead.created_at).toLocaleString('vi-VN') : ''}
                </span>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs"
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