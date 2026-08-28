'use client';

import { useState } from 'react';
import { createBlogAction, updateBlogAction, deleteBlogAction } from '@/app/actions/admin-blogs';
import { Plus, Trash2, Edit2, X, Loader2, Clock, BookOpen } from 'lucide-react';
import { BlogPostItem } from '@/lib/fallbackData';

export default function BlogsClient({ initialBlogs }: { initialBlogs: BlogPostItem[] }) {
  const [blogs, setBlogs] = useState<BlogPostItem[]>(initialBlogs);
  const [editingBlog, setEditingBlog] = useState<BlogPostItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    const form = e.currentTarget;
    const formData = new FormData(form);

    const res = await createBlogAction(formData);
    if (res.success) {
      const newBlog: BlogPostItem = {
        id: 'new-' + Date.now(),
        title: (formData.get('title') as string) || '',
        slug: (formData.get('slug') as string) || '',
        excerpt: (formData.get('excerpt') as string) || '',
        category: (formData.get('category') as string) || 'Marketing',
        author: (formData.get('author') as string) || 'S-Digital',
        published_at: new Date().toLocaleDateString('vi-VN'),
      };
      setBlogs((prev) => [newBlog, ...prev]);
      setIsCreating(false);
    } else {
      alert(res.error || 'Tạo bài viết thất bại');
    }
    setIsSubmitting(false);
  }

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editingBlog || !editingBlog.id) return;
    setIsSubmitting(true);
    const form = e.currentTarget;
    const formData = new FormData(form);

    const res = await updateBlogAction(editingBlog.id, formData);
    if (res.success) {
      setBlogs((prev) =>
        prev.map((b) =>
          b.id === editingBlog.id
            ? {
                ...b,
                title: (formData.get('title') as string) || b.title,
                excerpt: (formData.get('excerpt') as string) || b.excerpt,
                category: (formData.get('category') as string) || b.category,
              }
            : b
        )
      );
      setEditingBlog(null);
    } else {
      alert(res.error || 'Cập nhật thất bại');
    }
    setIsSubmitting(false);
  }

  async function handleDelete(id?: string) {
    if (!id) return;
    if (!confirm('Bạn có chắc muốn xóa bài viết này?')) return;
    const res = await deleteBlogAction(id);
    if (res.success) {
      setBlogs((prev) => prev.filter((b) => b.id !== id));
    } else {
      alert(res.error || 'Xóa bài viết thất bại');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-xs text-slate-400">Danh sách ({blogs.length} bài viết)</p>
        <button
          onClick={() => setIsCreating(true)}
          className="px-5 py-2.5 rounded-xl bg-[#FF5722] hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-[#FF5722]/30 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Viết Bài Mới</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {blogs.map((b, idx) => (
          <div
            key={b.id || idx}
            className="p-6 rounded-3xl bg-[#0B0F19] border border-white/10 flex flex-col justify-between space-y-6"
          >
            <div className="space-y-3">
              <span className="text-[10px] font-mono font-bold text-[#FF5722] uppercase px-2.5 py-1 rounded bg-[#FF5722]/10 border border-[#FF5722]/20">
                {b.category || 'Tin Tức'}
              </span>

              <h3 className="text-base font-black text-white line-clamp-2 pt-1">{b.title}</h3>

              <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">{b.excerpt}</p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/5 text-[11px] text-slate-500">
              <span>{b.published_at || 'Mới cập nhật'}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingBlog(b)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white"
                  title="Sửa"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                {b.id && (
                  <button
                    onClick={() => handleDelete(b.id)}
                    className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400"
                    title="Xóa"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE MODAL */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="max-w-lg w-full p-6 rounded-3xl bg-[#0B0F19] border border-white/15 space-y-4 text-xs shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-white">Thêm Bài Viết Mới</h3>
              <button onClick={() => setIsCreating(false)} className="p-1.5 rounded-lg bg-white/5 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Tiêu Đề Bài Viết *</label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="VD: Chiến Lược Marketing Đa Kênh Tối Ưu ROI 2026"
                  className="w-full p-3 rounded-xl bg-[#060913] border border-white/10 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Chuyên Mục</label>
                  <input
                    type="text"
                    name="category"
                    defaultValue="Digital Marketing"
                    placeholder="VD: Digital Marketing / Sports"
                    className="w-full p-2.5 rounded-xl bg-[#060913] border border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Tác Giả</label>
                  <input
                    type="text"
                    name="author"
                    defaultValue="S-Digital"
                    placeholder="VD: S-Digital Team"
                    className="w-full p-2.5 rounded-xl bg-[#060913] border border-white/10 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Tóm Tắt Ngắn (Excerpt) *</label>
                <textarea
                  name="excerpt"
                  rows={2}
                  required
                  placeholder="Mô tả nội dung bài viết..."
                  className="w-full p-3 rounded-xl bg-[#060913] border border-white/10 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Nội Dung Chi Tiết</label>
                <textarea
                  name="content"
                  rows={5}
                  placeholder="Nội dung bài viết chi tiết..."
                  className="w-full p-3 rounded-xl bg-[#060913] border border-white/10 text-white"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-[#FF5722] hover:bg-orange-600 text-white font-bold transition-all shadow-lg flex items-center justify-center gap-2 mt-4"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Đăng Bài Viết</span>}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingBlog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="max-w-lg w-full p-6 rounded-3xl bg-[#0B0F19] border border-white/15 space-y-4 text-xs shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-white">Chỉnh Sửa Bài Viết</h3>
              <button onClick={() => setEditingBlog(null)} className="p-1.5 rounded-lg bg-white/5 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-3">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Tiêu Đề Bài Viết *</label>
                <input
                  type="text"
                  name="title"
                  required
                  defaultValue={editingBlog.title}
                  className="w-full p-3 rounded-xl bg-[#060913] border border-white/10 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Chuyên Mục</label>
                <input
                  type="text"
                  name="category"
                  defaultValue={editingBlog.category || 'Digital Marketing'}
                  className="w-full p-2.5 rounded-xl bg-[#060913] border border-white/10 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Tóm Tắt Ngắn *</label>
                <textarea
                  name="excerpt"
                  rows={3}
                  required
                  defaultValue={editingBlog.excerpt}
                  className="w-full p-3 rounded-xl bg-[#060913] border border-white/10 text-white"
                />
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
