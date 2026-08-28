'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateLeadStatusAction(id: string, status: string) {
  try {
    const supabase = await createServerSupabaseClient();

    const { error } = await supabase
      .from('leads')
      .update({ status })
      .eq('id', id);

    if (error) throw error;

    revalidatePath('/admin/leads');
    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Không thể cập nhật trạng thái' };
  }
}

export async function deleteLeadAction(id: string) {
  try {
    const supabase = await createServerSupabaseClient();

    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id);

    if (error) throw error;

    revalidatePath('/admin/leads');
    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Không thể xóa lead' };
  }
}