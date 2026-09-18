import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://s-digital-vn.vercel.app';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/'], // Chặn bot cào trang quản trị và route API
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}