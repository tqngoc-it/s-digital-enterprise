import { Calendar, Clock, ArrowRight, BookOpen, Sparkles } from 'lucide-react';
import { FALLBACK_BLOGS, BlogPostItem } from '@/lib/fallbackData';

interface BlogSectionProps {
  blogs?: BlogPostItem[];
}

export default function BlogSection({ blogs = [] }: BlogSectionProps) {
  const blogList = blogs && blogs.length > 0 ? blogs : FALLBACK_BLOGS;

  return (
    <section id="blog" className="py-20 md:py-28 max-w-7xl mx-auto px-4 sm:px-6 space-y-16 border-t border-white/5">
      {/* HEADER */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-[#FF5722] text-xs font-mono tracking-widest uppercase font-bold">
          INSIGHTS & KNOWLEDGE
        </span>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white">
          Góc Nhìn & Tin Tức Chuyên Sâu
        </h2>
        <p className="text-xs sm:text-sm text-slate-400">
          Cập nhật xu hướng tiếp thị số mới nhất và các kinh nghiệm tổ chức sự kiện thể thao thực chiến.
        </p>
      </div>

      {/* 3 BLOG CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {blogList.map((post, idx) => (
          <article
            key={idx}
            className="p-8 rounded-3xl bg-[#0B111E] border border-white/10 hover:border-[#FF5722]/40 transition-all flex flex-col justify-between space-y-6 group hover:-translate-y-1.5 duration-300 shadow-xl"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase px-3 py-1 rounded-full bg-[#FF5722]/10 text-[#FF5722] border border-[#FF5722]/20">
                  {post.category || 'Tin Tức'}
                </span>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{post.read_time || '5 phút đọc'}</span>
                </div>
              </div>

              <h3 className="text-lg font-black text-white group-hover:text-[#FF5722] transition-colors leading-snug">
                {post.title}
              </h3>

              <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                {post.excerpt}
              </p>
            </div>

            <div className="space-y-4 pt-4 border-t border-white/5">
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>{post.author || 'S-Digital'}</span>
                <span>{post.published_at || 'Tháng 02/2026'}</span>
              </div>

              <a
                href="#contact"
                className="inline-flex items-center gap-2 text-xs font-bold text-[#FF5722] hover:text-orange-400 group-hover:translate-x-1 transition-transform"
              >
                <span>Đọc toàn bộ bài viết</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
