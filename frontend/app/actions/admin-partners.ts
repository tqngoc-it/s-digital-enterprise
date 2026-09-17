'use server';

import { revalidatePath } from 'next/cache';

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export async function createPartnerAction(formData: FormData) {
  try {
    const name = (formData.get('name') as string)?.trim();
    const type = (formData.get('type') as string) || 'CUSTOMER';
    const industry = (formData.get('industry') as string)?.trim() || null;
    const logo_url = (formData.get('logo_url') as string)?.trim() || null;
    const website_url = (formData.get('website_url') as string)?.trim() || null;
    const display_order = parseInt((formData.get('display_order') as string) || '0', 10);

    if (!name) {
      return { success: false, error: 'Tên khách hàng / đối tác là bắt buộc.' };
    }

    const res = await fetch(`${backendUrl}/api/partners`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        type,
        industry,
        logo_url,
        website_url,
        display_order,
      }),
    });

    const data = await res.json();
    if (!res.ok || !data?.success) {
      return { success: false, error: data?.message || 'Không thể tạo đối tác mới.' };
    }

    revalidatePath('/admin/partners');
    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Không thể tạo đối tác mới.' };
  }
}

export async function updatePartnerAction(id: string, formData: FormData) {
  try {
    const name = (formData.get('name') as string)?.trim();
    const type = (formData.get('type') as string) || 'CUSTOMER';
    const industry = (formData.get('industry') as string)?.trim() || null;
    const logo_url = (formData.get('logo_url') as string)?.trim() || null;
    const website_url = (formData.get('website_url') as string)?.trim() || null;
    const display_order = parseInt((formData.get('display_order') as string) || '0', 10);

    if (!name) {
      return { success: false, error: 'Tên khách hàng / đối tác là bắt buộc.' };
    }

    const res = await fetch(`${backendUrl}/api/partners/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        type,
        industry,
        logo_url,
        website_url,
        display_order,
      }),
    });

    const data = await res.json();
    if (!res.ok || !data?.success) {
      return { success: false, error: data?.message || 'Không thể cập nhật đối tác.' };
    }

    revalidatePath('/admin/partners');
    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Không thể cập nhật đối tác.' };
  }
}

export async function deletePartnerAction(id: string) {
  try {
    const res = await fetch(`${backendUrl}/api/partners/${id}`, {
      method: 'DELETE',
    });

    const data = await res.json();
    if (!res.ok || !data?.success) {
      return { success: false, error: data?.message || 'Không thể xóa đối tác.' };
    }

    revalidatePath('/admin/partners');
    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Không thể xóa đối tác.' };
  }
}
