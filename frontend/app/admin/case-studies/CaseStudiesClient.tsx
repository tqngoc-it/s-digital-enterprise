'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  createCaseStudyAction,
  updateCaseStudyAction,
  deleteCaseStudyAction,
  reorderCaseStudiesAction,
} from '@/app/actions/admin-case-studies';
import {
  Plus,
  Trash2,
  Edit2,
  X,
  Loader2,
  Sparkles,
  Users,
  Newspaper,
  Eye,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  AlertCircle,
  GripVertical,
} from 'lucide-react';
import { CaseStudyItem } from '@/lib/fallbackData';
import { parseCaseStudyMetrics } from '@/lib/caseStudyMetrics';
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

function SortableCaseStudyCard({
  s,
  idx,
  totalLength,
  onEdit,
  onDelete,
  onMove,
}: {
  s: CaseStudyItem;
  idx: number;
  totalLength: number;
  onEdit: (study: CaseStudyItem) => void;
  onDelete: (id?: string) => void;
  onMove: (idx: number, dir: 'UP' | 'DOWN') => void;
}) {
  const sortableId = String(s.id || s.slug || `casestudy-${idx}-${s.title}`);
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

  const metrics = parseCaseStudyMetrics(s.results);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-8 rounded-3xl bg-[#0B0F19] border flex flex-col justify-between space-y-6 ${
        isDragging
          ? 'opacity-80 ring-2 ring-[#FF5722] shadow-2xl z-50 scale-[1.02] bg-[#0E1322]'
          : 'border-white/10 hover:border-white/20'
      }`}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
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
            <span className="text-[10px] font-mono font-bold text-[#FF5722] uppercase px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/20">
              #{idx + 1}
            </span>
            <span className="text-[10px] font-mono font-bold text-[#FF5722] uppercase px-3 py-1 rounded-full bg-[#FF5722]/10 border border-[#FF5722]/20">
              {s.client_name}
            </span>
          </div>
          {s.is_featured && (
            <span className="text-[10px] font-mono text-emerald-400 font-bold">★ Tiêu Biểu</span>
          )}
        </div>

        <h3 className="text-xl font-black text-white">{s.title}</h3>

        <div className="space-y-2 text-xs text-slate-300">
          <p>
            <strong className="text-white">Thách thức: </strong>
            {s.challenge}
          </p>
          <p>
            <strong className="text-white">Giải pháp: </strong>
            {s.solution}
          </p>
        </div>

        {/* CỤM 3 CHỈ SỐ LINH HOẠT TỪ RESULTS */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/5 text-center">
          <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="text-xs font-black text-[#FF5722] truncate">{metrics[0]?.value}</div>
            <div className="text-[10px] text-slate-500 truncate" title={metrics[0]?.label}>{metrics[0]?.label}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="text-xs font-black text-[#00E5FF] truncate">{metrics[1]?.value}</div>
            <div className="text-[10px] text-slate-500 truncate" title={metrics[1]?.label}>{metrics[1]?.label}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="text-xs font-black text-emerald-400 truncate">{metrics[2]?.value}</div>
            <div className="text-[10px] text-slate-500 truncate" title={metrics[2]?.label}>{metrics[2]?.label}</div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 pt-4 border-t border-white/5">
        {/* CỤM NÚT ĐIỀU HƯỚNG LÊN / XUỐNG */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={idx === 0}
            onClick={() => onMove(idx, 'UP')}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all border border-white/5 cursor-pointer"
            title="Di chuyển lên trước"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            disabled={idx === totalLength - 1}
            onClick={() => onMove(idx, 'DOWN')}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all border border-white/5 cursor-pointer"
            title="Di chuyển xuống sau"
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* SỬA / XÓA */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(s)}
            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Sửa</span>
          </button>
          {s.id && (
            <button
              onClick={() => onDelete(s.id)}
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

export default function CaseStudiesClient({ initialStudies }: { initialStudies: CaseStudyItem[] }) {
  const router = useRouter();
  const [studies, setStudies] = useState<CaseStudyItem[]>(initialStudies);
  const [mounted, setMounted] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [editingStudy, setEditingStudy] = useState<CaseStudyItem | null>(null);
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
    setStudies(initialStudies);
  }, [initialStudies]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = studies.findIndex(
      (s, idx) => String(s.id || s.slug || `casestudy-${idx}-${s.title}`) === String(active.id)
    );
    const newIndex = studies.findIndex(
      (s, idx) => String(s.id || s.slug || `casestudy-${idx}-${s.title}`) === String(over.id)
    );

    if (oldIndex === -1 || newIndex === -1) return;

    const originalStudies = [...studies];
    const updated = arrayMove(studies, oldIndex, newIndex);

    setStudies(updated);

    const orderedIds = updated.map((s) => String(s.id)).filter(Boolean);
    const res = await reorderCaseStudiesAction(orderedIds);
    if (res.success) {
      setToast({ message: 'Đã cập nhật thứ tự hiển thị thành công!', type: 'success' });
    } else {
      setStudies(originalStudies);
      setToast({ message: res.error || 'Cập nhật thứ tự thất bại, đã khôi phục lại vị trí cũ', type: 'error' });
    }
  }

  async function handleMove(index: number, direction: 'UP' | 'DOWN') {
    const targetIndex = direction === 'UP' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= studies.length) return;

    const originalStudies = [...studies];
    const updated = [...studies];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);

    // Optimistic UI update
    setStudies(updated);

    const orderedIds = updated.map((s) => String(s.id)).filter(Boolean);
    const res = await reorderCaseStudiesAction(orderedIds);
    if (res.success) {
      setToast({ message: 'Đã cập nhật thứ tự hiển thị thành công!', type: 'success' });
    } else {
      setStudies(originalStudies);
      setToast({ message: res.error || 'Cập nhật thứ tự thất bại, đã khôi phục lại vị trí cũ', type: 'error' });
    }
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    const form = e.currentTarget;
    const formData = new FormData(form);

    const res = await createCaseStudyAction(formData);
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
    if (!editingStudy || !editingStudy.id) return;
    setIsSubmitting(true);
    const form = e.currentTarget;
    const formData = new FormData(form);

    const res = await updateCaseStudyAction(editingStudy.id, formData);
    if (res.success) {
      router.refresh();
      setEditingStudy(null);
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

    const res = await deleteCaseStudyAction(id);
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

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <p className="text-xs text-slate-400">Danh sách ({studies.length} Case Studies)</p>
          <p className="text-[11px] text-slate-500">
            Kéo thả biểu tượng <strong>⋮⋮</strong> hoặc bấm nút <strong>[Lên] / [Xuống]</strong> để sắp xếp thứ tự hiển thị trực tiếp.
          </p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="px-5 py-2.5 rounded-xl bg-[#FF5722] hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-[#FF5722]/30 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Case Study Mới</span>
        </button>
      </div>

      {mounted ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={studies.map((s, idx) => String(s.id || s.slug || `casestudy-${idx}-${s.title}`))}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {studies.map((s, idx) => (
                <SortableCaseStudyCard
                  key={s.id || s.slug || `casestudy-${idx}-${s.title}`}
                  s={s}
                  idx={idx}
                  totalLength={studies.length}
                  onEdit={setEditingStudy}
                  onDelete={handleDelete}
                  onMove={handleMove}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {studies.map((s, idx) => (
            <SortableCaseStudyCard
              key={s.id || s.slug || `casestudy-${idx}-${s.title}`}
              s={s}
              idx={idx}
              totalLength={studies.length}
              onEdit={setEditingStudy}
              onDelete={handleDelete}
              onMove={handleMove}
            />
          ))}
        </div>
      )}

      {/* CREATE MODAL */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="max-w-lg w-full p-6 rounded-3xl bg-[#0B0F19] border border-white/15 space-y-4 text-xs shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-white">Thêm Case Study Mới</h3>
              <button onClick={() => setIsCreating(false)} className="p-1.5 rounded-lg bg-white/5 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Tên Dự Án *</label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="VD: Giải Marathon Quốc Tế Thành Phố"
                  className="w-full p-3 rounded-xl bg-[#060913] border border-white/10 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Khách Hàng / Đối Tác *</label>
                <input
                  type="text"
                  name="client_name"
                  required
                  placeholder="VD: Ủy Ban TDTT & Doanh Nghiệp"
                  className="w-full p-3 rounded-xl bg-[#060913] border border-white/10 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Thách Thức (Challenge)</label>
                <textarea
                  name="challenge"
                  rows={2}
                  placeholder="Tổ chức giải marathon 5.000 người, an toàn, chuẩn thời gian..."
                  className="w-full p-3 rounded-xl bg-[#060913] border border-white/10 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Giải Pháp (Solution)</label>
                <textarea
                  name="solution"
                  rows={3}
                  placeholder="Kế hoạch 6 tháng, 100+ trọng tài quốc tế, chip timing AIMS..."
                  className="w-full p-3 rounded-xl bg-[#060913] border border-white/10 text-white"
                />
              </div>

              {/* 3 CỤM CHỈ SỐ LINH HOẠT (LABEL & VALUE) */}
              <div className="space-y-3 pt-1">
                <p className="font-bold text-slate-300 text-xs flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#FF5722]" />
                  <span>3 Chỉ Số Kết Quả Nổi Bật (Linh hoạt Nhãn & Giá trị):</span>
                </p>

                {/* CHỈ SỐ 1 */}
                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                  <span className="text-[10px] font-mono text-[#FF5722] font-bold uppercase">Chỉ số 1</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Tên nhãn (Label)</label>
                      <input
                        type="text"
                        name="metric_1_label"
                        placeholder="VD: Quy mô, Thành viên, Doanh số"
                        defaultValue="Quy mô"
                        className="w-full p-2.5 rounded-xl bg-[#060913] border border-white/10 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Giá trị đạt được (Value)</label>
                      <input
                        type="text"
                        name="metric_1_value"
                        placeholder="VD: 5.2K+, 120K, 4.2K"
                        defaultValue="5.2K+"
                        className="w-full p-2.5 rounded-xl bg-[#060913] border border-white/10 text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* CHỈ SỐ 2 */}
                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                  <span className="text-[10px] font-mono text-[#00E5FF] font-bold uppercase">Chỉ số 2</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Tên nhãn (Label)</label>
                      <input
                        type="text"
                        name="metric_2_label"
                        placeholder="VD: Báo chí PR, Độ phủ, Tăng trưởng"
                        defaultValue="Báo chí PR"
                        className="w-full p-2.5 rounded-xl bg-[#060913] border border-white/10 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Giá trị đạt được (Value)</label>
                      <input
                        type="text"
                        name="metric_2_value"
                        placeholder="VD: 50+ Bài, +150%"
                        defaultValue="50+ Bài"
                        className="w-full p-2.5 rounded-xl bg-[#060913] border border-white/10 text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* CHỈ SỐ 3 */}
                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                  <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">Chỉ số 3</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Tên nhãn (Label)</label>
                      <input
                        type="text"
                        name="metric_3_label"
                        placeholder="VD: Lượt xem MXH, Doanh thu, Traffic"
                        defaultValue="Lượt xem MXH"
                        className="w-full p-2.5 rounded-xl bg-[#060913] border border-white/10 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Giá trị đạt được (Value)</label>
                      <input
                        type="text"
                        name="metric_3_value"
                        placeholder="VD: 2M Lượt xem, 5 Tỷ"
                        defaultValue="2M Lượt"
                        className="w-full p-2.5 rounded-xl bg-[#060913] border border-white/10 text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" name="is_featured" id="is_featured" defaultChecked className="rounded" />
                <label htmlFor="is_featured" className="text-white font-bold">
                  Đánh dấu là Case Study nổi bật trang chủ
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-[#FF5722] hover:bg-orange-600 text-white font-bold transition-all shadow-lg flex items-center justify-center gap-2 mt-4"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Lưu Case Study Mới</span>}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingStudy && (() => {
        const editMetrics = parseCaseStudyMetrics(editingStudy.results);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="max-w-lg w-full p-6 rounded-3xl bg-[#0B0F19] border border-white/15 space-y-4 text-xs shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-white">Chỉnh Sửa Case Study</h3>
                <button onClick={() => setEditingStudy(null)} className="p-1.5 rounded-lg bg-white/5 text-slate-400">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleUpdate} className="space-y-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Tên Dự Án *</label>
                  <input
                    type="text"
                    name="title"
                    required
                    defaultValue={editingStudy.title}
                    className="w-full p-3 rounded-xl bg-[#060913] border border-white/10 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Khách Hàng / Đối Tác *</label>
                  <input
                    type="text"
                    name="client_name"
                    required
                    defaultValue={editingStudy.client_name}
                    className="w-full p-3 rounded-xl bg-[#060913] border border-white/10 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Thách Thức</label>
                  <textarea
                    name="challenge"
                    rows={2}
                    defaultValue={editingStudy.challenge}
                    className="w-full p-3 rounded-xl bg-[#060913] border border-white/10 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Giải Pháp</label>
                  <textarea
                    name="solution"
                    rows={3}
                    defaultValue={editingStudy.solution}
                    className="w-full p-3 rounded-xl bg-[#060913] border border-white/10 text-white"
                  />
                </div>

                {/* 3 CỤM CHỈ SỐ LINH HOẠT EDIT */}
                <div className="space-y-3 pt-1">
                  <p className="font-bold text-slate-300 text-xs flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#FF5722]" />
                    <span>3 Chỉ Số Kết Quả Nổi Bật (Linh hoạt Nhãn & Giá trị):</span>
                  </p>

                  {/* CHỈ SỐ 1 */}
                  <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                    <span className="text-[10px] font-mono text-[#FF5722] font-bold uppercase">Chỉ số 1</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Tên nhãn (Label)</label>
                        <input
                          type="text"
                          name="metric_1_label"
                          defaultValue={editMetrics[0]?.label || 'Quy mô'}
                          className="w-full p-2.5 rounded-xl bg-[#060913] border border-white/10 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Giá trị đạt được (Value)</label>
                        <input
                          type="text"
                          name="metric_1_value"
                          defaultValue={editMetrics[0]?.value || '5.2K+'}
                          className="w-full p-2.5 rounded-xl bg-[#060913] border border-white/10 text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* CHỈ SỐ 2 */}
                  <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                    <span className="text-[10px] font-mono text-[#00E5FF] font-bold uppercase">Chỉ số 2</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Tên nhãn (Label)</label>
                        <input
                          type="text"
                          name="metric_2_label"
                          defaultValue={editMetrics[1]?.label || 'Báo chí PR'}
                          className="w-full p-2.5 rounded-xl bg-[#060913] border border-white/10 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Giá trị đạt được (Value)</label>
                        <input
                          type="text"
                          name="metric_2_value"
                          defaultValue={editMetrics[1]?.value || '50+ Bài'}
                          className="w-full p-2.5 rounded-xl bg-[#060913] border border-white/10 text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* CHỈ SỐ 3 */}
                  <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                    <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">Chỉ số 3</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Tên nhãn (Label)</label>
                        <input
                          type="text"
                          name="metric_3_label"
                          defaultValue={editMetrics[2]?.label || 'Lượt xem MXH'}
                          className="w-full p-2.5 rounded-xl bg-[#060913] border border-white/10 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Giá trị đạt được (Value)</label>
                        <input
                          type="text"
                          name="metric_3_value"
                          defaultValue={editMetrics[2]?.value || '2M Lượt'}
                          className="w-full p-2.5 rounded-xl bg-[#060913] border border-white/10 text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  name="is_featured"
                  id="edit_is_featured"
                  defaultChecked={editingStudy.is_featured}
                  className="rounded"
                />
                <label htmlFor="edit_is_featured" className="text-white font-bold">
                  Đánh dấu là Case Study nổi bật
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-[#FF5722] hover:bg-orange-600 text-white font-bold transition-all shadow-lg flex items-center justify-center gap-2 mt-4"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Lưu Thay Đổi</span>}
              </button>
              </form>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
