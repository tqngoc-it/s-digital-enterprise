'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createPartnerAction(formData: FormData) {
  try {
    const supabase = await createServerSupabaseClient();

    const name = (formData.get('name') as string)?.trim();
    const type = (formData.get('type') as string) || 'CUSTOMER';
    const industry = (formData.get('industry') as string)?.trim() || null;
    const logo_url = (formData.get('logo_url') as string)?.trim() || null;
    const website_url = (formData.get('website_url') as string)?.trim() || null;
    const display_order = parseInt((formData.get('display_order') as string) || '0', 10);

    if (!name) {
      return { success: false, error: 'Tên khách hàng / đối tác là bắt buộc.' };
    }

    const { error } = await supabase.from('partners').insert([
      {
        name,
        type,
        industry,
        logo_url,
        website_url,
        display_order,
      },
    ]);

    if (error) throw error;

    revalidatePath('/admin/partners');
    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Không thể tạo đối tác mới.' };
  }
}

export async function updatePartnerAction(id: string, formData: FormData) {
  try {
    const supabase = await createServerSupabaseClient();

    const name = (formData.get('name') as string)?.trim();
    const type = (formData.get('type') as string) || 'CUSTOMER';
    const industry = (formData.get('industry') as string)?.trim() || null;
    const logo_url = (formData.get('logo_url') as string)?.trim() || null;
    const website_url = (formData.get('website_url') as string)?.trim() || null;
    const display_order = parseInt((formData.get('display_order') as string) || '0', 10);

    if (!name) {
      return { success: false, error: 'Tên khách hàng / đối tác là bắt buộc.' };
    }

    const { error } = await supabase
      .from('partners')
      .update({
        name,
        type,
        industry,
        logo_url,
        website_url,
        display_order,
      })
      .eq('id', id);

    if (error) throw error;

    revalidatePath('/admin/partners');
    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Không thể cập nhật đối tác.' };
  }
}

export async function deletePartnerAction(id: string) {
  try {
    const supabase = await createServerSupabaseClient();

    const { error } = await supabase.from('partners').delete().eq('id', id);

    if (error) throw error;

    revalidatePath('/admin/partners');
    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Không thể xóa đối tác.' };
  }
}
