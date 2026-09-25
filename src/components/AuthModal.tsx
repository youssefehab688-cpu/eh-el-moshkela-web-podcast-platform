'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { X, Sparkles } from 'lucide-react';

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, signInWithGoogle } = useAuthStore();
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
    } catch (err) {
      console.error('Sign in error:', err);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center gap-5 text-right">
        <button
          onClick={closeAuthModal}
          className="absolute left-4 top-4 text-zinc-400 hover:text-white p-1 rounded-xl hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="h-12 w-12 rounded-2xl bg-zinc-800 border border-zinc-700/80 flex items-center justify-center text-amber-400 mt-2">
          <Sparkles className="w-6 h-6" />
        </div>

        <div className="flex flex-col gap-1.5 text-center">
          <h3 className="text-lg font-black text-white">تسجيل الدخول للمنصة</h3>
          <p className="text-xs text-zinc-400 max-w-xs leading-relaxed">
            سجل دخولك بحساب Google لمزامنة تقدمك في الحلقات، تدوين الفوائد والملاحظات، ومتابعة ساعات الاستماع من أي جهاز.
          </p>
        </div>

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95 disabled:opacity-50"
        >
          {loading ? (
            <div className="h-5 w-5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>المتابعة باستخدام Google</span>
            </>
          )}
        </button>

        <p className="text-[10px] text-zinc-500 text-center">
          بياناتك وملاحظاتك محفوظة ومحمية بأمان على السحابة.
        </p>
      </div>
    </div>
  );
}
