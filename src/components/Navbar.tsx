'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import SearchModal from './SearchModal';
import AuthModal from './AuthModal';
import { 
  Search, Bookmark, BookOpen, 
  User as UserIcon, LogOut, ChevronDown 
} from 'lucide-react';

export default function Navbar() {
  const router = useRouter();
  const { user, openAuthModal, signOut, initAuth } = useAuthStore();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = initAuth();
    return () => unsubscribe();
  }, [initAuth]);

  return (
    <>
      <div className="fixed top-3 sm:top-5 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
        <header className="pointer-events-auto w-full max-w-4xl rounded-full border border-white/10 bg-zinc-950/75 backdrop-blur-2xl shadow-2xl shadow-black/90 px-4 sm:px-6 py-2 flex items-center justify-between transition-all">
          
          {/* الشعار المعتمد */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative h-8 w-8 sm:h-9 sm:w-9 overflow-hidden rounded-full border border-white/10 bg-zinc-900 group-hover:border-amber-400/50 transition-all flex items-center justify-center flex-shrink-0 shadow-inner">
              <img
                src="/logo.png"
                alt="لوجو إيه المشكلة"
                className="h-full w-full object-cover"
              />
            </div>
            <span className="text-xs sm:text-sm font-black text-white tracking-tight">إيه المشكلة؟</span>
          </Link>

          {/* روابط التصفح */}
          <nav className="hidden md:flex items-center gap-1 text-xs font-bold text-zinc-300">
            <Link href="/" className="px-3.5 py-1.5 rounded-full bg-white text-zinc-950 font-black shadow-sm transition-all">
              الرئيسية
            </Link>
            <Link href="/#series" className="px-3 py-1.5 rounded-full hover:text-white hover:bg-white/5 transition-all">
              المواسم
            </Link>
            <Link href="/bookmarks" className="px-3 py-1.5 rounded-full hover:text-white hover:bg-white/5 transition-all">
              المحفوظات
            </Link>
            <Link href="/notes" className="px-3 py-1.5 rounded-full hover:text-white hover:bg-white/5 transition-all">
              الملاحظات
            </Link>
          </nav>

          {/* أزرار الإجراءات */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex h-8 w-8 sm:h-8.5 sm:w-8.5 items-center justify-center rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white transition-all"
              title="بحث في الحلقات"
            >
              <Search className="h-3.5 w-3.5" />
            </button>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center gap-2 pl-2.5 pr-1 py-1 rounded-full bg-white/5 border border-white/10 hover:border-white/20 transition-all"
                >
                  <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-full overflow-hidden bg-zinc-800 flex items-center justify-center ring-1 ring-white/20">
                    {user.user_metadata?.avatar_url ? (
                      <img src={user.user_metadata.avatar_url} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      <UserIcon className="h-3.5 w-3.5 text-zinc-400" />
                    )}
                  </div>
                  <span className="text-xs font-bold text-zinc-200 max-w-[90px] truncate hidden sm:inline">
                    {user.user_metadata?.full_name?.split(' ')[0] || 'حسابي'}
                  </span>
                  <ChevronDown className="h-3 w-3 text-zinc-400" />
                </button>

                {isMenuOpen && (
                  <div className="absolute left-0 mt-2 w-48 rounded-2xl bg-zinc-900 border border-zinc-800 p-1.5 shadow-2xl text-right z-50">
                    <Link
                      href="/profile"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-zinc-200 hover:bg-zinc-800 rounded-xl transition-colors"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-amber-400" />
                      <span>حسابي والتقدم</span>
                    </Link>
                    <Link
                      href="/bookmarks"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-zinc-200 hover:bg-zinc-800 rounded-xl transition-colors"
                    >
                      <Bookmark className="w-3.5 h-3.5 text-slate-300" />
                      <span>المحفوظات</span>
                    </Link>
                    <Link
                      href="/notes"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-zinc-200 hover:bg-zinc-800 rounded-xl transition-colors"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-sky-400" />
                      <span>الملاحظات والفوائد</span>
                    </Link>
                    <div className="h-px bg-zinc-800 my-1" />
                    <button
                      onClick={() => {
                        signOut();
                        setIsMenuOpen(false);
                        router.push('/');
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-400 hover:bg-red-950/40 rounded-xl transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>تسجيل الخروج</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={openAuthModal}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-black transition-all shadow-md active:scale-95"
              >
                <UserIcon className="h-3.5 w-3.5" />
                <span>تسجيل الدخول</span>
              </button>
            )}
          </div>
        </header>
      </div>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <AuthModal />
    </>
  );
}
