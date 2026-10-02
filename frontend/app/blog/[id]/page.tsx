import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  ArrowLeft,
  Clock,
  Calendar,
  User,
  ArrowRight,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { FALLBACK_BLOGS, FALLBACK_COMPANY, BlogPostItem } from '@/lib/fallbackData';
import { formatVietnameseDate, formatReadTime, cleanMarkdownContent } from '@/lib/blogUtils';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getBlogPost(idOrSlug: string): Promise<BlogPostItem | null> {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

  // 1. Tìm trong backend qua ID/slug trực tiếp
  try {
    const res = await fetch(`${backendUrl}/api/blogs/${idOrSlug}`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data && (data.id || data.title)) return data;
    }
  } catch (err) {
    // backend offline or error
  }

  // 2. Tìm trong danh sách tất cả backend blogs
  try {
    const resAll = await fetch(`${backendUrl}/api/blogs`, { cache: 'no-store' });
    if (resAll.ok) {
      const blogs = await resAll.json();
      if (Array.isArray(blogs)) {
        const found = blogs.find(
          (b: any) =>
            String(b.id) === String(idOrSlug) ||
            String(b.slug) === String(idOrSlug) ||
            encodeURIComponent(b.slug || '') === idOrSlug
        );
        if (found) return found;
      }
    }
  } catch (err) {
    // ignore
  }

  // 3. Fallback vào danh sách FALLBACK_BLOGS
  const fallback = FALLBACK_BLOGS.find(
    (b) =>
      b.id === idOrSlug ||
      b.slug === idOrSlug ||
      encodeURIComponent(b.slug) === idOrSlug
  );

  return fallback || null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const post = await getBlogPost(id);

  if (!post) {
    return {
      title: 'Không Tìm Thấy Bài Viết | S-Digital Enterprise',
    };
  }

  return {
    title: `${post.title} | S-Digital Insights`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.published_at,
      authors: [post.author || 'S-Digital Strategy Team'],
    },
  };
}

