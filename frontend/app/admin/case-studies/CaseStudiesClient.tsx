'use client';

import { useState } from 'react';
import { createCaseStudyAction, updateCaseStudyAction, deleteCaseStudyAction } from '@/app/actions/admin-case-studies';
import { Plus, Trash2, Edit2, X, Loader2, Sparkles, Users, Newspaper, Eye } from 'lucide-react';
import { CaseStudyItem } from '@/lib/fallbackData';

export default function CaseStudiesClient({ initialStudies }: { initialStudies: CaseStudyItem[] }) {
  const [studies, setStudies] = useState<CaseStudyItem[]>(initialStudies);
  const [editingStudy, setEditingStudy] = useState<CaseStudyItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    const form = e.currentTarget;
    const formData = new FormData(form);

    const res = await createCaseStudyAction(formData);
    if (res.success) {
      const newStudy: CaseStudyItem = {
        id: 'new-' + Date.now(),
        title: (formData.get('title') as string) || '',
        client_name: (formData.get('client_name') as string) || '',
        challenge: (formData.get('challenge') as string) || '',
        solution: (formData.get('solution') as string) || '',
        results: {
          athletes: (formData.get('athletes') as string) || '5.2K VĐV',
          articles: (formData.get('articles') as string) || '50+ Bài Báo',
          views: (formData.get('views') as string) || '2M Lượt Xem',
        },
        is_featured: formData.get('is_featured') === 'on',
      };
      setStudies((prev) => [newStudy, ...prev]);
      setIsCreating(false);
    } else {
      alert(res.error || 'Tạo Case Study thất bại');
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
      setStudies((prev) =>
        prev.map((s) =>
          s.id === editingStudy.id
            ? {
                ...s,
                title: (formData.get('title') as string) || s.title,
                client_name: (formData.get('client_name') as string) || s.client_name,
                challenge: (formData.get('challenge') as string) || s.challenge,
                solution: (formData.get('solution') as string) || s.solution,
                results: {
                  athletes: (formData.get('athletes') as string) || s.results?.athletes,
                  articles: (formData.get('articles') as string) || s.results?.articles,
                  views: (formData.get('views') as string) || s.results?.views,
                },
                is_featured: formData.get('is_featured') === 'on',
              }
            : s
        )
      );
      setEditingStudy(null);
    } else {
      alert(res.error || 'Cập nhật thất bại');
    }
    setIsSubmitting(false);
  }

  async function handleDelete(id?: string) {
    if (!id) return;
    if (!confirm('Bạn có chắc muốn xóa Case Study này?')) return;
    const res = await deleteCaseStudyAction(id);
    if (res.success) {
      setStudies((prev) => prev.filter((s) => s.id !== id));
    } else {
      alert(res.error || 'Xóa Case Study thất bại');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-xs text-slate-400">Danh sách ({studies.length} Case Studies)</p>
        <button
          onClick={() => setIsCreating(true)}
          className="px-5 py-2.5 rounded-xl bg-[#FF5722] hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-[#FF5722]/30 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Case Study Mới</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {studies.map((s, idx) => (
          <div
            key={s.id || idx}
            className="p-8 rounded-3xl bg-[#0B0F19] border border-white/10 flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-[#FF5722] uppercase px-3 py-1 rounded-full bg-[#FF5722]/10 border border-[#FF5722]/20">
                  {s.client_name}
                </span>
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

              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/5 text-center">
                <div className="p-2.5 rounded-xl bg-white/[0.02]">
                  <div className="text-xs font-black text-[#FF5722]">{s.results?.athletes || '5.2K'}</div>
                  <div className="text-[10px] text-slate-500">Quy mô VĐV</div>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.02]">
                  <div className="text-xs font-black text-[#00E5FF]">{s.results?.articles || '50+'}</div>
                  <div className="text-[10px] text-slate-500">Bài Báo PR</div>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.02]">
                  <div className="text-xs font-black text-emerald-400">{s.results?.views || '2M'}</div>
                  <div className="text-[10px] text-slate-500">Lượt Xem MXH</div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/5">
              <button
                onClick={() => setEditingStudy(s)}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold flex items-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Sửa</span>
              </button>
              {s.id && (
                <button
                  onClick={() => handleDelete(s.id)}
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

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Vận Động Viên</label>
                  <input
                    type="text"
                    name="athletes"
                    placeholder="5.2K VĐV"
                    defaultValue="5.2K VĐV"
                    className="w-full p-2.5 rounded-xl bg-[#060913] border border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Báo Chí PR</label>
                  <input
                    type="text"
                    name="articles"
                    placeholder="50+ Bài Báo"
                    defaultValue="50+ Bài Báo"
                    className="w-full p-2.5 rounded-xl bg-[#060913] border border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Lượt Xem MXH</label>
                  <input
                    type="text"
                    name="views"
                    placeholder="2M Lượt Xem"
                    defaultValue="2M Lượt Xem"
                    className="w-full p-2.5 rounded-xl bg-[#060913] border border-white/10 text-white"
                  />
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
      {editingStudy && (
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

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Vận Động Viên</label>
                  <input
                    type="text"
                    name="athletes"
                    defaultValue={editingStudy.results?.athletes || '5.2K VĐV'}
                    className="w-full p-2.5 rounded-xl bg-[#060913] border border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Báo Chí PR</label>
                  <input
                    type="text"
                    name="articles"
                    defaultValue={editingStudy.results?.articles || '50+ Bài Báo'}
                    className="w-full p-2.5 rounded-xl bg-[#060913] border border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Lượt Xem MXH</label>
                  <input
                    type="text"
                    name="views"
                    defaultValue={editingStudy.results?.views || '2M Lượt Xem'}
                    className="w-full p-2.5 rounded-xl bg-[#060913] border border-white/10 text-white"
                  />
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
      )}
    </div>
  );
}
