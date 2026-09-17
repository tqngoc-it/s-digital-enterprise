'use server';

import { revalidatePath } from 'next/cache';

export async function submitLeadAction(formData: FormData) {
  try {
    const full_name = (formData.get('full_name') as string)?.trim();
    const email = (formData.get('email') as string)?.trim();
    const phone = (formData.get('phone') as string)?.trim();
    const company_name = (formData.get('company_name') as string)?.trim();
    const message = (formData.get('message') as string)?.trim();

    if (!full_name) {
      return { success: false, error: 'Vui lòng nhập họ và tên của bạn.' };
    }
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Vui lòng cung cấp địa chỉ email hợp lệ.' };
    }
    if (!message || message.length < 5) {
      return { success: false, error: 'Nội dung yêu cầu tư vấn tối thiểu 5 ký tự.' };
    }

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    const res = await fetch(`${backendUrl}/api/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name,
        email,
        phone: phone || undefined,
        company_name: company_name || undefined,
        message,
      }),
    });

    const data = await res.json();
    if (!res.ok || !data?.success) {
      return {
        success: false,
        error:
          Array.isArray(data?.message)
            ? data.message.join(', ')
            : data?.message || data?.error || 'Không thể gửi thông tin sang máy chủ.',
      };
    }

    revalidatePath('/admin/leads');
    revalidatePath('/admin');
    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Đã có lỗi xảy ra trong quá trình gửi thông tin.',
    };
  }
}