export default async function BlogDetailPage({ params }: PageProps) {
  const { id } = await params;
  const post = await getBlogPost(id);

  if (!post) {
    notFound();
  }

  const publishedDate = formatVietnameseDate(post.published_at);
  const readTime = formatReadTime(post.read_time, post.content || post.excerpt);
  const rawArticle = post.content || post.excerpt || '';
  const cleanArticle = cleanMarkdownContent(rawArticle);

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 selection:bg-[#FF5722] selection:text-white flex flex-col antialiased">
      <Navbar />

      <main className="flex-1 py-12 md:py-20 max-w-4xl mx-auto px-4 sm:px-6 w-full space-y-10">
        {/* BREADCRUMB & BACK BUTTON */}
        <div className="flex items-center justify-between">
          <Link
            href="/#blog"
            className="inline-flex items-center gap-2 text-xs text-zinc-400 hover:text-orange-400 transition-colors font-mono"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Trở về Tin Tức & Góc Nhìn</span>
          </Link>

          <span className="text-[11px] font-mono text-zinc-400 uppercase px-3 py-1 rounded-full bg-white/5 border border-white/5">
            S-Digital Knowledge Hub
          </span>
        </div>

        {/* ARTICLE HEADER */}
        <header className="space-y-6 border-b border-white/10 pb-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-mono font-bold uppercase px-3.5 py-1 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">
              {post.category || 'Digital Marketing'}
            </span>

            <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
              <Clock className="w-3.5 h-3.5 text-orange-400" />
              <span>{readTime}</span>
            </div>

            <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
              <Calendar className="w-3.5 h-3.5 text-zinc-400" />
              <span>{publishedDate}</span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight tracking-tight">
            {post.title}
          </h1>

          <div className="flex items-center justify-between text-xs text-zinc-400 pt-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#FF5722] to-orange-600 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-orange-500/20">
                SD
              </div>
              <div>
                <p className="font-bold text-white">{post.author || 'S-Digital Strategy Team'}</p>
                <p className="text-[10px] text-zinc-400">Chuyên gia phân tích & chiến lược số</p>
              </div>
            </div>

            {post.external_url && (
              <a
                href={post.external_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 text-xs font-bold transition-all border border-orange-500/20"
              >
                <span>Nguồn báo chí ngoài</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </header>

        {/* LEAD EXCERPT / QUOTE BOX */}
        {post.excerpt && (
          <div className="border-l-4 border-orange-500 bg-orange-500/[0.05] p-6 rounded-r-xl text-zinc-200 italic text-sm sm:text-base leading-relaxed shadow-sm">
            &ldquo;{post.excerpt}&rdquo;
          </div>
        )}

        {/* ARTICLE CONTENT - STANDARD MARKDOWN TYPOGRAPHY */}
        <article className="prose prose-invert max-w-none prose-headings:text-white prose-headings:font-bold prose-p:text-zinc-300 prose-p:leading-relaxed prose-strong:text-orange-400 prose-hr:border-white/10 text-sm sm:text-base leading-relaxed">
          <ReactMarkdown
            components={{
              h1: ({ node, ...props }) => (
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mt-8 mb-4 tracking-tight" {...props} />
              ),
              h2: ({ node, ...props }) => (
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white mt-8 mb-4 pb-2 border-b border-white/10 tracking-tight" {...props} />
              ),
              h3: ({ node, ...props }) => (
                <h3 className="text-lg sm:text-xl font-bold text-white mt-6 mb-3 tracking-tight flex items-center gap-2" {...props} />
              ),
              p: ({ node, ...props }) => (
                <p className="text-zinc-300 leading-relaxed my-4 text-sm sm:text-base" {...props} />
              ),
              strong: ({ node, ...props }) => (
                <strong className="text-orange-400 font-bold" {...props} />
              ),
              ul: ({ node, ...props }) => (
                <ul className="space-y-2 pl-6 list-disc marker:text-orange-500 my-4 text-zinc-300 text-sm sm:text-base" {...props} />
              ),
              ol: ({ node, ...props }) => (
                <ol className="space-y-2 pl-6 list-decimal marker:text-orange-500 my-4 text-zinc-300 text-sm sm:text-base" {...props} />
              ),
              li: ({ node, ...props }) => (
                <li className="pl-1 leading-relaxed" {...props} />
              ),
              hr: ({ node, ...props }) => (
                <hr className="my-8 border-white/10" {...props} />
              ),
              blockquote: ({ node, ...props }) => (
                <blockquote className="border-l-4 border-orange-500 bg-orange-500/[0.05] p-5 my-6 rounded-r-xl text-zinc-200 italic" {...props} />
              ),
              a: ({ node, ...props }) => (
                <a className="text-orange-400 hover:text-orange-300 underline underline-offset-4 font-medium transition-colors" target="_blank" rel="noopener noreferrer" {...props} />
              ),
            }}
          >
            {cleanArticle}
          </ReactMarkdown>
        </article>

        {/* EXTERNAL LINK CALLOUT (IF AVAILABLE) */}
        {post.external_url && (
          <div className="p-6 rounded-2xl bg-orange-500/[0.04] border border-orange-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-mono font-bold text-orange-400 uppercase">
                BÀI VIẾT NGUỒN NGOÀI
              </span>
              <p className="text-xs text-zinc-300">
                Bài viết này được xuất bản gốc trên nền tảng báo chí uy tín. Bạn có thể mở bài viết gốc để xác thực.
              </p>
            </div>
            <a
              href={post.external_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 text-white font-bold text-xs hover:bg-orange-600 transition-all shrink-0 shadow-lg shadow-orange-500/20"
            >
              <span>Đọc tại nguồn gốc</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}

        {/* BOTTOM CTA: CONTACT S-DIGITAL */}
        <div className="p-8 rounded-3xl bg-gradient-to-br from-[#0B111E] to-[#121826] border border-white/10 space-y-5 text-center relative overflow-hidden">
          <div className="space-y-2">
            <span className="text-[#FF5722] text-xs font-mono font-bold uppercase tracking-wider">
              S-DIGITAL PARTNERSHIP
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Cần Tư Vấn Chiến Lược Cho Doanh Nghiệp Của Bạn?
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
              Đội ngũ chuyên viên chiến lược S-Digital sẵn sàng thiết kế giải pháp Marketing và giải đấu thể thao độc quyền tối ưu ngân sách.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/#contact"
              className="px-6 py-3.5 rounded-xl bg-[#FF5722] hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-[#FF5722]/30"
            >
              <span>Nhận Tư Vấn Miễn Phí 1:1</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/#blog"
              className="px-5 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs transition-all border border-white/10"
            >
              <span>Đọc thêm bài viết khác</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer companyInfo={FALLBACK_COMPANY} />
    </div>
  );
}
