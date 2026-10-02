'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  createPartnerAction,
  updatePartnerAction,
  deletePartnerAction,
  reorderPartnersAction,
} from '@/app/actions/admin-partners';
import {
  Plus,
  Trash2,
  Edit2,
  X,
  Loader2,
  Building,
  Handshake,
  Search,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  AlertCircle,
  GripVertical,
} from 'lucide-react';
import { PartnerItem } from '@/lib/fallbackData';
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
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortablePartnerRow({
  p,
  idx,
  realIdx,
  totalLength,
  onEdit,
  onDelete,
  onMove,
}: {
  p: PartnerItem;
  idx: number;
  realIdx: number;
  totalLength: number;
  onEdit: (p: PartnerItem) => void;
  onDelete: (id?: string) => void;
  onMove: (idx: number, dir: 'UP' | 'DOWN') => void;
}) {
  const sortableId = String(p.id || `partner-${idx}-${p.name}`);
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

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`transition-colors ${
        isDragging
          ? 'opacity-80 ring-2 ring-[#FF5722] bg-[#0E1322] shadow-2xl relative z-30'
          : 'hover:bg-white/[0.02]'
      }`}
    >
      <td className="py-4 px-6 font-bold text-white min-w-[180px]">
        <div className="flex items-center gap-2">
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="p-1 -ml-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 cursor-grab active:cursor-grabbing touch-none select-none transition-colors shrink-0"
            title="Kéo thả để sắp xếp vị trí"
          >
            <GripVertical className="w-4 h-4" />
          </button>
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${
              p.type === 'CUSTOMER' ? 'bg-[#FF5722]' : 'bg-[#00E5FF]'
            }`}
          />
          <span className="whitespace-nowrap">{p.name}</span>
        </div>
      </td>
      <td className="py-4 px-6 w-[150px] min-w-[150px] whitespace-nowrap">
        <span
          className={`whitespace-nowrap shrink-0 inline-flex items-center justify-center px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase ${
            p.type === 'CUSTOMER'
              ? 'bg-[#FF5722]/10 text-[#FF5722] border border-[#FF5722]/20'
              : 'bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20'
          }`}
        >
          {p.type === 'CUSTOMER' ? 'Khách Hàng' : 'Đối Tác Chiến Lược'}
        </span>
      </td>
      <td className="py-4 px-6 text-slate-300 min-w-[180px] whitespace-nowrap">{p.industry || '---'}</td>
      <td className="py-4 px-6 w-[80px] min-w-[80px] text-center whitespace-nowrap">
        <span className="px-2.5 py-1 rounded-lg bg-orange-500/10 text-[#FF5722] font-mono font-bold border border-[#FF5722]/20 text-xs inline-block">
          #{realIdx + 1}
        </span>
      </td>
      <td className="py-4 px-6 text-right w-[150px] min-w-[150px] whitespace-nowrap">
        <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
          {/* CỤM NÚT ĐIỀU HƯỚNG LÊN / XUỐNG */}
          <div className="flex items-center gap-1 mr-1 shrink-0">
            <button
              type="button"
              disabled={realIdx === 0}
              onClick={() => onMove(realIdx, 'UP')}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all border border-white/5 cursor-pointer shrink-0"
              title="Di chuyển lên trước"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              disabled={realIdx === totalLength - 1}
              onClick={() => onMove(realIdx, 'DOWN')}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all border border-white/5 cursor-pointer shrink-0"
              title="Di chuyển xuống sau"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => onEdit(p)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white cursor-pointer shrink-0"
            title="Sửa"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          {p.id && (
            <button
              onClick={() => onDelete(p.id)}
              className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 cursor-pointer shrink-0"
              title="Xóa"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

export default function PartnersClient({ initialPartners }: { initialPartners: PartnerItem[] }) {
  const router = useRouter();
  const [partners, setPartners] = useState<PartnerItem[]>(initialPartners);
  const [mounted, setMounted] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [editingPartner, setEditingPartner] = useState<PartnerItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setPartners(initialPartners);
  }, [initialPartners]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = partners.findIndex(
      (p, idx) => String(p.id || `partner-${idx}-${p.name}`) === String(active.id)
    );
    const newIndex = partners.findIndex(
      (p, idx) => String(p.id || `partner-${idx}-${p.name}`) === String(over.id)
    );

    if (oldIndex === -1 || newIndex === -1) return;

    const originalPartners = [...partners];
    const updated = arrayMove(partners, oldIndex, newIndex);

    setPartners(updated);

    const orderedIds = updated.map((p) => String(p.id)).filter(Boolean);
    const res = await reorderPartnersAction(orderedIds);
    if (res.success) {
      setToast({ message: 'Đã cập nhật thứ tự hiển thị thành công!', type: 'success' });
    } else {
      setPartners(originalPartners);
      setToast({ message: res.error || 'Cập nhật thứ tự thất bại, đã khôi phục lại vị trí cũ', type: 'error' });
    }
  }

  async function handleMove(index: number, direction: 'UP' | 'DOWN') {
    const targetIndex = direction === 'UP' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= partners.length) return;

    const originalPartners = [...partners];
    const updated = [...partners];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);

    // Optimistic UI update
    setPartners(updated);

    const orderedIds = updated.map((p) => String(p.id)).filter(Boolean);
    const res = await reorderPartnersAction(orderedIds);
    if (res.success) {
      setToast({ message: 'Đã cập nhật thứ tự hiển thị thành công!', type: 'success' });
    } else {
      setPartners(originalPartners);
      setToast({ message: res.error || 'Cập nhật thứ tự thất bại, đã khôi phục lại vị trí cũ', type: 'error' });
    }
  }

  const filteredPartners = partners.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.industry && p.industry.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchType =
      typeFilter === 'ALL' ||
      p.type === typeFilter ||
      (typeFilter === 'PARTNER' && p.type === 'STRATEGIC_PARTNER');
    return matchSearch && matchType;
  });

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    const form = e.currentTarget;
    const formData = new FormData(form);

    const res = await createPartnerAction(formData);
    if (res.success) {
      router.refresh();
      setIsCreating(false);
      form.reset();
    } else {
      alert(res.error || 'Tạo mới thất bại');
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
      router.refresh();
      setEditingPartner(null);
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
    if (!confirm('Bạn có chắc muốn xóa mục này?')) return;

    const res = await deletePartnerAction(id);
    if (res.success) {
      router.refresh();
    } else {
      alert(res.error || 'Xóa thất bại');
    }
  }

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
          <button
            onClick={() => setToast(null)}
            className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

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
            <option value="PARTNER">
              Đối tác ({partners.filter((p) => p.type === 'PARTNER' || p.type === 'STRATEGIC_PARTNER').length})
            </option>
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
      <div className="rounded-2xl bg-[#0B0F19] border border-white/10 shadow-xl overflow-hidden">
        <div className="w-full overflow-x-auto pb-4">
          {mounted ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <table className="w-full min-w-[720px] text-left border-collapse text-xs">
                <thead className="bg-white/[0.02] border-b border-white/5 text-slate-400 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-4 px-6 font-semibold min-w-[180px]">Tên Thương Hiệu</th>
                    <th className="py-4 px-6 font-semibold w-[150px] min-w-[150px] whitespace-nowrap">Phân Loại</th>
                    <th className="py-4 px-6 font-semibold min-w-[180px]">Ngành Nghề / Lĩnh Vực</th>
                    <th className="py-4 px-6 font-semibold w-[80px] min-w-[80px] text-center">Thứ Tự</th>
                    <th className="py-4 px-6 font-semibold text-right w-[150px] min-w-[150px] whitespace-nowrap">Thao Tác</th>
                  </tr>
                </thead>
                <SortableContext
                  items={filteredPartners.map((p, idx) => String(p.id || `partner-${idx}-${p.name}`))}
                  strategy={verticalListSortingStrategy}
                >
                  <tbody className="divide-y divide-white/5">
                    {filteredPartners.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-400">
                          Không tìm thấy đối tác / khách hàng nào.
                        </td>
                      </tr>
                    ) : (
                      filteredPartners.map((p, idx) => {
                        const fullIdx = partners.findIndex((item) => item.id === p.id);
                        const realIdx = fullIdx !== -1 ? fullIdx : idx;

                        return (
                          <SortablePartnerRow
                            key={p.id || `partner-${idx}-${p.name}`}
                            p={p}
                            idx={idx}
                            realIdx={realIdx}
                            totalLength={partners.length}
                            onEdit={setEditingPartner}
                            onDelete={handleDelete}
                            onMove={handleMove}
                          />
                        );
                      })
                    )}
                  </tbody>
                </SortableContext>
              </table>
            </DndContext>
          ) : (
            <table className="w-full min-w-[720px] text-left border-collapse text-xs">
              <thead className="bg-white/[0.02] border-b border-white/5 text-slate-400 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-4 px-6 font-semibold min-w-[180px]">Tên Thương Hiệu</th>
                  <th className="py-4 px-6 font-semibold w-[150px] min-w-[150px] whitespace-nowrap">Phân Loại</th>
                  <th className="py-4 px-6 font-semibold min-w-[180px]">Ngành Nghề / Lĩnh Vực</th>
                  <th className="py-4 px-6 font-semibold w-[80px] min-w-[80px] text-center">Thứ Tự</th>
                  <th className="py-4 px-6 font-semibold text-right w-[150px] min-w-[150px] whitespace-nowrap">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredPartners.map((p, idx) => {
                  const fullIdx = partners.findIndex((item) => item.id === p.id);
                  const realIdx = fullIdx !== -1 ? fullIdx : idx;

                  return (
                    <SortablePartnerRow
                      key={p.id || `partner-${idx}-${p.name}`}
                      p={p}
                      idx={idx}
                      realIdx={realIdx}
                      totalLength={partners.length}
                      onEdit={setEditingPartner}
                      onDelete={handleDelete}
                      onMove={handleMove}
                    />
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
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

              <div>
                <label className="block text-slate-400 font-bold mb-1">Phân Loại</label>
                <select
                  name="type"
                  className="w-full p-3 rounded-xl bg-[#060913] border border-white/10 text-white focus:outline-none focus:border-[#FF5722]"
                >
                  <option value="CUSTOMER">Khách Hàng (Customer)</option>
                  <option value="STRATEGIC_PARTNER">Đối Tác Chiến Lược (Partner)</option>
                </select>
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

              <div>
                <label className="block text-slate-400 font-bold mb-1">Phân Loại</label>
                <select
                  name="type"
                  defaultValue={editingPartner.type === 'PARTNER' ? 'STRATEGIC_PARTNER' : editingPartner.type}
                  className="w-full p-3 rounded-xl bg-[#060913] border border-white/10 text-white"
                >
                  <option value="CUSTOMER">Khách Hàng (Customer)</option>
                  <option value="STRATEGIC_PARTNER">Đối Tác Chiến Lược (Partner)</option>
                </select>
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
