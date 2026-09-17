import { NextResponse } from 'next/server';

/**
 * @deprecated GIAI ĐOẠN 3: TÁI CẤU TRÚC HỆ THỐNG PHÂN TẦNG.
 * Tuyệt đối không tạo logic backend trong frontend/app/api.
 * Sử dụng endpoint NestJS Backend: POST /api/leads/score
 */
export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error: 'DEPRECATED_ENDPOINT',
      message: 'Vui lòng sử dụng NestJS Backend: POST /api/leads/score',
    },
    { status: 410 }
  );
}