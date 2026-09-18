import type { Metadata } from 'next';
import './globals.css'; // Giữ lại import CSS hiện tại của bạn (nếu có)

// 1. Cấu hình SEO & OpenGraph
export const metadata: Metadata = {
  metadataBase: new URL('https://s-digital-vn.vercel.app'),
  title: {
    default: 'S-Digital | Giải pháp Chuyển đổi số & Tích hợp AI',
    template: '%s | S-Digital',
  },
  description:
    'Nền tảng chuyển đổi số toàn diện cho doanh nghiệp: Tích hợp trí tuệ nhân tạo (AI), tự động hóa quy trình và tư vấn giải pháp công nghệ.',
  keywords: [
    'Chuyển đổi số',
    'Giải pháp AI',
    'Phần mềm doanh nghiệp',
    'S-Digital',
    'NextJS NestJS Monorepo',
  ],
  authors: [{ name: 'S-Digital Team' }],
  creator: 'S-Digital',
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: 'https://s-digital-vn.vercel.app',
    title: 'S-Digital | Tiên phong Giải pháp Chuyển đổi số & AI',
    description:
      'Nâng tầm hiệu suất doanh nghiệp với hệ sinh thái phần mềm hiện đại và trí tuệ nhân tạo thông minh.',
    siteName: 'S-Digital Enterprise',
    images: [
      {
        url: '/vercel.svg',
        width: 1200,
        height: 630,
        alt: 'S-Digital Platform Preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'S-Digital | Giải pháp Chuyển đổi số & AI',
    description:
      'Hệ sinh thái phần mềm và trí tuệ nhân tạo tối ưu cho doanh nghiệp.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

// 2. React Component bắt buộc (Next.js dùng để render DOM)
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="antialiased bg-[#030712] text-white">
        {/* Nếu trước đó bạn có Navbar, Footer hay ThemeProvider thì giữ nguyên ở đây */}
        {children}
      </body>
    </html>
  );
}