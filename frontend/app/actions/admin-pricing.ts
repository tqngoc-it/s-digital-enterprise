'use server';

import { revalidatePath } from 'next/cache';

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export async function createPricingPlanAction(formData: FormData) {
  try {
    const tier_name = (formData.get('tier_name') as string)?.trim();
    const target_audience = (formData.get('target_audience') as string)?.trim();
    const price_display = (formData.get('price_display') as string)?.trim();
    const featuresRaw = (formData.get('features') as string)?.trim() || '';

    const features = featuresRaw
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean);

    if (!tier_name || !price_display) {
      return { success: false, error: 'Tên gói và mức giá là bắt buộc.' };
    }

    const res = await fetch(`${backendUrl}/api/pricing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tier_name,
        target_audience,
        price_display,
        features,
      }),
    });

    const data = await res.json();
    if (!res.ok || !data?.success) {
      return { success: false, error: data?.message || 'Không thể tạo gói giá mới.' };
    }

    revalidatePath('/admin/pricing');
    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Không thể tạo gói giá mới.' };
  }
}

export async function updatePricingPlanAction(id: string, formData: FormData) {
  try {
    const tier_name = (formData.get('tier_name') as string)?.trim();
    const target_audience = (formData.get('target_audience') as string)?.trim();
    const price_display = (formData.get('price_display') as string)?.trim();
    const featuresRaw = (formData.get('features') as string)?.trim() || '';

    const features = featuresRaw
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean);

    if (!tier_name || !price_display) {
      return { success: false, error: 'Tên gói và mức giá là bắt buộc.' };
    }

    const res = await fetch(`${backendUrl}/api/pricing/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tier_name,
        target_audience,
        price_display,
        features,
      }),
    });

    const data = await res.json();
    if (!res.ok || !data?.success) {
      return { success: false, error: data?.message || 'Không thể cập nhật gói giá.' };
    }

    revalidatePath('/admin/pricing');
    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Không thể cập nhật gói giá.' };
  }
}

export async function deletePricingPlanAction(id: string) {
  try {
    const res = await fetch(`${backendUrl}/api/pricing/${id}`, {
      method: 'DELETE',
    });

    const data = await res.json();
    if (!res.ok || !data?.success) {
      return { success: false, error: data?.message || 'Không thể xóa gói giá.' };
    }

    revalidatePath('/admin/pricing');
    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Không thể xóa gói giá.' };
  }
}
