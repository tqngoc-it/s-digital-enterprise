'use server';

import { revalidatePath } from 'next/cache';

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export async function createBlogAction(formData: FormData) {
  try {
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

    const res = await fetch(`${backendUrl}/api/blogs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        slug,
        excerpt,
        content,
        category,
        author,
        status,
        published_at: new Date().toISOString(),
      }),
    });

    const data = await res.json();
    if (!res.ok || !data?.success) {
      return { success: false, error: data?.message || 'Không thể tạo bài viết mới.' };
    }

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

    const res = await fetch(`${backendUrl}/api/blogs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        slug,
        excerpt,
        content,
        category,
        author,
        status,
      }),
    });

    const data = await res.json();
    if (!res.ok || !data?.success) {
      return { success: false, error: data?.message || 'Không thể cập nhật bài viết.' };
    }

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
    const res = await fetch(`${backendUrl}/api/blogs/${id}`, {
      method: 'DELETE',
    });

    const data = await res.json();
    if (!res.ok || !data?.success) {
      return { success: false, error: data?.message || 'Không thể xóa bài viết.' };
    }

    revalidatePath('/admin/blogs');
    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Không thể xóa bài viết.' };
  }
}
