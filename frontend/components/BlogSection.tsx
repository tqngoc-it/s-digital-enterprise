'use client';

import { useState } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import {
  Clock,
  Calendar,
  ArrowRight,
  ExternalLink,
  X,
  BookOpen,
} from 'lucide-react';
import { FALLBACK_BLOGS, BlogPostItem } from '@/lib/fallbackData';
import { formatVietnameseDate, formatReadTime, cleanMarkdownContent } from '@/lib/blogUtils';

interface BlogSectionProps {
  blogs?: BlogPostItem[];
}

export default function BlogSection({ blogs = [] }: BlogSectionProps) {
  const [quickReadPost, setQuickReadPost] = useState<BlogPostItem | null>(null);

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
          Cập nhật xu hướng tiếp thị số mới nhất và các kinh nghiệm tổ chức sự kiện thể thao thực chiến từ chuyên gia S-Digital.
        </p>
      </div>

      {/* 3 BLOG CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {blogList.map((post, idx) => {
          const isExternal = Boolean(post.external_url);
          const postLink = isExternal ? post.external_url! : `/blog/${post.slug || post.id || idx}`;
          const readTime = formatReadTime(post.read_time, post.content || post.excerpt);
          const publishedDate = formatVietnameseDate(post.published_at);

          return (
            <article
              key={post.id || post.slug || `blog-${idx}-${post.title}`}
              className="p-8 rounded-3xl bg-[#0B111E] border border-white/10 hover:border-[#FF5722]/40 transition-all flex flex-col justify-between space-y-6 group hover:-translate-y-1.5 duration-300 shadow-xl relative"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase px-3 py-1 rounded-full bg-[#FF5722]/10 text-[#FF5722] border border-[#FF5722]/20">
                    {post.category || 'Tin Tức'}
                  </span>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                    <Clock className="w-3.5 h-3.5 text-orange-400" />
                    <span>{readTime}</span>
                  </div>
                </div>

                <h3 className="text-lg font-black text-white group-hover:text-[#FF5722] transition-colors leading-snug">
                  {isExternal ? (
                    <a
                      href={postLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline flex items-start gap-1"
                    >
                      <span>{post.title}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-[#00E5FF] shrink-0 mt-1 inline" />
                    </a>
                  ) : (
                    <Link href={postLink} className="hover:underline">
                      {post.title}
                    </Link>
                  )}
                </h3>

                <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                  {post.excerpt}
                </p>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span className="truncate max-w-[140px] text-slate-400">{post.author || 'S-Digital Strategy Team'}</span>
                  <span>{publishedDate}</span>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  {/* MAIN READING LINK */}
                  {isExternal ? (
                    <a
                      href={post.external_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00E5FF] hover:text-[#00E5FF]/80 group-hover:translate-x-0.5 transition-transform"
                    >
                      <span>Đọc tại báo nguồn</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <Link
                      href={`/blog/${post.slug || post.id || idx}`}
                      className="inline-flex items-center gap-2 text-xs font-bold text-[#FF5722] hover:text-orange-400 group-hover:translate-x-1 transition-transform"
                    >
                      <span>Đọc toàn bộ bài viết</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}

                  {/* QUICK READ MODAL BUTTON (FOR INTERNAL ARTICLES) */}
                  {!isExternal && (
                    <button
                      type="button"
                      onClick={() => setQuickReadPost(post)}
                      className="text-[11px] font-medium text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                      title="Xem nhanh nội dung bài viết ngay trên trang"
                    >
                      Đọc nhanh
                    </button>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* QUICK READ MODAL */}
      {quickReadPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="max-w-2xl w-full p-6 sm:p-8 rounded-3xl bg-[#0B111E] border border-white/15 space-y-6 text-xs shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setQuickReadPost(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Đóng"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-3 pr-8">
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
                <span className="px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 font-bold">
                  {quickReadPost.category || 'Digital Marketing'}
                </span>
                <span className="text-zinc-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-orange-400" />
                  {formatReadTime(quickReadPost.read_time, quickReadPost.content || quickReadPost.excerpt)}
                </span>
                <span className="text-zinc-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-zinc-500" />
                  {formatVietnameseDate(quickReadPost.published_at)}
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                {quickReadPost.title}
              </h3>

              <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                <span className="font-bold text-white">{quickReadPost.author || 'S-Digital Strategy Team'}</span>
              </div>
            </div>

            {/* EXCERPT LEAD */}
            {quickReadPost.excerpt && (
              <div className="border-l-4 border-orange-500 bg-orange-500/[0.05] p-4 rounded-r-xl text-xs text-zinc-200 italic leading-relaxed">
                &ldquo;{quickReadPost.excerpt}&rdquo;
              </div>
            )}

            {/* FULL CONTENT WITH MARKDOWN */}
            <div className="space-y-3 text-xs sm:text-sm text-zinc-300 leading-relaxed max-h-[45vh] overflow-y-auto pr-2 prose prose-invert max-w-none prose-headings:text-white prose-strong:text-orange-400">
              <ReactMarkdown
                components={{
                  h1: ({ node, ...props }) => <h3 className="text-lg font-bold text-white mt-4 mb-2" {...props} />,
                  h2: ({ node, ...props }) => <h3 className="text-base font-bold text-white mt-4 mb-2 pb-1 border-b border-white/10" {...props} />,
                  h3: ({ node, ...props }) => <h4 className="text-sm font-bold text-white mt-3 mb-1" {...props} />,
                  p: ({ node, ...props }) => <p className="text-zinc-300 leading-relaxed my-2" {...props} />,
                  strong: ({ node, ...props }) => <strong className="text-orange-400 font-bold" {...props} />,
                  ul: ({ node, ...props }) => <ul className="space-y-1.5 pl-5 list-disc marker:text-orange-500 my-2 text-zinc-300" {...props} />,
                  ol: ({ node, ...props }) => <ol className="space-y-1.5 pl-5 list-decimal marker:text-orange-500 my-2 text-zinc-300" {...props} />,
                  li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                  blockquote: ({ node, ...props }) => <blockquote className="border-l-2 border-orange-500 bg-orange-500/[0.05] p-3 rounded-r-lg text-zinc-200 italic my-2" {...props} />,
                }}
              >
                {cleanMarkdownContent(quickReadPost.content || quickReadPost.excerpt || '')}
              </ReactMarkdown>
            </div>

            {/* MODAL FOOTER */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-white/10">
              <Link
                href={`/blog/${quickReadPost.slug || quickReadPost.id}`}
                onClick={() => setQuickReadPost(null)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-500/30"
              >
                <span>Mở Trang Toàn Văn</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={() => setQuickReadPost(null)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white font-bold text-xs cursor-pointer"
              >
                Đóng Cửa Sổ
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
