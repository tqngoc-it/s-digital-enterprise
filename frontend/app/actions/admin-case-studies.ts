'use server';

import { revalidatePath } from 'next/cache';

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export async function createCaseStudyAction(formData: FormData) {
  try {
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

    const res = await fetch(`${backendUrl}/api/case-studies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        slug,
        client_name,
        challenge,
        solution,
        results: { athletes, articles, views },
        is_featured,
      }),
    });

    const data = await res.json();
    if (!res.ok || !data?.success) {
      return { success: false, error: data?.message || 'Không thể tạo Case Study mới.' };
    }

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

    const res = await fetch(`${backendUrl}/api/case-studies/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        slug,
        client_name,
        challenge,
        solution,
        results: { athletes, articles, views },
        is_featured,
      }),
    });

    const data = await res.json();
    if (!res.ok || !data?.success) {
      return { success: false, error: data?.message || 'Không thể cập nhật Case Study.' };
    }

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
    const res = await fetch(`${backendUrl}/api/case-studies/${id}`, {
      method: 'DELETE',
    });

    const data = await res.json();
    if (!res.ok || !data?.success) {
      return { success: false, error: data?.message || 'Không thể xóa Case Study.' };
    }

    revalidatePath('/admin/case-studies');
    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Không thể xóa Case Study.' };
  }
}
