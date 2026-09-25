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
      <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-[1720px] items-center justify-between px-4 sm:px-8 lg:px-12">
          
          {/* الشعار المعتمد */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 group-hover:border-zinc-700 transition-all flex items-center justify-center shadow-inner">
              <img
                src="/logo.png"
                alt="لوجو بودكاست إيه المشكلة"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black text-white tracking-tight">إيه المشكلة؟</span>
              <span className="text-[10px] text-zinc-400 font-medium">المنصة الصوتية والمرئية</span>
            </div>
          </Link>

          {/* روابط التصفح */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-zinc-300">
            <Link href="/" className="hover:text-white transition-colors">الرئيسية</Link>
            <Link href="/#series" className="hover:text-white transition-colors">المواسم والسلاسل</Link>
            <Link href="/bookmarks" className="hover:text-white transition-colors">المحفوظات</Link>
            <Link href="/notes" className="hover:text-white transition-colors">الملاحظات</Link>
          </nav>

          {/* أزرار الإجراءات */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
              title="بحث سريع"
            >
              <Search className="h-4 w-4" />
            </button>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center gap-2.5 pl-3 pr-1.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors"
                >
                  <div className="h-7 w-7 rounded-lg overflow-hidden bg-zinc-800 flex items-center justify-center ring-1 ring-zinc-700">
                    {user.user_metadata?.avatar_url ? (
                      <img src={user.user_metadata.avatar_url} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      <UserIcon className="h-4 w-4 text-zinc-400" />
                    )}
                  </div>
                  <span className="text-xs font-bold text-zinc-200 max-w-[120px] truncate hidden sm:inline">
                    {user.user_metadata?.full_name?.split(' ')[0] || 'حسابي'}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
                </button>

                {isMenuOpen && (
                  <div className="absolute left-0 mt-2 w-52 rounded-2xl bg-zinc-900 border border-zinc-800 p-1.5 shadow-2xl text-right z-50">
                    <Link
                      href="/profile"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-zinc-200 hover:bg-zinc-800 rounded-xl transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-amber-400" />
                      <span>حسابي والتقدم الشخصي</span>
                    </Link>
                    <Link
                      href="/bookmarks"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-zinc-200 hover:bg-zinc-800 rounded-xl transition-colors"
                    >
                      <Bookmark className="w-4 h-4 text-slate-300" />
                      <span>المحفوظات</span>
                    </Link>
                    <Link
                      href="/notes"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-zinc-200 hover:bg-zinc-800 rounded-xl transition-colors"
                    >
                      <BookOpen className="w-4 h-4 text-sky-400" />
                      <span>الملاحظات والفوائد</span>
                    </Link>
                    <div className="h-px bg-zinc-800 my-1" />
                    <button
                      onClick={() => {
                        signOut();
                        setIsMenuOpen(false);
                        router.push('/');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-red-400 hover:bg-red-950/40 rounded-xl transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>تسجيل الخروج</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={openAuthModal}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-black transition-all shadow-md active:scale-95"
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
