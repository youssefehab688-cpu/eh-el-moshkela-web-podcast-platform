'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { useBookmarkStore } from '@/store/useBookmarkStore';
import AuthModal from '@/components/AuthModal';
import { Radio, User as UserIcon, LogOut, Bookmark } from 'lucide-react';

export default function Navbar() {
  const { user, openAuthModal, signOut, initAuth } = useAuthStore();
  const { bookmarkedIds, loadBookmarks } = useBookmarkStore();

  useEffect(() => {
    const unsubscribe = initAuth();
    loadBookmarks();
    return () => unsubscribe();
  }, [initAuth, loadBookmarks]);

  return (
    <>
      <nav className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          
          {/* الجانب الأيمن: الشعار والروابط */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="h-9 w-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:border-slate-500 transition-colors">
                <Radio className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-sm text-white group-hover:text-slate-200 transition-colors">
                  إيه المشكلة؟
                </span>
                <span className="text-[10px] text-zinc-400 font-medium">
                  المنصة الصوتية والمرئية
                </span>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-5 text-xs font-semibold text-zinc-400">
              <Link href="/" className="hover:text-white transition-colors">
                الرئيسية
              </Link>
              <Link href="/#series" className="hover:text-white transition-colors">
                المواسم
              </Link>
              <Link 
                href="/saved" 
                className="hover:text-white transition-colors flex items-center gap-1.5"
              >
                <span>المحفوظات</span>
                {bookmarkedIds.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-zinc-950 font-black text-[10px]">
                    {bookmarkedIds.length}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* الجانب الأيسر: زر الحساب / الدخول */}
          <div className="flex items-center gap-3">
            <Link
              href="/saved"
              className="md:hidden flex items-center justify-center p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 relative"
              title="المحفوظات"
            >
              <Bookmark className="w-4 h-4" />
              {bookmarkedIds.length > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-amber-400 text-zinc-950 text-[10px] font-black flex items-center justify-center">
                  {bookmarkedIds.length}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center gap-3 bg-zinc-900/80 border border-zinc-800 px-3 py-1.5 rounded-full">
                <div className="h-7 w-7 rounded-full overflow-hidden bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                  {user.user_metadata?.avatar_url ? (
                    <img
                      src={user.user_metadata.avatar_url}
                      alt="User avatar"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <UserIcon className="w-4 h-4 text-zinc-300" />
                  )}
                </div>
                <span className="text-xs font-bold text-white max-w-[120px] truncate">
                  {user.user_metadata?.full_name || user.email?.split('@')[0]}
                </span>
                <button
                  onClick={signOut}
                  title="تسجيل الخروج"
                  className="text-zinc-400 hover:text-red-400 transition-colors p-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={openAuthModal}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-bold shadow-sm transition-all hover:scale-105 active:scale-95"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>تسجيل الدخول</span>
              </button>
            )}
          </div>

        </div>
      </nav>

      <AuthModal />
    </>
  );
}
