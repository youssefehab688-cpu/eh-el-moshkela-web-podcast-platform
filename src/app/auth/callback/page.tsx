'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function handleAuth() {
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get('code');
        const error = url.searchParams.get('error_description') || url.searchParams.get('error');

        if (error) {
          setErrorMsg(`خطأ من مزود الدخول: ${error}`);
          return;
        }

        if (code) {
          // استبدال الكود بجلسة حقيقية وحفظ التوكن في المتصفح
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            console.error('Exchange error:', exchangeError);
            setErrorMsg(exchangeError.message);
            return;
          }
        }

        // تحويل كامل للصفحة الرئيسية لتحديث شريط الـ Navbar وحساب المستخدم فوراً
        window.location.href = '/';
      } catch (err: any) {
        setErrorMsg(err.message || 'حدث خطأ أثناء إتمام الدخول');
      }
    }

    handleAuth();
  }, []);

  if (errorMsg) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center gap-4 p-4 text-center">
        <div className="p-4 bg-red-950/60 border border-red-800 rounded-2xl text-red-200 text-xs sm:text-sm max-w-md">
          <p className="font-bold mb-1">تعذر تسجيل الدخول:</p>
          <p>{errorMsg}</p>
        </div>
        <a
          href="/"
          className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white transition-colors"
        >
          العودة للرئيسية
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center gap-3">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-300"></div>
      <p className="text-xs text-zinc-400 font-medium">جاري تأكيد الحساب والمزامنة...</p>
    </div>
  );
}
