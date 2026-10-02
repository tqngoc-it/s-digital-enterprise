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
    const metric1Label =
      (formData.get('metric_1_label') as string)?.trim() ||
      (formData.get('metric_1') as string)?.trim() ||
      'Quy mô';
    const metric1Value =
      (formData.get('metric_1_value') as string)?.trim() ||
      (formData.get('athletes') as string)?.trim() ||
      '5.2K+';

    const metric2Label =
      (formData.get('metric_2_label') as string)?.trim() ||
      (formData.get('metric_2') as string)?.trim() ||
      'Báo chí PR';
    const metric2Value =
      (formData.get('metric_2_value') as string)?.trim() ||
      (formData.get('articles') as string)?.trim() ||
      '50+ Bài';

    const metric3Label =
      (formData.get('metric_3_label') as string)?.trim() ||
      (formData.get('metric_3') as string)?.trim() ||
      'Lượt xem MXH';
    const metric3Value =
      (formData.get('metric_3_value') as string)?.trim() ||
      (formData.get('views') as string)?.trim() ||
      '2M Lượt';

    const results = {
      metrics: [
        { label: metric1Label, value: metric1Value },
        { label: metric2Label, value: metric2Value },
        { label: metric3Label, value: metric3Value },
      ],
      metric_1: { label: metric1Label, value: metric1Value },
      metric_2: { label: metric2Label, value: metric2Value },
      metric_3: { label: metric3Label, value: metric3Value },
      athletes: metric1Value,
      articles: metric2Value,
      views: metric3Value,
    };

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
        results,
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

    const metric1Label =
      (formData.get('metric_1_label') as string)?.trim() ||
      (formData.get('metric_1') as string)?.trim() ||
      'Quy mô';
    const metric1Value =
      (formData.get('metric_1_value') as string)?.trim() ||
      (formData.get('athletes') as string)?.trim() ||
      '5.2K+';

    const metric2Label =
      (formData.get('metric_2_label') as string)?.trim() ||
      (formData.get('metric_2') as string)?.trim() ||
      'Báo chí PR';
    const metric2Value =
      (formData.get('metric_2_value') as string)?.trim() ||
      (formData.get('articles') as string)?.trim() ||
      '50+ Bài';

    const metric3Label =
      (formData.get('metric_3_label') as string)?.trim() ||
      (formData.get('metric_3') as string)?.trim() ||
      'Lượt xem MXH';
    const metric3Value =
      (formData.get('metric_3_value') as string)?.trim() ||
      (formData.get('views') as string)?.trim() ||
      '2M Lượt';

    const results = {
      metrics: [
        { label: metric1Label, value: metric1Value },
        { label: metric2Label, value: metric2Value },
        { label: metric3Label, value: metric3Value },
      ],
      metric_1: { label: metric1Label, value: metric1Value },
      metric_2: { label: metric2Label, value: metric2Value },
      metric_3: { label: metric3Label, value: metric3Value },
      athletes: metric1Value,
      articles: metric2Value,
      views: metric3Value,
    };

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
        results,
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
    revalidatePath('/case-studies');
    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Không thể xóa Case Study.' };
  }
}

export async function reorderCaseStudiesAction(orderedIds: string[]) {
  try {
    const res = await fetch(`${backendUrl}/api/case-studies/reorder`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderedIds }),
    });

    const data = await res.json();
    if (!res.ok || !data?.success) {
      return { success: false, error: data?.message || 'Không thể sắp xếp lại thứ tự Case Studies.' };
    }

    revalidatePath('/admin/case-studies');
    revalidatePath('/case-studies');
    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Lỗi kết nối khi sắp xếp Case Studies.' };
  }
}
