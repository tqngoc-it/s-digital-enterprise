'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  createPricingPlanAction,
  updatePricingPlanAction,
  deletePricingPlanAction,
  reorderPricingAction,
} from '@/app/actions/admin-pricing';
import {
  Plus,
  Trash2,
  Edit2,
  X,
  Loader2,
  CheckCircle2,
  Sparkles,
  ArrowUp,
  ArrowDown,
  AlertCircle,
  GripVertical,
} from 'lucide-react';
import { PricingPlanItem } from '@/lib/fallbackData';
import { parseVietnameseCurrency } from '@/lib/currency';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortablePricingCard({
  p,
  idx,
  totalLength,
  onEdit,
  onDelete,
  onMove,
}: {
  p: PricingPlanItem;
  idx: number;
  totalLength: number;
  onEdit: (plan: PricingPlanItem) => void;
  onDelete: (id?: string) => void;
  onMove: (idx: number, dir: 'UP' | 'DOWN') => void;
}) {
  const sortableId = String(p.id || `pricing-plan-${idx}`);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: sortableId });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition: isDragging ? undefined : transition,
    zIndex: isDragging ? 50 : undefined,
  };

  const isPopular = p.popular || (p as any).is_popular;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-6 rounded-3xl bg-[#0B0F19] border flex flex-col justify-between space-y-6 relative ${
        isDragging
          ? 'opacity-80 ring-2 ring-[#FF5722] shadow-2xl z-50 scale-[1.02] bg-[#0E1322]'
          : isPopular
          ? 'border-[#FF5722]/50 shadow-lg shadow-[#FF5722]/10'
          : 'border-white/10 hover:border-white/20'
      }`}
    >
      {isPopular && (
        <span className="absolute -top-3 left-6 px-3 py-0.5 rounded-full bg-[#FF5722] text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-md shadow-[#FF5722]/30">
          <Sparkles className="w-3 h-3" />
          <span>Phổ biến nhất</span>
        </span>
      )}

      <div className="space-y-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                {...attributes}
                {...listeners}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-grab active:cursor-grabbing touch-none transition-colors"
                title="Kéo thả để sắp xếp vị trí"
              >
                <GripVertical className="w-4 h-4" />
              </button>
              <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 font-mono text-[10px] text-[#00E5FF] font-bold">
                #{idx + 1}
              </span>
              <h3 className="text-lg font-black text-white">{p.tier_name}</h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">{p.target_audience}</p>
          </div>
          <div className="text-right shrink-0">
            <span className="text-sm font-black text-[#FF5722] block">{p.price_display}</span>
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-white/5">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Quyền lợi:</span>
          <ul className="space-y-1.5 text-xs text-slate-300">
            {p.features?.map((f, fIdx) => (
              <li key={`feat-${idx}-${fIdx}`} className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 pt-4 border-t border-white/5">
        {/* CỤM NÚT ĐIỀU HƯỚNG LÊN / XUỐNG */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={idx === 0}
            onClick={() => onMove(idx, 'UP')}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white disabled:opacity-25 disabled:cursor-not-allowed transition-all border border-white/5 cursor-pointer"
            title="Di chuyển lên trước"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            disabled={idx === totalLength - 1}
            onClick={() => onMove(idx, 'DOWN')}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white disabled:opacity-25 disabled:cursor-not-allowed transition-all border border-white/5 cursor-pointer"
            title="Di chuyển xuống sau"
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* SỬA / XÓA */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(p)}
            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Sửa</span>
          </button>
          {p.id && (
            <button
              onClick={() => onDelete(p.id)}
              className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PricingClient({ initialPlans }: { initialPlans: PricingPlanItem[] }) {
  const router = useRouter();
  const [plans, setPlans] = useState<PricingPlanItem[]>(initialPlans);
  const [mounted, setMounted] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Live currency preview state
  const [createPriceInput, setCreatePriceInput] = useState('');
  const [editPriceInput, setEditPriceInput] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setPlans(initialPlans);
  }, [initialPlans]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = plans.findIndex(
      (p, idx) => String(p.id || `pricing-plan-${idx}`) === String(active.id)
    );
    const newIndex = plans.findIndex(
      (p, idx) => String(p.id || `pricing-plan-${idx}`) === String(over.id)
    );

    if (oldIndex === -1 || newIndex === -1) return;

    const originalPlans = [...plans];
    const updated = arrayMove(plans, oldIndex, newIndex);

    // Optimistic UI update
    setPlans(updated);

    const orderedIds = updated.map((p) => String(p.id)).filter(Boolean);
    const res = await reorderPricingAction(orderedIds);
    if (res.success) {
      setToast({ message: 'Đã cập nhật thứ tự hiển thị thành công!', type: 'success' });
    } else {
      setPlans(originalPlans);
      setToast({ message: res.error || 'Cập nhật thứ tự thất bại, đã khôi phục lại vị trí cũ', type: 'error' });
    }
  }

  async function handleMove(index: number, direction: 'UP' | 'DOWN') {
    const targetIndex = direction === 'UP' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= plans.length) return;

    const originalPlans = [...plans];
    const updated = [...plans];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);

    setPlans(updated);

    const orderedIds = updated.map((p) => String(p.id)).filter(Boolean);
    const res = await reorderPricingAction(orderedIds);
    if (res.success) {
      setToast({ message: 'Đã cập nhật thứ tự hiển thị thành công!', type: 'success' });
    } else {
      setPlans(originalPlans);
      setToast({ message: res.error || 'Cập nhật thứ tự thất bại, đã khôi phục lại vị trí cũ', type: 'error' });
    }
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const isPopular = formData.get('is_popular') === 'true' || formData.get('is_popular') === 'on';

    const res = await createPricingPlanAction(formData);
    if (res.success) {
      if (isPopular) {
        setPlans((prev) =>
          prev.map((plan) => ({
            ...plan,
            popular: false,
            is_popular: false,
          }))
        );
      }
      router.refresh();
      setIsCreating(false);
      setCreatePriceInput('');
      form.reset();
      setToast({ message: 'Thêm gói giá mới thành công!', type: 'success' });
    } else {
      alert(res.error || 'Tạo mới thất bại');
    }
    setIsSubmitting(false);
  }

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editingPlan || !editingPlan.id) return;
    setIsSubmitting(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const isPopular = formData.get('is_popular') === 'true' || formData.get('is_popular') === 'on';

    const res = await updatePricingPlanAction(editingPlan.id, formData);
    if (res.success) {
      if (isPopular) {
        setPlans((prev) =>
          prev.map((plan) => ({
            ...plan,
            popular: plan.id === editingPlan.id,
            is_popular: plan.id === editingPlan.id,
          }))
        );
      } else {
        setPlans((prev) =>
          prev.map((plan) =>
            plan.id === editingPlan.id
              ? { ...plan, popular: false, is_popular: false }
              : plan
          )
        );
      }
      router.refresh();
      setEditingPlan(null);
      setToast({ message: 'Cập nhật gói giá thành công!', type: 'success' });
    } else {
      alert(res.error || 'Cập nhật thất bại');
    }
    setIsSubmitting(false);
  }

  async function handleDelete(id?: string) {
    if (!id || id.startsWith('new-')) {
      alert('ID không hợp lệ hoặc dữ liệu chưa được lưu đồng bộ');
      return;
    }
    if (!confirm('Bạn có chắc muốn xóa gói giá này?')) return;

    const res = await deletePricingPlanAction(id);
    if (res.success) {
      router.refresh();
      setToast({ message: 'Đã xóa gói giá thành công!', type: 'success' });
    } else {
      alert(res.error || 'Xóa thất bại');
    }
  }

  const createPreview = createPriceInput ? parseVietnameseCurrency(createPriceInput) : null;
  const editPreview = editPriceInput ? parseVietnameseCurrency(editPriceInput) : null;

  return (
    <div className="space-y-6">
      {/* TOAST NOTIFICATION */}
      {toast && (
        <div
          className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs font-semibold animate-in fade-in slide-in-from-top-2 duration-200 ${
            toast.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}
        >
          <div className="flex items-center gap-2">
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
          <button onClick={() => setToast(null)} className="p-1 text-slate-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <p className="text-xs text-slate-400">Danh sách ({plans.length} gói giá hiện hoạt)</p>
          <p className="text-[11px] text-slate-500">
            Kéo thả biểu tượng <strong>⋮⋮</strong> hoặc bấm nút <strong>[Lên] / [Xuống]</strong> để sắp xếp thứ tự hiển thị trực tiếp.
          </p>
        </div>
        <button
          onClick={() => {
            setCreatePriceInput('');
            setIsCreating(true);
          }}
          className="px-5 py-2.5 rounded-xl bg-[#FF5722] hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-[#FF5722]/30 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Gói Giá Mới</span>
        </button>
      </div>

      {mounted ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={plans.map((p, idx) => String(p.id || `pricing-plan-${idx}`))}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((p, idx) => (
                <SortablePricingCard
                  key={p.id || `pricing-plan-${idx}`}
                  p={p}
                  idx={idx}
                  totalLength={plans.length}
                  onEdit={(plan) => {
                    setEditingPlan(plan);
                    setEditPriceInput(plan.price_display);
                  }}
                  onDelete={handleDelete}
                  onMove={handleMove}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((p, idx) => (
            <SortablePricingCard
              key={p.id || `pricing-plan-${idx}`}
              p={p}
              idx={idx}
              totalLength={plans.length}
              onEdit={(plan) => {
                setEditingPlan(plan);
                setEditPriceInput(plan.price_display);
              }}
              onDelete={handleDelete}
              onMove={handleMove}
            />
          ))}
        </div>
      )}

      {/* CREATE MODAL */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="max-w-lg w-full p-6 md:p-8 rounded-3xl bg-[#0B0F19] border border-white/15 space-y-5 text-xs shadow-2xl relative my-8">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-black text-white">Thêm Gói Dịch Vụ Mới</h3>
              <button
                onClick={() => setIsCreating(false)}
                className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white cursor-pointer"
              >
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
                  className="w-full p-3 rounded-xl bg-[#060913] border border-white/10 text-white focus:outline-none focus:border-[#FF5722]"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">
                  Mức Giá (Nhập: 45tr, 45 triệu, 45.000.000 hoặc Liên hệ) *
                </label>
                <input
                  type="text"
                  name="price_display"
                  required
                  value={createPriceInput}
                  onChange={(e) => setCreatePriceInput(e.target.value)}
                  placeholder="VD: 35tr, 45 triệu hoặc Từ 35 Triệu/tháng"
                  className="w-full p-3 rounded-xl bg-[#060913] border border-white/10 text-white focus:outline-none focus:border-[#FF5722]"
                />
                {createPreview && (
                  <p className="mt-1 text-[11px] text-emerald-400 font-mono">
                    ✓ Hệ thống sẽ lưu chuẩn hóa: <strong>{createPreview.formattedDisplay}</strong>
                  </p>
                )}
              </div>

              <div className="flex items-center py-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" name="is_popular" className="sr-only peer" />
                  <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#FF5722]"></div>
                  <span className="ml-2 text-xs font-bold text-slate-300">Gói phổ biến (Đánh dấu nổi bật)</span>
                </label>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Đối Tượng Phù Hợp</label>
                <input
                  type="text"
                  name="target_audience"
                  placeholder="VD: Phù hợp cho doanh nghiệp đang mở rộng quy mô..."
                  className="w-full p-3 rounded-xl bg-[#060913] border border-white/10 text-white focus:outline-none focus:border-[#FF5722]"
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
                  className="w-full p-3 rounded-xl bg-[#060913] border border-white/10 text-white focus:outline-none focus:border-[#FF5722]"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-[#FF5722] hover:bg-orange-600 text-white font-bold transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>Lưu Gói Giá Mới</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="max-w-lg w-full p-6 md:p-8 rounded-3xl bg-[#0B0F19] border border-white/15 space-y-5 text-xs shadow-2xl relative my-8">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-black text-white">Chỉnh Sửa Gói Giá</h3>
              <button
                onClick={() => setEditingPlan(null)}
                className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white cursor-pointer"
              >
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
                  className="w-full p-3 rounded-xl bg-[#060913] border border-white/10 text-white focus:outline-none focus:border-[#FF5722]"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">
                  Mức Giá Hiển Thị (Nhập: 45tr, 45 triệu, 45.000.000 hoặc Liên hệ) *
                </label>
                <input
                  type="text"
                  name="price_display"
                  required
                  value={editPriceInput}
                  onChange={(e) => setEditPriceInput(e.target.value)}
                  className="w-full p-3 rounded-xl bg-[#060913] border border-white/10 text-white focus:outline-none focus:border-[#FF5722]"
                />
                {editPreview && (
                  <p className="mt-1 text-[11px] text-emerald-400 font-mono">
                    ✓ Hệ thống sẽ lưu chuẩn hóa: <strong>{editPreview.formattedDisplay}</strong>
                  </p>
                )}
              </div>

              <div className="flex items-center py-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_popular"
                    defaultChecked={Boolean(editingPlan.popular || editingPlan.is_popular)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#FF5722]"></div>
                  <span className="ml-2 text-xs font-bold text-slate-300">Gói phổ biến (Đánh dấu nổi bật)</span>
                </label>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Đối Tượng Phù Hợp</label>
                <input
                  type="text"
                  name="target_audience"
                  defaultValue={editingPlan.target_audience}
                  className="w-full p-3 rounded-xl bg-[#060913] border border-white/10 text-white focus:outline-none focus:border-[#FF5722]"
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
                  className="w-full p-3 rounded-xl bg-[#060913] border border-white/10 text-white focus:outline-none focus:border-[#FF5722]"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-[#FF5722] hover:bg-orange-600 text-white font-bold transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>Lưu Thay Đổi</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

