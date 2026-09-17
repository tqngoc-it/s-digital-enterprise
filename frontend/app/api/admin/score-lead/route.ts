import { NextResponse } from 'next/server';

/**
 * @deprecated GIAI ĐOẠN 3: TÁI CẤU TRÚC HỆ THỐNG PHÂN TẦNG (Decoupling Monorepo).
 * Logic thẩm định khách hàng tiềm năng đã được bóc tách và chuyển giao toàn bộ sang NestJS Backend độc lập:
 * POST /api/leads/score
 * Vui lòng gọi trực tiếp: ${NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/api/leads/score
 */
export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error: 'DEPRECATED_ENDPOINT',
      message:
        'Tuyệt đối không sử dụng Next.js Route Handler cho logic thẩm định. Vui lòng gọi sang NestJS Backend: POST /api/leads/score',
    },
    { status: 410 }
  );
}
