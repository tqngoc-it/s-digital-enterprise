import { createServerSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AdminNavigation from './AdminNavigation';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  async function handleSignOut() {
    'use server';
    const sb = await createServerSupabaseClient();
    await sb.auth.signOut();
    redirect('/admin');
  }

  return (
    <div className="min-h-screen bg-[#070A10] flex flex-col md:flex-row text-slate-200 antialiased">
      {/* RESPONSIVE NAVIGATION (MOBILE TOP BAR & DRAWER + DESKTOP SIDEBAR) */}
      <AdminNavigation userEmail={user?.email} onSignOut={handleSignOut} />

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-4 sm:p-6 md:p-10 overflow-y-auto max-h-screen min-w-0">
        {children}
      </main>
    </div>
  );
}