'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { supabase } from '@/lib/supabase';
import AuthModal from '@/components/AuthModal';
import { User, WifiOff, ChevronDown } from 'lucide-react';

interface NavLinkItem {
  name: string;
  href: string;
  count?: number;
}

export default function Navbar() {
  const pathname = usePathname();
  const { user, setUser, openAuthModal } = useAuthStore();

  const [notesCount, setNotesCount] = useState(0);
  const [bookmarksCount, setBookmarksCount] = useState(0);
  const [isOffline, setIsOffline] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const refreshCounts = () => {
    try {
      const bMarks = JSON.parse(localStorage.getItem('eh_el_moshkla_bookmarks') || '[]');
      setBookmarksCount(Array.isArray(bMarks) ? bMarks.length : 0);

      const allNotes = JSON.parse(localStorage.getItem('eh_el_moshkla_notes') || '[]');
      setNotesCount(Array.isArray(allNotes) ? allNotes.length : 0);
    } catch (e) {}
  };

  useEffect(() => {
    refreshCounts();

    if (typeof window !== 'undefined') {
      setIsOffline(!navigator.onLine);

      const handleOnline = () => setIsOffline(false);
      const handleOffline = () => setIsOffline(true);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  useEffect(() => {
    window.addEventListener('storage', refreshCounts);
    window.addEventListener('app_storage_updated', refreshCounts);

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      window.removeEventListener('storage', refreshCounts);
      window.removeEventListener('app_storage_updated', refreshCounts);
      subscription.unsubscribe();
    };
  }, [setUser]);

  useEffect(() => {
    setIsMoreOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleScrollToTop = (e: React.MouseEvent) => {
    if (pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const primaryLinks: NavLinkItem[] = [
    { name: 'الرئيسية', href: '/' },
    { name: 'المواسم', href: '/#series' },
  ];

  const secondaryLinks: NavLinkItem[] = [
    { name: 'الاقتباسات', href: '/quotes' },
    { name: 'الملاحظات', href: '/notes', count: notesCount },
    { name: 'المحفوظات', href: '/bookmarks', count: bookmarksCount },
  ];

  const allNavLinks: NavLinkItem[] = [...primaryLinks, ...secondaryLinks];
  const totalSecondaryCount = notesCount + bookmarksCount;
  const isSecondaryActive = secondaryLinks.some((l) => pathname === l.href);

  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;

  return (
    <>
      {isOffline && (
        <div className="fixed top-0 inset-x-0 z-50 bg-amber-500/90 text-zinc-950 px-4 py-1.5 text-center text-xs font-bold backdrop-blur-md flex items-center justify-center gap-2 shadow-lg animate-card-fade">
          <WifiOff className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>أنت تتصفح في وضع عدم الاتصال — يتم عرض المحفوظات والملاحظات المخزنة محلياً</span>
        </div>
      )}

      <header className={`fixed ${isOffline ? 'top-10' : 'top-3 sm:top-4'} inset-x-0 z-40 flex justify-center px-2 sm:px-4 pointer-events-none transition-all duration-300`}>
        <nav className="pointer-events-auto flex items-center justify-between gap-1.5 sm:gap-3 md:gap-6 px-2.5 sm:px-4 py-1.5 sm:py-2.5 rounded-full bg-zinc-950/85 border border-zinc-800/80 backdrop-blur-2xl shadow-2xl max-w-[96vw] sm:max-w-fit">
          
          <Link 
            href="/" 
            onClick={handleScrollToTop}
            className="flex items-center gap-1.5 sm:gap-2 group flex-shrink-0 cursor-pointer"
          >
            <img
              src="/logo.png"
              alt="بودكاست إيه المشكلة؟"
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-contain filter brightness-110 group-hover:scale-105 transition-transform"
            />
            <span className="text-xs sm:text-sm font-black text-white tracking-wide hidden min-[540px]:inline">
              إيه المشكلة؟
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-1 sm:gap-1.5">
            {allNavLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={link.href === '/' ? handleScrollToTop : undefined}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-white text-zinc-950 shadow-sm'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
                  }`}
                >
                  <span>{link.name}</span>
                  {typeof link.count === 'number' && link.count > 0 && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                        isActive ? 'bg-zinc-950 text-white' : 'bg-amber-400/20 text-amber-400 border border-amber-400/30'
                      }`}
                    >
                      {link.count}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          <div className="flex lg:hidden items-center gap-1" ref={dropdownRef}>
            {primaryLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={link.href === '/' ? handleScrollToTop : undefined}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-white text-zinc-950 shadow-sm'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}

            <div className="relative">
              <button
                onClick={() => setIsMoreOpen(!isMoreOpen)}
                className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  isSecondaryActive || isMoreOpen
                    ? 'bg-zinc-800 text-white border border-zinc-700'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
                }`}
              >
                <span>المزيد</span>
                {totalSecondaryCount > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                )}
                <ChevronDown className={`w-3 h-3 transition-transform ${isMoreOpen ? 'rotate-180 text-amber-400' : ''}`} />
              </button>

              {isMoreOpen && (
                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-zinc-950/95 border border-zinc-800/90 rounded-2xl p-1.5 shadow-2xl backdrop-blur-2xl min-w-[155px] flex flex-col gap-1 z-50 text-right animate-card-fade">
                  {secondaryLinks.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                      <Link
                        key={link.name}
                        href={link.href}
                        onClick={() => setIsMoreOpen(false)}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                          isActive
                            ? 'bg-white text-zinc-950 shadow-sm'
                            : 'text-zinc-300 hover:text-white hover:bg-zinc-900'
                        }`}
                      >
                        <span>{link.name}</span>
                        {typeof link.count === 'number' && link.count > 0 && (
                          <span
                            className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                              isActive
                                ? 'bg-zinc-950 text-white'
                                : 'bg-amber-400/20 text-amber-400 border border-amber-400/30'
                            }`}
                          >
                            {link.count}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {user ? (
              <Link
                href="/profile"
                className={`flex items-center gap-1.5 p-1 sm:px-2.5 sm:py-1 rounded-full border transition-all flex-shrink-0 ${
                  pathname === '/profile'
                    ? 'bg-amber-400 text-zinc-950 border-amber-400 font-bold'
                    : 'bg-zinc-900 text-zinc-200 border-zinc-800 hover:text-white'
                }`}
                title="الملف الشخصي"
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="w-6 h-6 rounded-full object-cover border border-amber-400/40"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center text-[10px] font-black border border-amber-400/40">
                    {user.email?.[0].toUpperCase()}
                  </div>
                )}
                <span className="text-xs hidden md:inline truncate max-w-[70px]">
                  {user.user_metadata?.full_name?.split(' ')[0] || 'حسابي'}
                </span>
              </Link>
            ) : (
              <button
                onClick={openAuthModal}
                className="flex items-center justify-center gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-xs font-bold text-zinc-200 hover:text-white transition-colors flex-shrink-0 active:scale-95"
                title="تسجيل الدخول"
              >
                <User className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden min-[480px]:inline">تسجيل الدخول</span>
              </button>
            )}
          </div>

        </nav>
      </header>

      <AuthModal />
    </>
  );
}
