'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { supabase } from '@/lib/supabase';
import AuthModal from '@/components/AuthModal';
import { User } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const { user, setUser, openAuthModal } = useAuthStore();

  // مزامنة حالة المستخدم المسجل تلقائياً
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [setUser]);

  const navLinks = [
    { name: 'الرئيسية', href: '/' },
    { name: 'المواسم', href: '/#series' },
    { name: 'الاقتباسات', href: '/quotes' },
    { name: 'الملاحظات', href: '/notes' },
    { name: 'المحفوظات', href: '/bookmarks' },
  ];

  return (
    <>
      <header className="fixed top-4 inset-x-0 z-40 flex justify-center px-4 pointer-events-none">
        <nav className="pointer-events-auto flex items-center justify-between gap-4 sm:gap-6 px-4 py-2.5 rounded-full bg-zinc-950/80 border border-zinc-800/80 backdrop-blur-2xl shadow-2xl">
          
          {/* الشعار */}
          <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
            <img
              src="/logo.png"
              alt="بودكاست إيه المشكلة؟"
              className="w-8 h-8 rounded-full object-contain filter brightness-110 group-hover:scale-105 transition-transform"
            />
            <span className="text-xs sm:text-sm font-black text-white tracking-wide hidden min-[400px]:inline">
              إيه المشكلة؟
            </span>
          </Link>

          {/* روابط الموقع */}
          <div className="flex items-center gap-1 sm:gap-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-white text-zinc-950 shadow-sm'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* حساب المستخدم أو زر تسجيل الدخول */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {user ? (
              <Link
                href="/profile"
                className={`flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-1.5 rounded-full border transition-all ${
                  pathname === '/profile'
                    ? 'bg-amber-400 text-zinc-950 border-amber-400 font-bold'
                    : 'bg-zinc-900 text-zinc-200 border-zinc-800 hover:text-white'
                }`}
                title="الملف الشخصي"
              >
                <div className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center text-[10px] font-black border border-amber-400/40">
                  {user.email?.[0].toUpperCase()}
                </div>
                <span className="text-xs hidden md:inline truncate max-w-[80px]">
                  {user.user_metadata?.full_name?.split(' ')[0] || 'حسابي'}
                </span>
              </Link>
            ) : (
              <button
                onClick={openAuthModal}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-xs font-bold text-zinc-200 hover:text-white transition-colors"
              >
                <User className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">تسجيل الدخول</span>
              </button>
            )}
          </div>

        </nav>
      </header>

      {/* المودال موجود ومستدعى هنا ليظهر فور الضغط */}
      <AuthModal />
    </>
  );
}
