'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { supabase } from '@/lib/supabase';
import { X, Sparkles, AlertCircle } from 'lucide-react';

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/` : '';
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
      }
    } catch (err: any) {
      setErrorMsg('حدث خطأ أثناء الاتصال بخدمة تسجيل الدخول');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-card-fade">
      {/* خلفية تغلق المودال عند النقر خارجها */}
      <div className="absolute inset-0" onClick={closeAuthModal} />

      <div className="relative z-10 w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-right overflow-hidden">
        
        {/* توهج خافت في أعلى النافذة */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* زر الإغلاق */}
        <button
          onClick={closeAuthModal}
          className="absolute top-5 left-5 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* محتوى النافذة */}
        <div className="flex flex-col gap-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs font-bold w-fit">
            <Sparkles className="w-3.5 h-3.5" />
            <span>منصة إيه المشكلة وعالـمغرب</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white">
            تسجيل الدخول للمنصة
          </h2>

          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            سجّل دخولك لحفظ فوائدك وملاحظاتك ومزامنتها، ومتابعة الحلقات المفضلة والمستمع إليها عبر جميع أجهزتك.
          </p>

          {errorMsg && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* زر Google الرسمي */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="mt-3 flex items-center justify-center gap-3 w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-zinc-200 text-zinc-950 font-black text-xs sm:text-sm transition-all shadow-lg active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.87c2.26-2.09 3.67-5.17 3.67-9.15z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.87-3.05c-1.08.72-2.45 1.16-4.06 1.16-3.13 0-5.78-2.11-6.73-4.96H1.27v3.15C3.25 21.32 7.31 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.27 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.27C.46 8.23 0 10.06 0 12s.46 3.77 1.27 5.39l4-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.68 1.27 6.61l4 3.15c.95-2.85 3.6-4.96 6.73-4.96z"
                />
              </svg>
            )}
            <span>{loading ? 'جاري الاتصال بـ Google...' : 'المتابعة باستخدام حساب Google'}</span>
          </button>

          <span className="text-[10px] text-zinc-500 text-center mt-1">
            تسجيل الدخول آمن ومشفر تماماً عبر خوادم Supabase
          </span>
        </div>
      </div>
    </div>
  );
}
