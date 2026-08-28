'use client';

import { useState } from 'react';
import {
  createServiceAction,
  updateServiceAction,
  deleteServiceAction,
  toggleServiceActiveAction,
} from '@/app/actions/services';
import {
  Plus,
  Trash2,
  Edit2,
  X,
  Loader2,
  Search,
  CheckCircle2,
  TrendingUp,
  Trophy,
  Eye,
  EyeOff,
  Sparkles,
  ListPlus,
  Link as LinkIcon,
} from 'lucide-react';
import { ServiceItem } from '@/lib/fallbackData';

// Hàm tự động tạo slug chuẩn SEO từ Tiêu đề
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

// Hàm chuẩn hóa nhóm dịch vụ (Tránh lỗi phân biệt chữ hoa/thường hoặc tên lạ)
function getCategoryGroup(category?: string): 'DIGITAL' | 'SPORTS' {
  if (!category) return 'DIGITAL';
  const cat = category.toString().toUpperCase().trim();
  if (
    cat.includes('SPORT') ||
    cat.includes('THE_THAO') ||
    cat.includes('TRAIN') ||
    cat.includes('HUB')
  ) {
    return 'SPORTS';
  }
  return 'DIGITAL';
}

export default function ServicesClient({
  initialServices,
}: {
  initialServices: ServiceItem[];
}) {
  const [services, setServices] = useState<ServiceItem[]>(initialServices);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'DIGITAL' | 'SPORTS'>('ALL');

  // Modal states
  const [isCreating, setIsCreating] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [formBulletPoints, setFormBulletPoints] = useState<string[]>(['']);

  // Đếm chính xác số lượng cho từng Tab
  const totalCount = services.length;
  const digitalCount = services.filter(
    (s) => getCategoryGroup(s.category) === 'DIGITAL'
  ).length;
  const sportsCount = services.filter(
    (s) => getCategoryGroup(s.category) === 'SPORTS'
  ).length;

  // Lọc danh sách theo Từ khóa và Tab
  const filteredServices = services.filter((s) => {
    const titleMatch = (s.title || '').toLowerCase().includes(searchTerm.toLowerCase());
    const subTitleMatch = (s.sub_title || s.subtitle || s.badge || '')
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const descMatch = (s.short_description || s.desc || '')
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const slugMatch = (s.slug || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchSearch = titleMatch || subTitleMatch || descMatch || slugMatch;

    const itemGroup = getCategoryGroup(s.category);
    const matchCategory = categoryFilter === 'ALL' || itemGroup === categoryFilter;
    return matchSearch && matchCategory;
  });

  function openCreateModal() {
    setFormTitle('');
    setFormSlug('');
    setIsSlugManuallyEdited(false);
    setFormBulletPoints(['', '']);
    setIsCreating(true);
  }

  function openEditModal(service: ServiceItem) {
    setEditingService(service);
    setFormTitle(service.title);
    setFormSlug(service.slug || generateSlug(service.title));
    setIsSlugManuallyEdited(true);
    const existingPoints =
      service.bullet_points || service.features || service.points || [];
    setFormBulletPoints(existingPoints.length > 0 ? [...existingPoints] : ['']);
  }

  function handleTitleChange(value: string) {
    setFormTitle(value);
    if (!isSlugManuallyEdited) {
      setFormSlug(generateSlug(value));
    }
  }

  function handleAddBulletPoint() {
    setFormBulletPoints((prev) => [...prev, '']);
  }

  function handleBulletPointChange(index: number, value: string) {
    setFormBulletPoints((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  function handleRemoveBulletPoint(index: number) {
    setFormBulletPoints((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next.length > 0 ? next : [''];
    });
  }

  async function handleToggleActive(s: ServiceItem) {
    if (!s.id) return;
    const currentActive = s.is_active !== false;
    const nextActive = !currentActive;

    setTogglingId(s.id);
    setServices((prev) =>
      prev.map((item) => (item.id === s.id ? { ...item, is_active: nextActive } : item))
    );

    const res = await toggleServiceActiveAction(s.id, nextActive);
    if (!res.success) {
      setServices((prev) =>
        prev.map((item) => (item.id === s.id ? { ...item, is_active: currentActive } : item))
      );
      alert(res.error || 'Cập nhật trạng thái thất bại');
    }
    setTogglingId(null);
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    const form = e.currentTarget;
    const formData = new FormData(form);

    const cleanBulletPoints = formBulletPoints.map((p) => p.trim()).filter(Boolean);
    formData.set('bullet_points', JSON.stringify(cleanBulletPoints));
    formData.set('slug', formSlug || generateSlug(formTitle));

    const res = await createServiceAction(formData);
    if (res.success) {
      const is_active_val = formData.get('is_active');
      const is_active =
        is_active_val === 'on' || is_active_val === 'true' || is_active_val === null;

      const newService: ServiceItem = {
        id: 'new-' + Date.now(),
        title: formTitle.trim(),
        slug: formSlug.trim() || generateSlug(formTitle),
        sub_title: (formData.get('sub_title') as string) || '',
        short_description: (formData.get('short_description') as string) || '',
        category: ((formData.get('category') as string) || 'DIGITAL') as
          | 'DIGITAL'
          | 'SPORTS',
        display_order: parseInt((formData.get('display_order') as string) || '0', 10),
        bullet_points: cleanBulletPoints,
        features: cleanBulletPoints,
        points: cleanBulletPoints,
        icon_name: (formData.get('icon_name') as string) || 'TrendingUp',
        is_active,
      };

      setServices((prev) => [...prev, newService]);
      setIsCreating(false);
    } else {
      alert(res.error || 'Tạo dịch vụ thất bại');
    }
    setIsSubmitting(false);
  }

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editingService || !editingService.id) return;
    setIsSubmitting(true);
    const form = e.currentTarget;
    const formData = new FormData(form);

    const cleanBulletPoints = formBulletPoints.map((p) => p.trim()).filter(Boolean);
    formData.set('bullet_points', JSON.stringify(cleanBulletPoints));
    formData.set('slug', formSlug || generateSlug(formTitle));

    const res = await updateServiceAction(editingService.id, formData);
    if (res.success) {
      const is_active =
        formData.get('is_active') === 'on' || formData.get('is_active') === 'true';

      setServices((prev) =>
        prev.map((s) =>
          s.id === editingService.id
            ? {
                ...s,
                title: formTitle.trim(),
                slug: formSlug.trim() || generateSlug(formTitle),
                sub_title: (formData.get('sub_title') as string) || s.sub_title,
                short_description:
                  (formData.get('short_description') as string) || s.short_description,
                category: ((formData.get('category') as string) || s.category) as
                  | 'DIGITAL'
                  | 'SPORTS',
                display_order: parseInt(
                  (formData.get('display_order') as string) || '0',
                  10
                ),
                bullet_points: cleanBulletPoints,
                features: cleanBulletPoints,
                points: cleanBulletPoints,
                icon_name: (formData.get('icon_name') as string) || s.icon_name,
                is_active,
              }
            : s
        )
      );
      setEditingService(null);
    } else {
      alert(res.error || 'Cập nhật dịch vụ thất bại');
    }
    setIsSubmitting(false);
  }

  async function handleDelete(id?: string) {
    if (!id) return;
    if (!confirm('Bạn có chắc chắn muốn xóa dịch vụ này khỏi hệ thống?')) return;

    const res = await deleteServiceAction(id);
    if (res.success) {
      setServices((prev) => prev.filter((s) => s.id !== id));
    } else {
      alert(res.error || 'Xóa dịch vụ thất bại');
    }
  }

  return (
    <div className="space-y-6">
      {/* FILTER & ACTION BAR */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        <div className="flex flex-wrap flex-1 gap-3 items-center">
          {/* SEARCH */}
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo tên, slug, mô tả, sub-title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-[#0B0F19] border border-white/10 text-white text-xs focus:outline-none focus:border-[#FF5722] placeholder:text-slate-500"
            />
          </div>

          {/* 3 CATEGORY TABS VỚI SỐ ĐẾM CHUẨN XÁC */}
          <div className="flex p-1 rounded-xl bg-[#0B0F19] border border-white/10 text-xs">
            <button
              onClick={() => setCategoryFilter('ALL')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                categoryFilter === 'ALL'
                  ? 'bg-white/15 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Tất cả ({totalCount})
            </button>
            <button
              onClick={() => setCategoryFilter('DIGITAL')}
              className={`px-3.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                categoryFilter === 'DIGITAL'
                  ? 'bg-[#FF5722] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Marketing Số ({digitalCount})</span>
            </button>
            <button
              onClick={() => setCategoryFilter('SPORTS')}
              className={`px-3.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                categoryFilter === 'SPORTS'
                  ? 'bg-[#00E5FF] text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Thể Thao & Đào Tạo ({sportsCount})</span>
            </button>
          </div>
        </div>

        {/* ADD BUTTON */}
        <button
          onClick={openCreateModal}
          className="px-5 py-2.5 rounded-xl bg-[#FF5722] hover:bg-orange-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#FF5722]/30 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Dịch Vụ Mới</span>
        </button>
      </div>

      {/* SERVICES TABLE */}
      <div className="rounded-2xl bg-[#0B0F19] border border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.02] border-b border-white/5 text-slate-400 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-4 px-6 font-semibold">Tên Dịch Vụ & Slug</th>
                <th className="py-4 px-6 font-semibold">Nhóm Dịch Vụ</th>
                <th className="py-4 px-6 font-semibold">Mô Tả Ngắn & Bullet Points</th>
                <th className="py-4 px-4 font-semibold text-center">Thứ Tự</th>
                <th className="py-4 px-4 font-semibold text-center">Hiển Thị</th>
                <th className="py-4 px-6 font-semibold text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredServices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <p className="text-sm font-semibold">
                      Không tìm thấy dịch vụ nào phù hợp.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredServices.map((s, idx) => {
                  const isActive = s.is_active !== false;
                  const itemGroup = getCategoryGroup(s.category);
                  const isDigital = itemGroup === 'DIGITAL';
                  const bulletPoints =
                    s.bullet_points || s.features || s.points || [];

                  return (
                    <tr
                      key={s.id || idx}
                      className={`hover:bg-white/[0.02] transition-colors ${
                        !isActive ? 'opacity-55' : ''
                      }`}
                    >
                      {/* TITLE & SLUG */}
                      <td className="py-4 px-6">
                        <div className="space-y-1.5 max-w-xs">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-2 h-2 rounded-full shrink-0 ${
                                isDigital ? 'bg-[#FF5722]' : 'bg-[#00E5FF]'
                              }`}
                            />
                            <h4 className="font-bold text-white text-sm leading-snug">
                              {s.title}
                            </h4>
                          </div>
                          {(s.sub_title || s.subtitle || s.badge) && (
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                                isDigital
                                  ? 'bg-[#FF5722]/10 text-[#FF5722] border border-[#FF5722]/20'
                                  : 'bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20'
                              }`}
                            >
                              {s.sub_title || s.subtitle || s.badge}
                            </span>
                          )}
                          {s.slug && (
                            <p className="text-[10px] text-slate-500 font-mono truncate flex items-center gap-1">
                              <LinkIcon className="w-2.5 h-2.5 shrink-0" />
                              <span>{s.slug}</span>
                            </p>
                          )}
                        </div>
                      </td>

                      {/* CATEGORY */}
                      <td className="py-4 px-6">
                        {isDigital ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-bold bg-[#FF5722]/10 text-[#FF5722] border border-[#FF5722]/20">
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span>Digital Suite</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-bold bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20">
                            <Trophy className="w-3.5 h-3.5" />
                            <span>Sports Hub</span>
                          </span>
                        )}
                      </td>

                      {/* DESCRIPTION & BULLET POINTS */}
                      <td className="py-4 px-6 max-w-md">
                        <p className="text-slate-300 line-clamp-2 leading-relaxed">
                          {s.short_description || s.desc || 'Chưa có mô tả ngắn'}
                        </p>
                        {bulletPoints.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {bulletPoints.slice(0, 2).map((point, pIdx) => (
                              <span
                                key={pIdx}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/5 text-[10px] text-slate-400 border border-white/5"
                              >
                                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                                <span className="truncate max-w-[180px]">{point}</span>
                              </span>
                            ))}
                            {bulletPoints.length > 2 && (
                              <span className="px-1.5 py-0.5 rounded bg-white/5 text-[10px] text-slate-500 font-mono">
                                +{bulletPoints.length - 2} điểm
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* DISPLAY ORDER */}
                      <td className="py-4 px-4 text-center">
                        <span className="font-mono text-slate-300 font-semibold bg-white/5 px-2.5 py-1 rounded-lg">
                          {s.display_order ?? idx + 1}
                        </span>
                      </td>

                      {/* IS_ACTIVE TOGGLE */}
                      <td className="py-4 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(s)}
                          disabled={togglingId === s.id}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold transition-all cursor-pointer ${
                            isActive
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25'
                              : 'bg-slate-700/30 text-slate-500 border border-slate-700/50 hover:bg-slate-700/50'
                          }`}
                          title="Click để Bật/Tắt hiển thị trên trang chủ"
                        >
                          {togglingId === s.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : isActive ? (
                            <>
                              <Eye className="w-3 h-3" />
                              <span>Hiển thị</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3" />
                              <span>Đang ẩn</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* ACTIONS */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(s)}
                            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                            title="Chỉnh sửa dịch vụ"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {s.id && (
                            <button
                              onClick={() => handleDelete(s.id)}
                              className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer"
                              title="Xóa dịch vụ"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE MODAL */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="max-w-2xl w-full p-6 md:p-8 rounded-3xl bg-[#0B0F19] border border-white/15 space-y-6 text-xs shadow-2xl relative my-8">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#FF5722]/10 border border-[#FF5722]/20 flex items-center justify-center text-[#FF5722]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-white">Thêm Dịch Vụ Mới</h3>
              </div>
              <button
                onClick={() => setIsCreating(false)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-slate-400 font-bold mb-1.5">
                  Tiêu Đề Dịch Vụ <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formTitle}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="VD: Quảng Cáo Google & Facebook Tối Ưu ROI"
                  className="w-full p-3 rounded-xl bg-[#060913] border border-white/10 text-white focus:outline-none focus:border-[#FF5722]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold mb-1.5">
                    Đường Dẫn Slug (Tự động sinh)
                  </label>
                  <input
                    type="text"
                    name="slug"
                    value={formSlug}
                    onChange={(e) => {
                      setFormSlug(e.target.value);
                      setIsSlugManuallyEdited(true);
                    }}
                    placeholder="quang-cao-google-facebook-roi"
                    className="w-full p-3 rounded-xl bg-[#060913] border border-white/10 text-white font-mono text-[11px] focus:outline-none focus:border-[#FF5722]"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1.5">
                    Nhóm Dịch Vụ
                  </label>
                  <select
                    name="category"
                    defaultValue="DIGITAL"
                    className="w-full p-3 rounded-xl bg-[#060913] border border-white/10 text-white focus:outline-none focus:border-[#FF5722] cursor-pointer"
                  >
                    <option value="DIGITAL">Marketing Số (Digital Suite)</option>
                    <option value="SPORTS">Thể Thao & Đào Tạo (Sports Hub)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold mb-1.5">
                    Phụ Đề / Badge (Sub Title)
                  </label>
                  <input
                    type="text"
                    name="sub_title"
                    placeholder="VD: Search, Display, YouTube & Meta Ads"
                    className="w-full p-3 rounded-xl bg-[#060913] border border-white/10 text-white focus:outline-none focus:border-[#FF5722]"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1.5">
                    Thứ Tự Hiển Thị
                  </label>
                  <input
                    type="number"
                    name="display_order"
                    defaultValue={services.length + 1}
                    className="w-full p-3 rounded-xl bg-[#060913] border border-white/10 text-white focus:outline-none focus:border-[#FF5722]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1.5">
                  Mô Tả Ngắn (Short Description)
                </label>
                <textarea
                  name="short_description"
                  rows={2}
                  placeholder="Mô tả tóm tắt giải pháp mang lại cho khách hàng..."
                  className="w-full p-3 rounded-xl bg-[#060913] border border-white/10 text-white focus:outline-none focus:border-[#FF5722]"
                />
              </div>

              {/* DYNAMIC BULLET POINTS LIST */}
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-slate-400 font-bold flex items-center gap-1.5">
                    <ListPlus className="w-4 h-4 text-[#FF5722]" />
                    <span>Danh Sách Bullet Points / Tính Năng Nổi Bật</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAddBulletPoint}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Thêm Điểm</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {formBulletPoints.map((point, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="w-5 text-center text-slate-500 font-mono text-[11px]">
                        {index + 1}.
                      </span>
                      <input
                        type="text"
                        value={point}
                        onChange={(e) => handleBulletPointChange(index, e.target.value)}
                        placeholder={`Tính năng / Điểm nổi bật #${index + 1}...`}
                        className="flex-1 p-2.5 rounded-xl bg-[#060913] border border-white/10 text-white text-xs focus:outline-none focus:border-[#FF5722]"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveBulletPoint(index)}
                        className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 cursor-pointer transition-colors"
                        title="Xóa dòng này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-white/10">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_active"
                    defaultChecked
                    className="sr-only peer"
                  />
                  <div className="w-10 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  <span className="ml-3 text-xs font-bold text-slate-300">
                    Bật hiển thị ngay trên Public Site
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 rounded-xl bg-[#FF5722] hover:bg-orange-600 text-white font-bold transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Lưu Dịch Vụ Mới</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="max-w-2xl w-full p-6 md:p-8 rounded-3xl bg-[#0B0F19] border border-white/15 space-y-6 text-xs shadow-2xl relative my-8">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/20 flex items-center justify-center text-[#00E5FF]">
                  <Edit2 className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-white">Chỉnh Sửa Dịch Vụ</h3>
              </div>
              <button
                onClick={() => setEditingService(null)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-slate-400 font-bold mb-1.5">
                  Tiêu Đề Dịch Vụ <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formTitle}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full p-3 rounded-xl bg-[#060913] border border-white/10 text-white focus:outline-none focus:border-[#00E5FF]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold mb-1.5">
                    Đường Dẫn Slug
                  </label>
                  <input
                    type="text"
                    name="slug"
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                    className="w-full p-3 rounded-xl bg-[#060913] border border-white/10 text-white font-mono text-[11px] focus:outline-none focus:border-[#00E5FF]"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1.5">
                    Nhóm Dịch Vụ
                  </label>
                  <select
                    name="category"
                    defaultValue={getCategoryGroup(editingService.category)}
                    className="w-full p-3 rounded-xl bg-[#060913] border border-white/10 text-white focus:outline-none focus:border-[#00E5FF] cursor-pointer"
                  >
                    <option value="DIGITAL">Marketing Số (Digital Suite)</option>
                    <option value="SPORTS">Thể Thao & Đào Tạo (Sports Hub)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold mb-1.5">
                    Phụ Đề / Badge (Sub Title)
                  </label>
                  <input
                    type="text"
                    name="sub_title"
                    defaultValue={
                      editingService.sub_title ||
                      editingService.subtitle ||
                      editingService.badge ||
                      ''
                    }
                    placeholder="VD: Search, Display, YouTube & Meta Ads"
                    className="w-full p-3 rounded-xl bg-[#060913] border border-white/10 text-white focus:outline-none focus:border-[#00E5FF]"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1.5">
                    Thứ Tự Hiển Thị
                  </label>
                  <input
                    type="number"
                    name="display_order"
                    defaultValue={editingService.display_order || 1}
                    className="w-full p-3 rounded-xl bg-[#060913] border border-white/10 text-white focus:outline-none focus:border-[#00E5FF]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1.5">
                  Mô Tả Ngắn (Short Description)
                </label>
                <textarea
                  name="short_description"
                  rows={2}
                  defaultValue={
                    editingService.short_description || editingService.desc || ''
                  }
                  className="w-full p-3 rounded-xl bg-[#060913] border border-white/10 text-white focus:outline-none focus:border-[#00E5FF]"
                />
              </div>

              {/* DYNAMIC BULLET POINTS LIST */}
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-slate-400 font-bold flex items-center gap-1.5">
                    <ListPlus className="w-4 h-4 text-[#00E5FF]" />
                    <span>Danh Sách Bullet Points / Tính Năng Nổi Bật</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAddBulletPoint}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Thêm Điểm</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {formBulletPoints.map((point, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="w-5 text-center text-slate-500 font-mono text-[11px]">
                        {index + 1}.
                      </span>
                      <input
                        type="text"
                        value={point}
                        onChange={(e) => handleBulletPointChange(index, e.target.value)}
                        placeholder={`Tính năng / Điểm nổi bật #${index + 1}...`}
                        className="flex-1 p-2.5 rounded-xl bg-[#060913] border border-white/10 text-white text-xs focus:outline-none focus:border-[#00E5FF]"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveBulletPoint(index)}
                        className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 cursor-pointer transition-colors"
                        title="Xóa dòng này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-white/10">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_active"
                    defaultChecked={editingService.is_active !== false}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  <span className="ml-3 text-xs font-bold text-slate-300">
                    Bật hiển thị
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 rounded-xl bg-[#00E5FF] hover:bg-cyan-400 text-slate-950 font-bold transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Lưu Thay Đổi</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}