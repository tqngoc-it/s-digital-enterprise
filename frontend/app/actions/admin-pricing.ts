'use server';

import { revalidatePath } from 'next/cache';

import { parseVietnameseCurrency } from '@/lib/currency';

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export async function createPricingPlanAction(formData: FormData) {
  try {
    const tier_name = (formData.get('tier_name') as string)?.trim();
    const target_audience = (formData.get('target_audience') as string)?.trim();
    const rawPrice = (formData.get('price_display') as string)?.trim();
    const display_order_raw = formData.get('display_order');
    const display_order = display_order_raw ? parseInt(display_order_raw as string, 10) : undefined;
    const is_popular = formData.get('is_popular') === 'true' || formData.get('is_popular') === 'on';
    const featuresRaw = (formData.get('features') as string)?.trim() || '';

    const features = featuresRaw
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean);

    if (!tier_name || !rawPrice) {
      return { success: false, error: 'Tên gói và mức giá là bắt buộc.' };
    }

    const { formattedDisplay } = parseVietnameseCurrency(rawPrice);

    const payload: any = {
      tier_name,
      target_audience,
      price_display: formattedDisplay,
      is_popular,
      features,
    };
    if (display_order !== undefined) payload.display_order = display_order;

    const res = await fetch(`${backendUrl}/api/pricing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
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
    const rawPrice = (formData.get('price_display') as string)?.trim();
    const display_order_raw = formData.get('display_order');
    const display_order = display_order_raw ? parseInt(display_order_raw as string, 10) : undefined;
    const is_popular = formData.get('is_popular') === 'true' || formData.get('is_popular') === 'on';
    const featuresRaw = (formData.get('features') as string)?.trim() || '';

    const features = featuresRaw
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean);

    if (!tier_name || !rawPrice) {
      return { success: false, error: 'Tên gói và mức giá là bắt buộc.' };
    }

    const { formattedDisplay } = parseVietnameseCurrency(rawPrice);

    const res = await fetch(`${backendUrl}/api/pricing/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tier_name,
        target_audience,
        price_display: formattedDisplay,
        display_order,
        is_popular,
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

export async function reorderPricingAction(orderedIds: string[]) {
  try {
    const res = await fetch(`${backendUrl}/api/pricing/reorder`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderedIds }),
    });

    const data = await res.json();
    if (!res.ok || !data?.success) {
      return { success: false, error: data?.message || 'Không thể sắp xếp lại thứ tự gói giá.' };
    }

    revalidatePath('/admin/pricing');
    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Lỗi kết nối khi sắp xếp gói giá.' };
  }
}
