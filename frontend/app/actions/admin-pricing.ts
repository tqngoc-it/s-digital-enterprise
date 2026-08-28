'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createPricingPlanAction(formData: FormData) {
  try {
    const supabase = await createServerSupabaseClient();

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

    const { error } = await supabase.from('pricing_plans').insert([
      {
        tier_name,
        target_audience,
        price_display,
        features,
      },
    ]);

    if (error) throw error;

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
    const supabase = await createServerSupabaseClient();

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

    const { error } = await supabase
      .from('pricing_plans')
      .update({
        tier_name,
        target_audience,
        price_display,
        features,
      })
      .eq('id', id);

    if (error) throw error;

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
    const supabase = await createServerSupabaseClient();

    const { error } = await supabase.from('pricing_plans').delete().eq('id', id);

    if (error) throw error;

    revalidatePath('/admin/pricing');
    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Không thể xóa gói giá.' };
  }
}
