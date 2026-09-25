'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { 
  Bookmark, BookOpen, Quote, 
  User, Sparkles 
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const { user, openAuthModal } = useAuthStore();

  const navLinks = [
    { name: 'الرئيسية', href: '/' },
    { name: 'المواسم', href: '/#series' },
    { name: 'الاقتباسات', href: '/quotes' },
    { name: 'الملاحظات', href: '/notes' },
    { name: 'المحفوظات', href: '/bookmarks' },
  ];

  return (
    <header className="fixed top-4 inset-x-0 z-40 flex justify-center px-4 pointer-events-none">
      <nav className="pointer-events-auto flex items-center justify-between gap-4 sm:gap-6 px-4 py-2.5 rounded-full bg-zinc-950/80 border border-zinc-800/80 backdrop-blur-2xl shadow-2xl">
        
        {/* اللوجو الرسمي لبودكاست إيه المشكلة */}
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

        {/* الروابط الأساسية */}
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

        {/* حساب المستخدم */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {user ? (
            <Link
              href="/profile"
              className={`p-2 rounded-full border transition-all ${
                pathname === '/profile'
                  ? 'bg-amber-400 text-zinc-950 border-amber-400'
                  : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:text-white'
              }`}
              title="الملف الشخصي"
            >
              <User className="w-4 h-4" />
            </Link>
          ) : (
            <button
              onClick={openAuthModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-xs font-bold text-zinc-200 transition-colors"
            >
              <User className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">تسجيل الدخول</span>
            </button>
          )}
        </div>

      </nav>
    </header>
  );
}
