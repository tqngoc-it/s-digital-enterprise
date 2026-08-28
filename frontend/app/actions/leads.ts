'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function submitLeadAction(formData: FormData) {
  try {
    const supabase = await createServerSupabaseClient();

    const full_name = (formData.get('full_name') as string)?.trim();
    const email = (formData.get('email') as string)?.trim();
    const phone = (formData.get('phone') as string)?.trim();
    const company_name = (formData.get('company_name') as string)?.trim();
    const message = (formData.get('message') as string)?.trim();

    // Client/Server validation
    if (!full_name) {
      return { success: false, error: 'Vui lòng nhập họ và tên của bạn.' };
    }
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Vui lòng cung cấp địa chỉ email hợp lệ.' };
    }
    if (!message || message.length < 5) {
      return { success: false, error: 'Nội dung yêu cầu tư vấn tối thiểu 5 ký tự.' };
    }

    const { data, error } = await supabase.from('leads').insert([
      {
        full_name,
        email,
        phone: phone || null,
        company_name: company_name || null,
        message: message,
        status: 'NEW',
        source: 'Landing Page Form',
      },
    ]);

    if (error) {
      console.error('[SUBMIT_LEAD_ERROR]:', error);
      return {
        success: false,
        error: error.message || 'Không thể lưu dữ liệu vào hệ thống. Vui lòng thử lại sau.',
      };
    }

    revalidatePath('/admin/leads');
    revalidatePath('/admin');
    return { success: true };
  } catch (err: any) {
    console.error('[SUBMIT_LEAD_EXCEPTION]:', err);
    return {
      success: false,
      error: err?.message || 'Đã có lỗi xảy ra trong quá trình gửi thông tin.',
    };
  }
}