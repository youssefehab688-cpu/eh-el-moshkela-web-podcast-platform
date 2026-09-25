'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // التحقق من الجلسة وتثبيتها في المتصفح
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Auth error:', error);
      }
      // التوجيه التلقائي للصفحة الرئيسية
      router.replace('/');
    });
  }, [router]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center gap-3">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-300"></div>
      <p className="text-xs text-zinc-400 font-medium">جاري إتمام تسجيل الدخول والمزامنة...</p>
    </div>
  );
}
