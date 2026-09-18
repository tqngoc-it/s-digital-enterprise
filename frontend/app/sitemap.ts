import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://s-digital-vn.vercel.app';

  // Danh sách các route tĩnh chính của website
  const staticRoutes = [
    '',
    '/services',
    '/pricing',
    '/case-studies',
    '/blogs',
    '/contact',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  return [...staticRoutes];
}