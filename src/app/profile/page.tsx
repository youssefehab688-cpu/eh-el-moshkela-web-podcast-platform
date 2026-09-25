'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Player from '@/components/Player';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import { User, BookOpen, Bookmark, Headphones, Sparkles, Clock, CheckCircle } from 'lucide-react';

export default function ProfilePage() {
  const { user, openAuthModal, signOut } = useAuthStore();
  const [notesCount, setNotesCount] = useState(0);
  const [bookmarksCount, setBookmarksCount] = useState(0);
  const [lastListened, setLastListened] = useState<any>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('eh_el_moshkla_last_played');
      if (saved) setLastListened(JSON.parse(saved));
    } catch (e) {}

    async function loadStats() {
      if (!user) return;
      const { count: nC } = await supabase.from('notes').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
      const { count: bC } = await supabase.from('bookmarks').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
      if (nC !== null) setNotesCount(nC);
      if (bC !== null) setBookmarksCount(bC);
    }

    loadStats();
  }, [user]);

  return (
    <main className="min-h-screen bg-[#07080b] text-zinc-100 flex flex-col pb-36 selection:bg-amber-400 selection:text-zinc-950">
      <Navbar />

      <section className="mx-auto w-full max-w-4xl px-4 sm:px-8 pt-24">
        {!user ? (
          <div className="py-24 flex flex-col items-center justify-center text-center gap-4">
            <User className="w-12 h-12 text-zinc-600" />
            <h2 className="text-xl font-bold text-white">سجّل دخولك لمتابعة إحصائياتك</h2>
            <p className="text-xs text-zinc-400 max-w-sm">
              يمكنك ربط حسابك لحفظ فوائدك ومحفوظاتك ومتابعة تقدمك عبر الأجهزة المختلفة.
            </p>
            <button
              onClick={openAuthModal}
              className="px-6 py-2.5 rounded-full bg-white text-zinc-950 font-black text-xs hover:bg-zinc-200 transition-all shadow"
            >
              تسجيل الدخول بحساب Google
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {/* بطاقة المستخدم */}
            <div className="p-6 rounded-3xl bg-zinc-900/50 border border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 text-xl font-black">
                  {user.email?.[0].toUpperCase()}
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-base font-black text-white">{user.user_metadata?.full_name || 'مستمع المنصة'}</span>
                  <span className="text-xs text-zinc-400 font-mono">{user.email}</span>
                </div>
              </div>

              <button
                onClick={signOut}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-red-950/40 text-xs font-bold text-zinc-400 hover:text-red-400 transition-colors border border-zinc-700/60"
              >
                تسجيل الخروج
              </button>
            </div>

            {/* الإحصائيات */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-3xl bg-zinc-900/30 border border-zinc-800/80 flex flex-col gap-2 text-right">
                <div className="flex items-center justify-between text-amber-400">
                  <span className="text-xs font-bold">الفوائد المدونة</span>
                  <BookOpen className="w-4 h-4" />
                </div>
                <span className="text-2xl font-black text-white font-mono">{notesCount}</span>
                <span className="text-[11px] text-zinc-500">فائدة مسجلة بحسابك</span>
              </div>

              <div className="p-5 rounded-3xl bg-zinc-900/30 border border-zinc-800/80 flex flex-col gap-2 text-right">
                <div className="flex items-center justify-between text-sky-400">
                  <span className="text-xs font-bold">الحلقات المحفوظة</span>
                  <Bookmark className="w-4 h-4" />
                </div>
                <span className="text-2xl font-black text-white font-mono">{bookmarksCount}</span>
                <span className="text-[11px] text-zinc-500">حلقة في قائمتك المفضلة</span>
              </div>

              <div className="p-5 rounded-3xl bg-zinc-900/30 border border-zinc-800/80 flex flex-col gap-2 text-right">
                <div className="flex items-center justify-between text-emerald-400">
                  <span className="text-xs font-bold">المواسم المتوفرة</span>
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="text-2xl font-black text-white font-mono">6 + 3</span>
                <span className="text-[11px] text-zinc-500">إيه المشكلة + عالـمغرب</span>
              </div>
            </div>

            {/* آخر حلقة تم الاستماع إليها */}
            {lastListened?.episode && (
              <div className="p-5 rounded-3xl bg-zinc-900/30 border border-zinc-800/80 flex flex-col gap-2 text-right">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                  <Clock className="w-4 h-4" />
                  <span>آخر نشاط استماع</span>
                </div>
                <h4 className="text-sm font-black text-white mt-1">{lastListened.episode.title}</h4>
                <span className="text-[11px] text-zinc-400 font-mono">
                  توقفت عند الدقيقة {Math.floor(lastListened.currentTime / 60)}:{Math.floor(lastListened.currentTime % 60)}
                </span>
              </div>
            )}
          </div>
        )}
      </section>

      <Player />
    </main>
  );
}
