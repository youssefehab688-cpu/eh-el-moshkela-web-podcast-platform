'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Player from '@/components/Player';
import { supabase } from '@/lib/supabase';
import { Episode } from '@/types';
import { useAuthStore } from '@/store/useAuthStore';
import { usePlayerStore } from '@/store/usePlayerStore';
import { 
  Play, Pause, RotateCcw, RotateCw, Volume2, VolumeX, 
  Headphones, Video, ArrowRight, Bookmark, BookmarkCheck,
  Share2, Check, Clock, Plus, Trash2, FileText,
  Maximize2, Minimize2, Cloud, Moon
} from 'lucide-react';

export default function EpisodeDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const rawSlug = params?.slug as string;
  const initialTimeParam = searchParams?.get('t');

  const [episode, setEpisode] = useState<Episode | null>(null);
  const [loading, setLoading] = useState(true);

  // وضع العرض: video | audio
  const [mediaMode, setMediaMode] = useState<'video' | 'audio'>('video');

  // وضع التركيز السينمائي
  const [isFocusMode, setIsFocusMode] = useState(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  // مؤقت النوم (Sleep Timer)
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null);
  const [sleepTimerTimeLeft, setSleepTimerTimeLeft] = useState<number | null>(null);
  const sleepTimerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [stopAtEndOfVideo, setStopAtEndOfVideo] = useState(false);
  const [showSleepMenu, setShowSleepMenu] = useState(false);

  // الملاحظات والمحفوظات السحابية والمحلية
  const [notes, setNotes] = useState<{ id: string; timestamp: number; content: string }[]>([]);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [isSavingCloud, setIsSavingCloud] = useState(false);

  const playerRef = useRef<any>(null);
  const timeUpdateInterval = useRef<NodeJS.Timeout | null>(null);

  const { user } = useAuthStore();
  const { currentEpisode } = usePlayerStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFocusMode) {
        setIsFocusMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFocusMode]);

  useEffect(() => {
    async function loadEpisode() {
      if (!rawSlug) return;
      setLoading(true);

      const decoded = decodeURIComponent(rawSlug).trim();

      try {
        let matchedEpisode: Episode | null = null;

        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(decoded);
        if (isUuid) {
          const { data } = await supabase.from('episodes').select('*').eq('id', decoded).maybeSingle();
          if (data) matchedEpisode = data;
        }

        if (!matchedEpisode && decoded.length === 11) {
          const { data } = await supabase.from('episodes').select('*').eq('youtube_video_id', decoded).maybeSingle();
          if (data) matchedEpisode = data;
        }

        if (!matchedEpisode) {
          const { data } = await supabase.from('episodes').select('*').eq('slug', decoded).maybeSingle();
          if (data) matchedEpisode = data;
        }

        if (!matchedEpisode && /^\d+$/.test(decoded)) {
          const { data } = await supabase.from('episodes').select('*').eq('id', decoded).maybeSingle();
          if (data) matchedEpisode = data;
        }

        if (!matchedEpisode) {
          const { data } = await supabase.from('episodes').select('*').ilike('youtube_video_id', `%${decoded}%`).maybeSingle();
          if (data) matchedEpisode = data;
        }

        setEpisode(matchedEpisode);
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadEpisode();
  }, [rawSlug]);

  // جلب الملاحظات والمحفوظات بطريقة آمنة لـ TypeScript
  useEffect(() => {
    if (!episode) return;
    const currentEp = episode; // تثبيت النوع ومنع TS18047

    async function syncNotesAndBookmarks() {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('notes')
            .select('*')
            .eq('episode_id', currentEp.id)
            .eq('user_id', user.id)
            .order('timestamp_seconds', { ascending: true });

          if (data && !error && data.length > 0) {
            const formatted = data.map((n: any) => ({
              id: n.id,
              timestamp: n.timestamp_seconds ?? n.timestamp ?? 0,
              content: n.note_text ?? n.content ?? '',
            }));
            setNotes(formatted);
          } else {
            const savedNotes = JSON.parse(localStorage.getItem(`notes_${currentEp.id}`) || '[]');
            setNotes(savedNotes);
          }
        } catch (e) {
          const savedNotes = JSON.parse(localStorage.getItem(`notes_${currentEp.id}`) || '[]');
          setNotes(savedNotes);
        }
      } else {
        const savedNotes = JSON.parse(localStorage.getItem(`notes_${currentEp.id}`) || '[]');
        setNotes(savedNotes);
      }

      if (user) {
        try {
          const { data } = await supabase
            .from('bookmarks')
            .select('*')
            .eq('episode_id', currentEp.id)
            .eq('user_id', user.id)
            .maybeSingle();

          if (data) {
            setIsBookmarked(true);
            return;
          }
        } catch (e) {}
      }

      const bMarks: string[] = JSON.parse(localStorage.getItem('eh_el_moshkla_bookmarks') || '[]');
      setIsBookmarked(bMarks.includes(currentEp.id));
    }

    syncNotesAndBookmarks();
  }, [episode, user]);

  useEffect(() => {
    if (!episode?.youtube_video_id || typeof window === 'undefined') return;
    const videoId = episode.youtube_video_id;

    let seekTarget = 0;
    if (initialTimeParam) {
      seekTarget = parseInt(initialTimeParam, 10) || 0;
    } else {
      const stored = localStorage.getItem('eh_el_moshkla_seek_target');
      if (stored) {
        seekTarget = parseInt(stored, 10) || 0;
        localStorage.removeItem('eh_el_moshkla_seek_target');
      }
    }

    const initPagePlayer = () => {
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch (e) {}
      }

      if ((window as any).YT && (window as any).YT.Player) {
        playerRef.current = new (window as any).YT.Player('episode-main-player', {
          videoId,
          playerVars: {
            autoplay: 1,
            controls: 1,
            disablekb: 0,
            enablejsapi: 1,
            modestbranding: 1,
            rel: 0,
            start: seekTarget,
          },
          events: {
            onReady: (event: any) => {
              setDuration(event.target.getDuration());
              if (seekTarget > 0) {
                event.target.seekTo(seekTarget, true);
              }
              setIsPlaying(true);
            },
            onStateChange: (event: any) => {
              if (event.data === 1) {
                setIsPlaying(true);
                startTimeTracking();
              } else if (event.data === 2) {
                setIsPlaying(false);
                stopTimeTracking();
              } else if (event.data === 0) {
                if (stopAtEndOfVideo) {
                  setIsPlaying(false);
                  stopTimeTracking();
                  setSleepTimerMinutes(null);
                  setStopAtEndOfVideo(false);
                }
              }
            },
          },
        });
      }
    };

    if ((window as any).YT && (window as any).YT.Player) {
      initPagePlayer();
    } else {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
      (window as any).onYouTubeIframeAPIReady = initPagePlayer;
    }

    return () => {
      stopTimeTracking();
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch (e) {}
      }
    };
  }, [episode?.youtube_video_id, initialTimeParam, stopAtEndOfVideo]);

  const startTimeTracking = () => {
    stopTimeTracking();
    timeUpdateInterval.current = setInterval(() => {
      if (playerRef.current?.getCurrentTime) {
        setCurrentTime(playerRef.current.getCurrentTime());
      }
    }, 1000);
  };

  const stopTimeTracking = () => {
    if (timeUpdateInterval.current) {
      clearInterval(timeUpdateInterval.current);
    }
  };

  const togglePlay = () => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  const seekRelative = (seconds: number) => {
    if (!playerRef.current) return;
    const newT = Math.max(0, Math.min(currentTime + seconds, duration));
    playerRef.current.seekTo(newT, true);
    setCurrentTime(newT);
  };

  const seekToExact = (seconds: number) => {
    if (!playerRef.current) return;
    playerRef.current.seekTo(seconds, true);
    setCurrentTime(seconds);
    if (!isPlaying) playerRef.current.playVideo();
  };

  const toggleMute = () => {
    if (!playerRef.current) return;
    if (isMuted) {
      playerRef.current.unMute();
      setIsMuted(false);
    } else {
      playerRef.current.mute();
      setIsMuted(true);
    }
  };

  const cycleSpeed = () => {
    const rates = [1, 1.25, 1.5, 1.75, 2];
    const nextR = rates[(rates.indexOf(playbackRate) + 1) % rates.length];
    if (playerRef.current?.setPlaybackRate) {
      playerRef.current.setPlaybackRate(nextR);
      setPlaybackRate(nextR);
    }
  };

  const setTimer = (mins: number | 'end' | null) => {
    if (sleepTimerIntervalRef.current) clearInterval(sleepTimerIntervalRef.current);
    setShowSleepMenu(false);

    if (mins === null) {
      setSleepTimerMinutes(null);
      setSleepTimerTimeLeft(null);
      setStopAtEndOfVideo(false);
      return;
    }

    if (mins === 'end') {
      setStopAtEndOfVideo(true);
      setSleepTimerMinutes(null);
      setSleepTimerTimeLeft(null);
    } else {
      setStopAtEndOfVideo(false);
      setSleepTimerMinutes(mins);
      const seconds = mins * 60;
      setSleepTimerTimeLeft(seconds);

      sleepTimerIntervalRef.current = setInterval(() => {
        setSleepTimerTimeLeft((prev) => {
          if (prev === null) return null;
          if (prev <= 1) {
            if (playerRef.current) {
              playerRef.current.pauseVideo();
              setIsPlaying(false);
            }
            if (sleepTimerIntervalRef.current) clearInterval(sleepTimerIntervalRef.current);
            setSleepTimerMinutes(null);
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const toggleBookmark = async () => {
    if (!episode) return;
    const currentEp = episode;
    const nextState = !isBookmarked;
    setIsBookmarked(nextState);

    try {
      const bMarks: string[] = JSON.parse(localStorage.getItem('eh_el_moshkla_bookmarks') || '[]');
      const updated = nextState ? [...bMarks, currentEp.id] : bMarks.filter((id) => id !== currentEp.id);
      localStorage.setItem('eh_el_moshkla_bookmarks', JSON.stringify(updated));
    } catch (e) {}

    if (user) {
      try {
        if (nextState) {
          await supabase.from('bookmarks').upsert({ user_id: user.id, episode_id: currentEp.id });
        } else {
          await supabase.from('bookmarks').delete().eq('user_id', user.id).eq('episode_id', currentEp.id);
        }
      } catch (err) {
        console.error('Cloud bookmark error:', err);
      }
    }
  };

  const handleShare = () => {
    if (typeof window === 'undefined') return;
    const shareUrl = `${window.location.origin}/episodes/${rawSlug}?t=${Math.floor(currentTime)}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim() || !episode) return;
    const currentEp = episode;

    const noteText = newNoteContent.trim();
    const seekTime = Math.floor(currentTime);
    const tempId = Date.now().toString();

    const newNote = {
      id: tempId,
      timestamp: seekTime,
      content: noteText,
    };

    setNotes((prev) => [newNote, ...prev]);
    setNewNoteContent('');

    try {
      const currentLocal = JSON.parse(localStorage.getItem(`notes_${currentEp.id}`) || '[]');
      localStorage.setItem(`notes_${currentEp.id}`, JSON.stringify([newNote, ...currentLocal]));
    } catch (e) {}

    if (user) {
      setIsSavingCloud(true);
      try {
        const { data, error } = await supabase
          .from('notes')
          .insert({
            user_id: user.id,
            episode_id: currentEp.id,
            timestamp_seconds: seekTime,
            note_text: noteText,
          })
          .select()
          .single();

        if (data && !error) {
          setNotes((prev) => prev.map((n) => (n.id === tempId ? { ...n, id: data.id } : n)));
        }
      } catch (err) {
        console.error('Cloud note error:', err);
      } finally {
        setIsSavingCloud(false);
      }
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (!episode) return;
    const currentEp = episode;

    setNotes((prev) => prev.filter((n) => n.id !== id));

    try {
      const currentLocal = JSON.parse(localStorage.getItem(`notes_${currentEp.id}`) || '[]');
      localStorage.setItem(`notes_${currentEp.id}`, JSON.stringify(currentLocal.filter((n: any) => n.id !== id)));
    } catch (e) {}

    if (user) {
      try {
        await supabase.from('notes').delete().eq('id', id);
      } catch (err) {
        console.error('Cloud delete error:', err);
      }
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const formatTimerLeft = (secs: number | null) => {
    if (secs === null) return '';
    const m = Math.ceil(secs / 60);
    return `${m} د`;
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#07080b] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-400" />
      </main>
    );
  }

  if (!episode) {
    return (
      <main className="min-h-screen bg-[#07080b] text-zinc-100 flex flex-col items-center justify-center p-6 text-center gap-4">
        <h2 className="text-xl font-bold">الحلقة غير موجودة</h2>
        <p className="text-xs text-zinc-400">تأكد من صحة الرابط أو تصفح الحلقات من الصفحة الرئيسية.</p>
        <Link href="/" className="px-5 py-2.5 rounded-full bg-amber-400 text-zinc-950 font-bold text-xs">
          العودة للرئيسية
        </Link>
      </main>
    );
  }

  const timerActive = sleepTimerMinutes !== null || stopAtEndOfVideo;

  return (
    <main className="min-h-screen bg-[#07080b] text-zinc-100 flex flex-col pb-36 selection:bg-amber-400 selection:text-zinc-950">
      <Navbar />

      {isFocusMode && (
        <div
          onClick={() => setIsFocusMode(false)}
          className="fixed inset-0 z-40 bg-black/90 backdrop-blur-md transition-opacity duration-300 animate-card-fade"
        />
      )}

      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 pt-24 space-y-5">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة للحلقات</span>
          </Link>

          <span className="text-xs px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-amber-400 font-bold font-mono">
            {episode.program === 'ala-el-maghreb' ? 'عالـمغرب' : 'إيه المشكلة؟'} • الموسم {episode.season}
          </span>
        </div>

        <div
          className={`transition-all duration-300 overflow-hidden shadow-2xl ${
            isFocusMode
              ? 'fixed inset-x-4 sm:inset-x-8 md:inset-x-16 top-1/2 -translate-y-1/2 z-50 max-w-5xl mx-auto bg-zinc-950 border border-amber-400/50 rounded-3xl ring-1 ring-amber-400/20'
              : 'bg-zinc-950 border border-zinc-800/80 rounded-3xl relative'
          }`}
        >
          <div className="w-full aspect-video bg-black relative overflow-hidden">
            <div
              id="episode-main-player"
              className={`w-full h-full ${mediaMode === 'audio' ? 'opacity-0 pointer-events-none absolute inset-0' : ''}`}
            />

            {mediaMode === 'audio' && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 bg-black text-center gap-4">
                <img
                  src={`https://img.youtube.com/vi/${episode.youtube_video_id}/hqdefault.jpg`}
                  alt={episode.title}
                  className="absolute inset-0 w-full h-full object-cover filter blur-3xl opacity-20 scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/50" />

                <div className="relative z-20 flex flex-col items-center gap-3">
                  <div className="relative">
                    {isPlaying && (
                      <div className="absolute -inset-2 bg-amber-400/20 blur-md rounded-2xl animate-pulse" />
                    )}
                    <img
                      src={`https://img.youtube.com/vi/${episode.youtube_video_id}/hqdefault.jpg`}
                      alt={episode.title}
                      className="relative w-40 sm:w-52 aspect-video object-cover rounded-xl border border-zinc-700 shadow-xl"
                    />
                  </div>

                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <Headphones className="w-3.5 h-3.5" />
                    وضع الاستماع الصوتي
                  </span>

                  <h3 className="text-sm sm:text-base font-black text-white line-clamp-1 max-w-md">
                    {episode.title}
                  </h3>
                </div>

                <div className="relative z-20 w-full max-w-sm flex items-center justify-center gap-4 pt-2">
                  <button onClick={() => seekRelative(-15)} className="text-zinc-400 hover:text-white p-1">
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={togglePlay}
                    className="w-10 h-10 rounded-full bg-white text-zinc-950 flex items-center justify-center shadow-md active:scale-95"
                  >
                    {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                  </button>
                  <button onClick={() => seekRelative(15)} className="text-zinc-400 hover:text-white p-1">
                    <RotateCw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="p-3 sm:p-4 bg-zinc-900/60 border-t border-zinc-800 flex items-center justify-between gap-3">
            <button
              onClick={() => setMediaMode(mediaMode === 'video' ? 'audio' : 'video')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-800/90 hover:bg-zinc-700 text-zinc-200 hover:text-white text-xs font-bold transition-all border border-zinc-700 active:scale-95"
            >
              {mediaMode === 'video' ? (
                <>
                  <Headphones className="w-3.5 h-3.5 text-amber-400" />
                  <span>تحويل لصوت</span>
                </>
              ) : (
                <>
                  <Video className="w-3.5 h-3.5 text-sky-400" />
                  <span>عرض الفيديو</span>
                </>
              )}
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsFocusMode(!isFocusMode)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all active:scale-95 ${
                  isFocusMode
                    ? 'bg-amber-400 text-zinc-950 border-amber-400 shadow-md font-black'
                    : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:text-white hover:border-zinc-700'
                }`}
                title={isFocusMode ? 'الخروج من وضع التركيز (Esc)' : 'تفعيل وضع التركيز'}
              >
                {isFocusMode ? (
                  <>
                    <Minimize2 className="w-3.5 h-3.5 text-zinc-950 stroke-[2.5]" />
                    <span>إنهاء التركيز</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>وضع التركيز</span>
                  </>
                )}
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowSleepMenu(!showSleepMenu)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                    timerActive ? 'bg-amber-400/20 text-amber-400 border-amber-400/40' : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:text-white'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" />
                  {timerActive && stopAtEndOfVideo && <span className="text-[10px] font-bold">🔚</span>}
                  {timerActive && sleepTimerTimeLeft !== null ? (
                    <span className="font-mono text-amber-300">{formatTimerLeft(sleepTimerTimeLeft)}</span>
                  ) : (
                    <span className="hidden sm:inline">مؤقت</span>
                  )}
                </button>

                {showSleepMenu && (
                  <div className="absolute bottom-full mb-2 left-0 bg-zinc-900 border border-zinc-800 rounded-2xl p-2 shadow-2xl flex flex-col gap-1 z-50 min-w-[140px] text-right animate-card-fade">
                    <span className="text-[10px] text-zinc-500 font-bold px-2 py-1">مؤقت النوم</span>
                    {[15, 30, 45, 60].map((mins) => (
                      <button
                        key={mins}
                        onClick={() => setTimer(mins)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold text-right transition-colors ${
                          sleepTimerMinutes === mins ? 'bg-amber-400 text-zinc-950' : 'text-zinc-300 hover:bg-zinc-800'
                        }`}
                      >
                        بعد {mins} دقيقة
                      </button>
                    ))}
                    <button
                      onClick={() => setTimer('end')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold text-right transition-colors ${
                        stopAtEndOfVideo ? 'bg-amber-400 text-zinc-950' : 'text-zinc-300 hover:bg-zinc-800'
                      }`}
                    >
                      لنهاية الفيديو 🔚
                    </button>
                    {timerActive && (
                      <button
                        onClick={() => setTimer(null)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold text-red-400 hover:bg-red-950/30 text-right mt-1 border-t border-zinc-800 pt-2"
                      >
                        إلغاء المؤقت
                      </button>
                    )}
                  </div>
                )}
              </div>

              <button
                onClick={handleShare}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-bold text-zinc-300 hover:text-white transition-all active:scale-95"
              >
                {copiedShare ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copiedShare ? 'تم النسخ!' : 'مشاركة الدقيقة'}</span>
              </button>

              <button
                onClick={toggleBookmark}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold border transition-all active:scale-95 ${
                  isBookmarked
                    ? 'bg-amber-400/20 text-amber-400 border-amber-400/40'
                    : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:text-white'
                }`}
              >
                {isBookmarked ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                <span>{isBookmarked ? 'محفوظة' : 'حفظ'}</span>
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-5 bg-zinc-950 border-t border-zinc-800/60 flex flex-col gap-1.5 text-right">
            <h1 className="text-base sm:text-lg font-black text-white">
              {episode.title}
            </h1>
            {episode.description && (
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">
                {episode.description}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <span>ملاحظاتك وخواطرك حول الحلقة</span>
              </h3>
              {user && (
                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                  <Cloud className="w-3 h-3" />
                  مزامنة سحابية
                </span>
              )}
            </div>
            <span className="text-xs text-zinc-500 font-mono">{notes.length} ملاحظة</span>
          </div>

          <form onSubmit={handleAddNote} className="space-y-3">
            <textarea
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              placeholder="دوّن فائدة أو فكرة استوقفتك أثناء الاستماع..."
              rows={3}
              className="w-full bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 focus:border-amber-400 rounded-2xl p-4 text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none transition-colors resize-none"
            />

            <div className="flex items-center justify-between">
              <div className="text-xs text-zinc-400 flex items-center gap-1.5 font-mono">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>التوقيت: {formatTime(currentTime)}</span>
              </div>

              <button
                type="submit"
                disabled={!newNoteContent.trim() || isSavingCloud}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black text-xs transition-all shadow-md active:scale-95 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                <span>{isSavingCloud ? 'جاري الحفظ بالسحابة...' : 'حفظ الملاحظة'}</span>
              </button>
            </div>
          </form>

          <div className="space-y-2.5 pt-2">
            {notes.length > 0 ? (
              notes.map((note) => (
                <div
                  key={note.id}
                  className="p-3.5 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 flex items-start justify-between gap-4"
                >
                  <div className="flex flex-col gap-1 text-right">
                    <button
                      onClick={() => seekToExact(note.timestamp)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:underline font-mono w-fit"
                    >
                      <Clock className="w-3 h-3" />
                      <span>عند {formatTime(note.timestamp)}</span>
                    </button>
                    <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed font-medium">
                      {note.content}
                    </p>
                  </div>

                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="text-zinc-600 hover:text-red-400 p-1.5 transition-colors"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            ) : (
              <div className="p-6 text-center rounded-2xl border border-dashed border-zinc-800 text-zinc-500 text-xs">
                لا توجد ملاحظات بعد. اكتب أفكارك أثناء الاستماع لترجع لها في أي وقت.
              </div>
            )}
          </div>
        </div>
      </div>

      {currentEpisode && currentEpisode.id !== episode.id && <Player />}
    </main>
  );
}
