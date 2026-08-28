'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createBlogAction(formData: FormData) {
  try {
    const supabase = await createServerSupabaseClient();

    const title = (formData.get('title') as string)?.trim();
    const excerpt = (formData.get('excerpt') as string)?.trim();
    const content = (formData.get('content') as string)?.trim() || excerpt;
    const category = (formData.get('category') as string)?.trim() || 'Marketing';
    const author = (formData.get('author') as string)?.trim() || 'S-Digital';
    const slug =
      (formData.get('slug') as string)?.trim() ||
      title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const status = (formData.get('status') as string) || 'PUBLISHED';

    if (!title || !excerpt) {
      return { success: false, error: 'Tiêu đề và tóm tắt bài viết là bắt buộc.' };
    }

    const { error } = await supabase.from('blogs').insert([
      {
        title,
        slug,
        excerpt,
        content,
        status,
        published_at: new Date().toISOString(),
      },
    ]);

    if (error) throw error;

    revalidatePath('/admin/blogs');
    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Không thể tạo bài viết mới.' };
  }
}

export async function updateBlogAction(id: string, formData: FormData) {
  try {
    const supabase = await createServerSupabaseClient();

    const title = (formData.get('title') as string)?.trim();
    const excerpt = (formData.get('excerpt') as string)?.trim();
    const content = (formData.get('content') as string)?.trim() || excerpt;
    const slug =
      (formData.get('slug') as string)?.trim() ||
      title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const status = (formData.get('status') as string) || 'PUBLISHED';

    if (!title || !excerpt) {
      return { success: false, error: 'Tiêu đề và tóm tắt bài viết là bắt buộc.' };
    }

    const { error } = await supabase
      .from('blogs')
      .update({
        title,
        slug,
        excerpt,
        content,
        status,
      })
      .eq('id', id);

    if (error) throw error;

    revalidatePath('/admin/blogs');
    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Không thể cập nhật bài viết.' };
  }
}

export async function deleteBlogAction(id: string) {
  try {
    const supabase = await createServerSupabaseClient();

    const { error } = await supabase.from('blogs').delete().eq('id', id);

    if (error) throw error;

    revalidatePath('/admin/blogs');
    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Không thể xóa bài viết.' };
  }
}
