'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

function parseBulletPoints(formData: FormData): string[] {
  const raw = (formData.get('bullet_points') as string)?.trim() || (formData.get('features') as string)?.trim() || '';
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map((item) => String(item).trim()).filter(Boolean);
    }
  } catch {
    // Not json, parse lines
  }
  return raw
    .split('\n')
    .map((f) => f.trim())
    .filter(Boolean);
}

export async function createServiceAction(formData: FormData) {
  try {
    const supabase = await createServerSupabaseClient();

    const title = (formData.get('title') as string)?.trim();
    if (!title) {
      return { success: false, error: 'Tiêu đề dịch vụ là bắt buộc.' };
    }

    const slug = (formData.get('slug') as string)?.trim() || generateSlug(title);
    const sub_title = (formData.get('sub_title') as string)?.trim() || (formData.get('subtitle') as string)?.trim() || null;
    const short_description = (formData.get('short_description') as string)?.trim() || null;
    const categoryRaw = (formData.get('category') as string)?.toUpperCase() || 'DIGITAL';
    const category = categoryRaw === 'SPORTS' ? 'SPORTS' : 'DIGITAL';
    const display_order = parseInt((formData.get('display_order') as string) || '0', 10);
    const icon_name = (formData.get('icon_name') as string)?.trim() || null;
    const thumbnail_url = (formData.get('thumbnail_url') as string)?.trim() || null;

    const is_active_val = formData.get('is_active');
    const is_active = is_active_val === 'true' || is_active_val === 'on' || is_active_val === '1' || is_active_val === null;

    const bullet_points = parseBulletPoints(formData);

    const { error } = await supabase.from('services').insert([
      {
        title,
        slug,
        sub_title,
        short_description,
        bullet_points,
        category,
        display_order,
        icon_name,
        thumbnail_url,
        is_active,
      },
    ]);

    if (error) throw error;

    revalidatePath('/admin/services');
    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Không thể tạo dịch vụ mới.' };
  }
}

export async function updateServiceAction(id: string, formData: FormData) {
  try {
    const supabase = await createServerSupabaseClient();

    const title = (formData.get('title') as string)?.trim();
    if (!title) {
      return { success: false, error: 'Tiêu đề dịch vụ là bắt buộc.' };
    }

    const slug = (formData.get('slug') as string)?.trim() || generateSlug(title);
    const sub_title = (formData.get('sub_title') as string)?.trim() || (formData.get('subtitle') as string)?.trim() || null;
    const short_description = (formData.get('short_description') as string)?.trim() || null;
    const categoryRaw = (formData.get('category') as string)?.toUpperCase() || 'DIGITAL';
    const category = categoryRaw === 'SPORTS' ? 'SPORTS' : 'DIGITAL';
    const display_order = parseInt((formData.get('display_order') as string) || '0', 10);
    const icon_name = (formData.get('icon_name') as string)?.trim() || null;
    const thumbnail_url = (formData.get('thumbnail_url') as string)?.trim() || null;

    const is_active_val = formData.get('is_active');
    const is_active = is_active_val === 'true' || is_active_val === 'on' || is_active_val === '1';

    const bullet_points = parseBulletPoints(formData);

    const { error } = await supabase
      .from('services')
      .update({
        title,
        slug,
        sub_title,
        short_description,
        bullet_points,
        category,
        display_order,
        icon_name,
        thumbnail_url,
        is_active,
      })
      .eq('id', id);

    if (error) throw error;

    revalidatePath('/admin/services');
    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Không thể cập nhật dịch vụ.' };
  }
}

export async function deleteServiceAction(id: string) {
  try {
    const supabase = await createServerSupabaseClient();

    const { error } = await supabase.from('services').delete().eq('id', id);

    if (error) throw error;

    revalidatePath('/admin/services');
    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Không thể xóa dịch vụ.' };
  }
}

export async function toggleServiceActiveAction(id: string, is_active: boolean) {
  try {
    const supabase = await createServerSupabaseClient();

    const { error } = await supabase
      .from('services')
      .update({ is_active })
      .eq('id', id);

    if (error) throw error;

    revalidatePath('/admin/services');
    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Không thể cập nhật trạng thái hiển thị.' };
  }
}
