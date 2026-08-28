'use client';

import { useState } from 'react';
import { createPartnerAction, updatePartnerAction, deletePartnerAction } from '@/app/actions/admin-partners';
import { Plus, Trash2, Edit2, X, Loader2, Building, Handshake, Search } from 'lucide-react';
import { PartnerItem } from '@/lib/fallbackData';

export default function PartnersClient({ initialPartners }: { initialPartners: PartnerItem[] }) {
  const [partners, setPartners] = useState<PartnerItem[]>(initialPartners);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [editingPartner, setEditingPartner] = useState<PartnerItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredPartners = partners.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.industry && p.industry.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchType = typeFilter === 'ALL' || p.type === typeFilter;
    return matchSearch && matchType;
  });

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    const form = e.currentTarget;
    const formData = new FormData(form);

    const res = await createPartnerAction(formData);
    if (res.success) {
      const newPartner: PartnerItem = {
        id: 'new-' + Date.now(),
        name: (formData.get('name') as string) || '',
        type: ((formData.get('type') as string) || 'CUSTOMER') as 'CUSTOMER' | 'PARTNER',
        industry: (formData.get('industry') as string) || '',
        website_url: (formData.get('website_url') as string) || '',
        display_order: parseInt((formData.get('display_order') as string) || '0', 10),
      };
      setPartners((prev) => [...prev, newPartner]);
      setIsCreating(false);
    } else {
      alert(res.error || 'Tạo đối tác thất bại');
    }
    setIsSubmitting(false);
  }

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editingPartner || !editingPartner.id) return;
    setIsSubmitting(true);
    const form = e.currentTarget;
    const formData = new FormData(form);

    const res = await updatePartnerAction(editingPartner.id, formData);
    if (res.success) {
      setPartners((prev) =>
        prev.map((p) =>
          p.id === editingPartner.id
            ? {
                ...p,
                name: (formData.get('name') as string) || p.name,
                type: ((formData.get('type') as string) || p.type) as 'CUSTOMER' | 'PARTNER',
                industry: (formData.get('industry') as string) || p.industry,
                website_url: (formData.get('website_url') as string) || p.website_url,
                display_order: parseInt((formData.get('display_order') as string) || '0', 10),
              }
            : p
        )
      );
      setEditingPartner(null);
    } else {
      alert(res.error || 'Cập nhật đối tác thất bại');
    }
    setIsSubmitting(false);
  }

  async function handleDelete(id?: string) {
    if (!id) return;
    if (!confirm('Bạn có chắc muốn xóa đối tác này?')) return;
    const res = await deletePartnerAction(id);
    if (res.success) {
      setPartners((prev) => prev.filter((p) => p.id !== id));
    } else {
      alert(res.error || 'Xóa đối tác thất bại');
    }
  }

  return (
    <div className="space-y-6">
      {/* ACTION BAR */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="flex flex-1 gap-3 w-full sm:w-auto max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo tên thương hiệu, ngành nghề..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-[#0B0F19] border border-white/10 text-white text-xs focus:outline-none focus:border-[#00E5FF]"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="p-2.5 rounded-xl bg-[#0B0F19] border border-white/10 text-xs text-white cursor-pointer"
          >
            <option value="ALL">Tất cả ({partners.length})</option>
            <option value="CUSTOMER">Khách hàng ({partners.filter((p) => p.type === 'CUSTOMER').length})</option>
            <option value="PARTNER">Đối tác ({partners.filter((p) => p.type === 'PARTNER').length})</option>
          </select>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#FF5722] hover:bg-orange-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#FF5722]/30 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Đối Tác / Khách Hàng</span>
        </button>
      </div>

      {/* TABLE */}
      <div className="rounded-2xl bg-[#0B0F19] border border-white/10 overflow-x-auto shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-white/[0.02] border-b border-white/5 text-slate-400 uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-4 px-6 font-semibold">Tên Thương Hiệu</th>
              <th className="py-4 px-6 font-semibold">Phân Loại</th>
              <th className="py-4 px-6 font-semibold">Ngành Nghề / Lĩnh Vực</th>
              <th className="py-4 px-6 font-semibold">Thứ Tự</th>
              <th className="py-4 px-6 font-semibold text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredPartners.map((p, idx) => (
              <tr key={p.id || idx} className="hover:bg-white/[0.02]">
                <td className="py-4 px-6 font-bold text-white flex items-center gap-2.5">
                  <span className={`w-2 h-2 rounded-full ${p.type === 'CUSTOMER' ? 'bg-[#FF5722]' : 'bg-[#00E5FF]'}`} />
                  <span>{p.name}</span>
                </td>
                <td className="py-4 px-6">
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase ${
                      p.type === 'CUSTOMER'
                        ? 'bg-[#FF5722]/10 text-[#FF5722] border border-[#FF5722]/20'
                        : 'bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20'
                    }`}
                  >
                    {p.type === 'CUSTOMER' ? 'Khách Hàng' : 'Đối Tác Chiến Lược'}
                  </span>
                </td>
                <td className="py-4 px-6 text-slate-300">{p.industry || '---'}</td>
                <td className="py-4 px-6 text-slate-400 font-mono">{p.display_order ?? idx + 1}</td>
                <td className="py-4 px-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setEditingPartner(p)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white"
                      title="Sửa"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {p.id && (
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400"
                        title="Xóa"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CREATE MODAL */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="max-w-md w-full p-6 rounded-3xl bg-[#0B0F19] border border-white/15 space-y-5 text-xs shadow-2xl relative">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-white">Thêm Khách Hàng / Đối Tác Mới</h3>
              <button onClick={() => setIsCreating(false)} className="p-1.5 rounded-lg bg-white/5 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Tên Thương Hiệu / Đơn Vị *</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="VD: Vinamilk / ĐH TDTT..."
                  className="w-full p-3 rounded-xl bg-[#060913] border border-white/10 text-white focus:outline-none focus:border-[#FF5722]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Phân Loại</label>
                  <select
                    name="type"
                    className="w-full p-3 rounded-xl bg-[#060913] border border-white/10 text-white focus:outline-none focus:border-[#FF5722]"
                  >
                    <option value="CUSTOMER">Khách Hàng (Customer)</option>
                    <option value="PARTNER">Đối Tác Chiến Lược (Partner)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Thứ Tự Hiển Thị</label>
                  <input
                    type="number"
                    name="display_order"
                    defaultValue={partners.length + 1}
                    className="w-full p-3 rounded-xl bg-[#060913] border border-white/10 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Ngành Nghề / Lĩnh Vực</label>
                <input
                  type="text"
                  name="industry"
                  placeholder="VD: Tài chính Ngân hàng / Thể thao"
                  className="w-full p-3 rounded-xl bg-[#060913] border border-white/10 text-white"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-[#FF5722] hover:bg-orange-600 text-white font-bold transition-all shadow-lg flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Lưu Đối Tác Mới</span>}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="max-w-md w-full p-6 rounded-3xl bg-[#0B0F19] border border-white/15 space-y-5 text-xs shadow-2xl relative">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-white">Chỉnh Sửa Đối Tác</h3>
              <button onClick={() => setEditingPartner(null)} className="p-1.5 rounded-lg bg-white/5 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Tên Thương Hiệu *</label>
                <input
                  type="text"
                  name="name"
                  required
                  defaultValue={editingPartner.name}
                  className="w-full p-3 rounded-xl bg-[#060913] border border-white/10 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Phân Loại</label>
                  <select
                    name="type"
                    defaultValue={editingPartner.type}
                    className="w-full p-3 rounded-xl bg-[#060913] border border-white/10 text-white"
                  >
                    <option value="CUSTOMER">Khách Hàng (Customer)</option>
                    <option value="PARTNER">Đối Tác (Partner)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Thứ Tự</label>
                  <input
                    type="number"
                    name="display_order"
                    defaultValue={editingPartner.display_order || 1}
                    className="w-full p-3 rounded-xl bg-[#060913] border border-white/10 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Ngành Nghề</label>
                <input
                  type="text"
                  name="industry"
                  defaultValue={editingPartner.industry || ''}
                  className="w-full p-3 rounded-xl bg-[#060913] border border-white/10 text-white"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-[#00E5FF] hover:bg-cyan-400 text-slate-950 font-bold transition-all shadow-lg flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Lưu Thay Đổi</span>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
