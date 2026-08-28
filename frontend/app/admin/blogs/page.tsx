import { createServerSupabaseClient } from '@/lib/supabase/server';
import BlogsClient from './BlogsClient';
import { FileText } from 'lucide-react';
import { FALLBACK_BLOGS } from '@/lib/fallbackData';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminBlogsPage() {
  const supabase = await createServerSupabaseClient();

  const { data: blogs } = await supabase
    .from('blogs')
    .select('*')
    .order('published_at', { ascending: false });

  const displayBlogs = blogs && blogs.length > 0 ? blogs : FALLBACK_BLOGS;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
          <FileText className="w-8 h-8 text-[#FF5722]" />
          <span>Quản Lý Bài Viết Blog & Tin Tức</span>
        </h1>
        <p className="text-xs md:text-sm text-slate-400 mt-1">
          Đăng tải và quản lý các bài viết kiến thức Marketing số và Tiếp thị thể thao.
        </p>
      </div>

      <BlogsClient initialBlogs={displayBlogs} />
    </div>
  );
}
