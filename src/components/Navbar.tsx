'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import SearchModal from './SearchModal';
import AuthModal from './AuthModal';
import { 
  Radio, Search, Bookmark, BookOpen, 
  User as UserIcon, LogOut, ChevronDown 
} from 'lucide-react';

export default function Navbar() {
  const router = useRouter();
  const { user, openAuthModal, signOut, initAuth } = useAuthStore();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // تشغيل الاستماع التلقائي للجلسة فور تحميل الصفحة
  useEffect(() => {
    const unsubscribe = initAuth();
    return () => unsubscribe();
  }, [initAuth]);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          
          {/* الشعار */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 group-hover:border-zinc-700 transition-colors">
              <Radio className="h-4 w-4 text-slate-200" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black text-white tracking-tight">إيه المشكلة؟</span>
              <span className="text-[10px] text-zinc-400 font-medium">المنصة الصوتية والمرئية</span>
            </div>
          </Link>

          {/* روابط التصفح */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-zinc-300">
            <Link href="/" className="hover:text-white transition-colors">الرئيسية</Link>
            <Link href="/#series" className="hover:text-white transition-colors">المواسم</Link>
            <Link href="/bookmarks" className="hover:text-white transition-colors">المحفوظات</Link>
            <Link href="/notes" className="hover:text-white transition-colors">الملاحظات</Link>
          </nav>

          {/* أزرار الإجراءات */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
              title="بحث في الحلقات"
            >
              <Search className="h-4 w-4" />
            </button>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors"
                >
                  <div className="h-7 w-7 rounded-lg overflow-hidden bg-zinc-800 flex items-center justify-center ring-1 ring-zinc-700">
                    {user.user_metadata?.avatar_url ? (
                      <img src={user.user_metadata.avatar_url} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      <UserIcon className="h-4 w-4 text-zinc-400" />
                    )}
                  </div>
                  <span className="text-xs font-bold text-zinc-200 max-w-[100px] truncate hidden sm:inline">
                    {user.user_metadata?.full_name?.split(' ')[0] || 'حسابي'}
                  </span>
                  <ChevronDown className="h-3 w-3 text-zinc-400" />
                </button>

                {isMenuOpen && (
                  <div className="absolute left-0 mt-2 w-48 rounded-2xl bg-zinc-900 border border-zinc-800 p-1.5 shadow-2xl text-right z-50 animate-in fade-in duration-100">
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
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-bold transition-all shadow-sm active:scale-95"
              >
                <UserIcon className="h-3.5 w-3.5" />
                <span>تسجيل الدخول</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <AuthModal />
    </>
  );
}
