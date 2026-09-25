'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import { X, Mail, Lock, AlertCircle, CheckCircle, Radio } from 'lucide-react';

function GoogleIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"/>
      <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
    </svg>
  );
}

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal } = useAuthStore();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setErrorMsg(err.message || 'فشل تسجيل الدخول بحساب Google');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setSuccessMsg('تم إنشاء الحساب بنجاح! راجع بريدك الإلكتروني لتأكيد التسجيل إذا تطلب ذلك.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        closeAuthModal();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'حدث خطأ في المصادقة، يرجى التأكد من البيانات');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col gap-6 text-right">
        
        {/* زر الإغلاق */}
        <button
          onClick={closeAuthModal}
          className="absolute top-5 left-5 text-zinc-400 hover:text-white p-1 rounded-xl hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* رأس النافذة */}
        <div className="flex flex-col items-center text-center gap-2 pt-2">
          <div className="h-12 w-12 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center">
            <Radio className="w-6 h-6 text-slate-300" />
          </div>
          <h3 className="text-xl font-black text-white">
            {isSignUp ? 'إنشاء حساب جديد' : 'تسجيل الدخول للمنصة'}
          </h3>
          <p className="text-xs text-zinc-400">
            احفظ ملاحظاتك ومواضع توقف الحلقات لمتابعتها من أي جهاز
          </p>
        </div>

        {/* رسائل التنبيه والخطأ */}
        {errorMsg && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-950/40 border border-red-800/80 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/80 text-xs text-emerald-300">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* زر Google */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white hover:bg-zinc-100 text-zinc-950 text-xs sm:text-sm font-bold shadow-md transition-all active:scale-95 disabled:opacity-50"
        >
          <GoogleIcon className="w-4 h-4" />
          <span>المتابعة باستخدام Google</span>
        </button>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-zinc-800 w-full" />
          <span className="bg-zinc-900 px-3 text-[11px] text-zinc-500 font-semibold absolute">
            أو عبر البريد الإلكتروني
          </span>
        </div>

        {/* استمارة البريد وكلمة المرور */}
        <form onSubmit={handleEmailAuth} className="flex flex-col gap-3">
          <div>
            <label className="block text-[11px] font-bold text-zinc-400 mb-1">
              البريد الإلكتروني
            </label>
            <div className="relative flex items-center">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 pl-9 text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-slate-400 transition-colors"
                dir="ltr"
              />
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-zinc-400 mb-1">
              كلمة المرور
            </label>
            <div className="relative flex items-center">
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 pl-9 text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-slate-400 transition-colors"
                dir="ltr"
              />
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3 pointer-events-none" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs sm:text-sm font-bold shadow transition-all active:scale-95 disabled:opacity-50 mt-1"
          >
            {loading ? 'جاري التحميل...' : isSignUp ? 'إنشاء الحساب' : 'تسجيل الدخول'}
          </button>
        </form>

        {/* التبديل بين الدخول وإنشاء حساب */}
        <div className="text-center text-xs text-zinc-400 pt-1">
          {isSignUp ? (
            <span>
              لديك حساب بالفعل؟{' '}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(false);
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="text-white font-bold underline underline-offset-4 hover:text-slate-300"
              >
                سجّل دخولك الآن
              </button>
            </span>
          ) : (
            <span>
              ليس لديك حساب بعد؟{' '}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(true);
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="text-white font-bold underline underline-offset-4 hover:text-slate-300"
              >
                أنشئ حساباً مجانياً
              </button>
            </span>
          )}
        </div>

      </div>
    </div>
  );
}
