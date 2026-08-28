'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createCaseStudyAction(formData: FormData) {
  try {
    const supabase = await createServerSupabaseClient();

    const title = (formData.get('title') as string)?.trim();
    const client_name = (formData.get('client_name') as string)?.trim();
    const challenge = (formData.get('challenge') as string)?.trim();
    const solution = (formData.get('solution') as string)?.trim();
    const slug =
      (formData.get('slug') as string)?.trim() ||
      title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const athletes = (formData.get('athletes') as string)?.trim() || '5.2K VĐV';
    const articles = (formData.get('articles') as string)?.trim() || '50+ Bài Báo';
    const views = (formData.get('views') as string)?.trim() || '2M Lượt Xem';
    const is_featured = formData.get('is_featured') === 'on';

    if (!title || !client_name) {
      return { success: false, error: 'Tiêu đề dự án và tên khách hàng là bắt buộc.' };
    }

    const { error } = await supabase.from('case_studies').insert([
      {
        title,
        slug,
        client_name,
        challenge,
        solution,
        results: { athletes, articles, views },
        is_featured,
      },
    ]);

    if (error) throw error;

    revalidatePath('/admin/case-studies');
    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Không thể tạo Case Study mới.' };
  }
}

export async function updateCaseStudyAction(id: string, formData: FormData) {
  try {
    const supabase = await createServerSupabaseClient();

    const title = (formData.get('title') as string)?.trim();
    const client_name = (formData.get('client_name') as string)?.trim();
    const challenge = (formData.get('challenge') as string)?.trim();
    const solution = (formData.get('solution') as string)?.trim();
    const slug =
      (formData.get('slug') as string)?.trim() ||
      title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const athletes = (formData.get('athletes') as string)?.trim() || '5.2K VĐV';
    const articles = (formData.get('articles') as string)?.trim() || '50+ Bài Báo';
    const views = (formData.get('views') as string)?.trim() || '2M Lượt Xem';
    const is_featured = formData.get('is_featured') === 'on';

    if (!title || !client_name) {
      return { success: false, error: 'Tiêu đề dự án và tên khách hàng là bắt buộc.' };
    }

    const { error } = await supabase
      .from('case_studies')
      .update({
        title,
        slug,
        client_name,
        challenge,
        solution,
        results: { athletes, articles, views },
        is_featured,
      })
      .eq('id', id);

    if (error) throw error;

    revalidatePath('/admin/case-studies');
    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Không thể cập nhật Case Study.' };
  }
}

export async function deleteCaseStudyAction(id: string) {
  try {
    const supabase = await createServerSupabaseClient();

    const { error } = await supabase.from('case_studies').delete().eq('id', id);

    if (error) throw error;

    revalidatePath('/admin/case-studies');
    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Không thể xóa Case Study.' };
  }
}
