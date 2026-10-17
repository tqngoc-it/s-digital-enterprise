import { MetadataRoute } from 'next';
import { FALLBACK_BLOGS } from '@/lib/fallbackData';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://s-digital-vn.vercel.app';
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

  // 1. Danh sách các route tĩnh chuẩn xác của website
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/case-studies`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ];

  // 2. Lấy danh sách bài viết Blog động từ database (kèm dự phòng)
  let blogs = FALLBACK_BLOGS;
  try {
    const res = await fetch(`${backendUrl}/api/blogs`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        blogs = data;
      }
    }
  } catch {
    // Dự phòng khi backend chưa khởi động
  }

  const blogRoutes: MetadataRoute.Sitemap = blogs.map((post: any) => {
    const slugOrId = post.slug || post.id;
    let lastModified = new Date().toISOString();
    if (post.published_at) {
      const parsed = new Date(post.published_at);
      if (!isNaN(parsed.getTime())) {
        lastModified = parsed.toISOString();
      }
    }

    return {
      url: `${baseUrl}/blog/${encodeURIComponent(String(slugOrId))}`,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    };
  });

  return [...staticRoutes, ...blogRoutes];
}