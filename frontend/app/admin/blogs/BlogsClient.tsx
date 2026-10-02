'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBlogAction, updateBlogAction, deleteBlogAction } from '@/app/actions/admin-blogs';
import { Plus, Trash2, Edit2, X, Loader2, Clock, ExternalLink } from 'lucide-react';
import { BlogPostItem } from '@/lib/fallbackData';

export default function BlogsClient({ initialBlogs }: { initialBlogs: BlogPostItem[] }) {
  const router = useRouter();
  const [blogs, setBlogs] = useState<BlogPostItem[]>(initialBlogs);
  const [editingBlog, setEditingBlog] = useState<BlogPostItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setBlogs(initialBlogs);
  }, [initialBlogs]);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    const form = e.currentTarget;
    const formData = new FormData(form);

    const res = await createBlogAction(formData);
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
    if (!editingBlog || !editingBlog.id) return;
    setIsSubmitting(true);
    const form = e.currentTarget;
    const formData = new FormData(form);

    const res = await updateBlogAction(editingBlog.id, formData);
    if (res.success) {
      // Optimistic update
      const updatedTitle = (formData.get('title') as string)?.trim() || editingBlog.title;
      const updatedCategory = (formData.get('category') as string)?.trim() || editingBlog.category;
      const updatedAuthor = (formData.get('author') as string)?.trim() || editingBlog.author;
      const updatedReadTime = (formData.get('read_time') as string)?.trim() || editingBlog.read_time;
      const updatedExternalUrl = (formData.get('external_url') as string)?.trim() || undefined;
      const updatedExcerpt = (formData.get('excerpt') as string)?.trim() || editingBlog.excerpt;
      const updatedContent = (formData.get('content') as string)?.trim() || editingBlog.content;

      setBlogs((prev) =>
        prev.map((item) =>
          item.id === editingBlog.id
            ? {
                ...item,
                title: updatedTitle,
                category: updatedCategory,
                author: updatedAuthor,
                read_time: updatedReadTime,
                external_url: updatedExternalUrl,
                excerpt: updatedExcerpt,
                content: updatedContent,
              }
            : item
        )
      );

      router.refresh();
      setEditingBlog(null);
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
    if (!confirm('Bạn có chắc muốn xóa bài viết này?')) return;

    const res = await deleteBlogAction(id);
    if (res.success) {
      setBlogs((prev) => prev.filter((item) => item.id !== id));
      router.refresh();
    } else {
      alert(res.error || 'Xóa thất bại');
    }
  }

  return (
    <div className="space-y-6">
      {/* HEADER BAR */}
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

      {/* BLOG CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {blogs.map((b, idx) => (
          <div
            key={b.id || b.slug || `blog-${idx}-${b.title}`}
            className="p-6 rounded-3xl bg-[#0B0F19] border border-white/10 flex flex-col justify-between space-y-6 hover:border-white/20 transition-all shadow-xl"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-[#FF5722] uppercase px-2.5 py-1 rounded bg-[#FF5722]/10 border border-[#FF5722]/20">
                  {b.category || 'Tin Tức'}
                </span>
                <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-500" />
                  {b.read_time || '4 phút đọc'}
                </span>
              </div>

              <h3 className="text-base font-black text-white line-clamp-2 pt-1">{b.title}</h3>

              <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">{b.excerpt}</p>

              {b.external_url && (
                <div
                  className="text-[11px] text-[#00E5FF] flex items-center gap-1 font-mono truncate"
                  title={b.external_url}
                >
                  <ExternalLink className="w-3 h-3 shrink-0" />
                  <span className="truncate">Nguồn: {b.external_url}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/5 text-[11px] text-slate-500">
              <span className="truncate max-w-[140px] font-medium text-slate-400">
                {b.author || 'S-Digital Strategy Team'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingBlog(b)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="Sửa"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                {b.id && (
                  <button
                    onClick={() => handleDelete(b.id)}
                    className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="max-w-lg w-full p-6 rounded-3xl bg-[#0B0F19] border border-white/15 space-y-4 text-xs shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-white">Thêm Bài Viết Mới</h3>
              <button
                onClick={() => setIsCreating(false)}
                className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white cursor-pointer"
              >
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
                  className="w-full p-3 rounded-xl bg-[#060913] border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-[#FF5722]"
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
                    className="w-full p-2.5 rounded-xl bg-[#060913] border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-[#FF5722]"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Tác Giả</label>
                  <input
                    type="text"
                    name="author"
                    defaultValue="S-Digital Strategy Team"
                    placeholder="VD: S-Digital Strategy Team"
                    className="w-full p-2.5 rounded-xl bg-[#060913] border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-[#FF5722]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Thời Gian Đọc</label>
                  <input
                    type="text"
                    name="read_time"
                    defaultValue="4 phút đọc"
                    placeholder="VD: 4 phút đọc"
                    className="w-full p-2.5 rounded-xl bg-[#060913] border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-[#FF5722]"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Link nguồn ngoài (Tùy chọn)</label>
                  <input
                    type="url"
                    name="external_url"
                    placeholder="https://vnexpress.net/... hoặc để trống để đọc nội bộ"
                    className="w-full p-2.5 rounded-xl bg-[#060913] border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-[#FF5722]"
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
                  className="w-full p-3 rounded-xl bg-[#060913] border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-[#FF5722]"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Nội Dung Chi Tiết (Markdown / Văn bản)</label>
                <textarea
                  name="content"
                  rows={5}
                  placeholder="Nội dung bài viết chi tiết..."
                  className="w-full p-3 rounded-xl bg-[#060913] border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-[#FF5722]"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-[#FF5722] hover:bg-orange-600 text-white font-bold transition-all shadow-lg flex items-center justify-center gap-2 mt-4 cursor-pointer"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Đăng Bài Viết</span>}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingBlog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            key={editingBlog.id || editingBlog.slug || 'edit-modal'}
            className="max-w-lg w-full p-6 rounded-3xl bg-[#0B0F19] border border-white/15 space-y-4 text-xs shadow-2xl relative max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-white">Chỉnh Sửa Bài Viết</h3>
              <button
                onClick={() => setEditingBlog(null)}
                className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white cursor-pointer"
              >
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
                  className="w-full p-3 rounded-xl bg-[#060913] border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-[#FF5722]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Chuyên Mục</label>
                  <input
                    type="text"
                    name="category"
                    defaultValue={editingBlog.category || 'Digital Marketing'}
                    className="w-full p-2.5 rounded-xl bg-[#060913] border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-[#FF5722]"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Tác Giả</label>
                  <input
                    type="text"
                    name="author"
                    defaultValue={editingBlog.author || 'S-Digital Strategy Team'}
                    className="w-full p-2.5 rounded-xl bg-[#060913] border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-[#FF5722]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Thời Gian Đọc</label>
                  <input
                    type="text"
                    name="read_time"
                    defaultValue={editingBlog.read_time || '4 phút đọc'}
                    placeholder="VD: 4 phút đọc"
                    className="w-full p-2.5 rounded-xl bg-[#060913] border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-[#FF5722]"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Link nguồn ngoài (Tùy chọn)</label>
                  <input
                    type="url"
                    name="external_url"
                    defaultValue={editingBlog.external_url || ''}
                    placeholder="https://vnexpress.net/... hoặc để trống để đọc nội bộ"
                    className="w-full p-2.5 rounded-xl bg-[#060913] border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-[#FF5722]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Tóm Tắt Ngắn (Excerpt) *</label>
                <textarea
                  name="excerpt"
                  rows={2}
                  required
                  defaultValue={editingBlog.excerpt}
                  className="w-full p-3 rounded-xl bg-[#060913] border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-[#FF5722]"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Nội Dung Chi Tiết (Markdown / Văn bản)</label>
                <textarea
                  name="content"
                  rows={5}
                  defaultValue={editingBlog.content || ''}
                  placeholder="Nội dung bài viết chi tiết..."
                  className="w-full p-3 rounded-xl bg-[#060913] border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-[#FF5722]"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-[#FF5722] hover:bg-orange-600 text-white font-bold transition-all shadow-lg flex items-center justify-center gap-2 mt-4 cursor-pointer"
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
