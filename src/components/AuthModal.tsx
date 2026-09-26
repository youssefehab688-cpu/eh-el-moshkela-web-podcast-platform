'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { supabase } from '@/lib/supabase';
import { X, Sparkles, AlertCircle } from 'lucide-react';

declare global {
  interface Window {
    google?: any;
  }
}

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  // استقبال توكن الدخول من Google وإرساله إلى Supabase في الخلفية
  const handleCredentialResponse = useCallback(async (response: any) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: response.credential,
      });

      if (error) {
        setErrorMsg(error.message || 'فشل إتمام تسجيل الدخول');
        setLoading(false);
      } else {
        closeAuthModal();
      }
    } catch (err: any) {
      setErrorMsg('حدث خطأ أثناء الاتصال بالخادم');
      setLoading(false);
    }
  }, [closeAuthModal]);

  // تحميل مكتبة Google الرسمية وتهيئة زر تسجيل الدخول المباشر
  useEffect(() => {
    if (!isAuthModalOpen || !clientId) return;

    const initGoogle = () => {
      if (typeof window !== 'undefined' && window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
        });

        if (googleBtnRef.current) {
          googleBtnRef.current.innerHTML = '';
          window.google.accounts.id.renderButton(googleBtnRef.current, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: 'continue_with',
            shape: 'pill',
            width: 340,
            logo_alignment: 'center',
            locale: 'ar',
          });
        }
      }
    };

    if (typeof window !== 'undefined') {
      if (!window.google?.accounts?.id) {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client?hl=ar';
        script.async = true;
        script.defer = true;
        script.onload = initGoogle;
        document.body.appendChild(script);
      } else {
        initGoogle();
      }
    }
  }, [isAuthModalOpen, clientId, handleCredentialResponse]);

  if (!isAuthModalOpen) return null;

  // خيار احتياطي في حال لم يتم تمرير Client ID في البيئة
  const handleFallbackGoogleSignIn = async () => {
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

          {/* زر Google الرسمي المباشر */}
          <div className="mt-3 flex flex-col items-center justify-center min-h-[48px] w-full">
            {loading ? (
              <div className="flex items-center justify-center gap-2.5 py-3 w-full rounded-2xl bg-zinc-900 text-zinc-300 text-xs font-bold border border-zinc-800">
                <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                <span>جاري إتمام تسجيل الدخول...</span>
              </div>
            ) : clientId ? (
              <div ref={googleBtnRef} className="flex justify-center w-full" />
            ) : (
              <button
                onClick={handleFallbackGoogleSignIn}
                className="flex items-center justify-center gap-3 w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-zinc-200 text-zinc-950 font-black text-xs sm:text-sm transition-all shadow-lg active:scale-95"
              >
                <span>المتابعة باستخدام حساب Google</span>
              </button>
            )}
          </div>

          <span className="text-[10px] text-zinc-500 text-center mt-1">
            تسجيل دخول آمن ومباشر عبر حساب Google الرسمي
          </span>
        </div>
      </div>
    </div>
  );
}
