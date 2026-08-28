'use client';

import { useState } from 'react';
import { createPricingPlanAction, updatePricingPlanAction, deletePricingPlanAction } from '@/app/actions/admin-pricing';
import { Plus, Trash2, Edit2, X, Loader2, CheckCircle2 } from 'lucide-react';
import { PricingPlanItem } from '@/lib/fallbackData';

export default function PricingClient({ initialPlans }: { initialPlans: PricingPlanItem[] }) {
  const [plans, setPlans] = useState<PricingPlanItem[]>(initialPlans);
  const [editingPlan, setEditingPlan] = useState<PricingPlanItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    const form = e.currentTarget;
    const formData = new FormData(form);

    const res = await createPricingPlanAction(formData);
    if (res.success) {
      const features = ((formData.get('features') as string) || '')
        .split('\n')
        .map((f) => f.trim())
        .filter(Boolean);

      const newPlan: PricingPlanItem = {
        id: 'new-' + Date.now(),
        tier_name: (formData.get('tier_name') as string) || '',
        target_audience: (formData.get('target_audience') as string) || '',
        price_display: (formData.get('price_display') as string) || '',
        features,
      };
      setPlans((prev) => [...prev, newPlan]);
      setIsCreating(false);
    } else {
      alert(res.error || 'Tạo gói giá thất bại');
    }
    setIsSubmitting(false);
  }

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editingPlan || !editingPlan.id) return;
    setIsSubmitting(true);
    const form = e.currentTarget;
    const formData = new FormData(form);

    const res = await updatePricingPlanAction(editingPlan.id, formData);
    if (res.success) {
      const features = ((formData.get('features') as string) || '')
        .split('\n')
        .map((f) => f.trim())
        .filter(Boolean);

      setPlans((prev) =>
        prev.map((p) =>
          p.id === editingPlan.id
            ? {
                ...p,
                tier_name: (formData.get('tier_name') as string) || p.tier_name,
                target_audience: (formData.get('target_audience') as string) || p.target_audience,
                price_display: (formData.get('price_display') as string) || p.price_display,
                features,
              }
            : p
        )
      );
      setEditingPlan(null);
    } else {
      alert(res.error || 'Cập nhật thất bại');
    }
    setIsSubmitting(false);
  }

  async function handleDelete(id?: string) {
    if (!id) return;
    if (!confirm('Bạn có chắc muốn xóa gói dịch vụ này?')) return;
    const res = await deletePricingPlanAction(id);
    if (res.success) {
      setPlans((prev) => prev.filter((p) => p.id !== id));
    } else {
      alert(res.error || 'Xóa gói giá thất bại');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-xs text-slate-400">Danh sách ({plans.length} gói giá hiện hoạt)</p>
        <button
          onClick={() => setIsCreating(true)}
          className="px-5 py-2.5 rounded-xl bg-[#FF5722] hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-[#FF5722]/30 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Gói Giá Mới</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((p, idx) => (
          <div
            key={p.id || idx}
            className="p-6 rounded-3xl bg-[#0B0F19] border border-white/10 flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-white">{p.tier_name}</h3>
                <span className="text-sm font-black text-[#FF5722]">{p.price_display}</span>
              </div>
              <p className="text-xs text-slate-400">{p.target_audience}</p>

              <div className="space-y-2 pt-2 border-t border-white/5">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Quyền lợi:</span>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {p.features?.map((f, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/5">
              <button
                onClick={() => setEditingPlan(p)}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold flex items-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Sửa</span>
              </button>
              {p.id && (
                <button
                  onClick={() => handleDelete(p.id)}
                  className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* CREATE MODAL */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="max-w-lg w-full p-6 rounded-3xl bg-[#0B0F19] border border-white/15 space-y-5 text-xs shadow-2xl relative">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-white">Thêm Gói Dịch Vụ Mới</h3>
              <button onClick={() => setIsCreating(false)} className="p-1.5 rounded-lg bg-white/5 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Tên Gói Dịch Vụ *</label>
                <input
                  type="text"
                  name="tier_name"
                  required
                  placeholder="VD: Gói Tăng Trưởng Toàn Diện"
                  className="w-full p-3 rounded-xl bg-[#060913] border border-white/10 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Mức Giá Hiển Thị *</label>
                <input
                  type="text"
                  name="price_display"
                  required
                  placeholder="VD: Từ 25 Triệu/tháng"
                  className="w-full p-3 rounded-xl bg-[#060913] border border-white/10 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Đối Tượng Phù Hợp</label>
                <input
                  type="text"
                  name="target_audience"
                  placeholder="VD: Phù hợp cho doanh nghiệp đang mở rộng quy mô..."
                  className="w-full p-3 rounded-xl bg-[#060913] border border-white/10 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">
                  Danh Sách Tính Năng (Mỗi dòng 1 tính năng)
                </label>
                <textarea
                  name="features"
                  rows={4}
                  placeholder="Quảng cáo Google/Meta tối ưu CPA&#10;Sản xuất 4 video ngắn viral&#10;Báo cáo realtime 24/7"
                  className="w-full p-3 rounded-xl bg-[#060913] border border-white/10 text-white"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-[#FF5722] hover:bg-orange-600 text-white font-bold transition-all shadow-lg flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Lưu Gói Giá Mới</span>}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="max-w-lg w-full p-6 rounded-3xl bg-[#0B0F19] border border-white/15 space-y-5 text-xs shadow-2xl relative">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-white">Chỉnh Sửa Gói Giá</h3>
              <button onClick={() => setEditingPlan(null)} className="p-1.5 rounded-lg bg-white/5 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Tên Gói Dịch Vụ *</label>
                <input
                  type="text"
                  name="tier_name"
                  required
                  defaultValue={editingPlan.tier_name}
                  className="w-full p-3 rounded-xl bg-[#060913] border border-white/10 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Mức Giá Hiển Thị *</label>
                <input
                  type="text"
                  name="price_display"
                  required
                  defaultValue={editingPlan.price_display}
                  className="w-full p-3 rounded-xl bg-[#060913] border border-white/10 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Đối Tượng Phù Hợp</label>
                <input
                  type="text"
                  name="target_audience"
                  defaultValue={editingPlan.target_audience}
                  className="w-full p-3 rounded-xl bg-[#060913] border border-white/10 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">
                  Danh Sách Tính Năng (Mỗi dòng 1 tính năng)
                </label>
                <textarea
                  name="features"
                  rows={5}
                  defaultValue={editingPlan.features?.join('\n')}
                  className="w-full p-3 rounded-xl bg-[#060913] border border-white/10 text-white"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-[#FF5722] hover:bg-orange-600 text-white font-bold transition-all shadow-lg flex items-center justify-center gap-2"
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
