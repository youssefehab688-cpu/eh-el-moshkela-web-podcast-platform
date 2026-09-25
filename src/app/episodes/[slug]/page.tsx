'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Episode } from '@/types';
import Navbar from '@/components/Navbar';
import Player from '@/components/Player';
import EpisodeNotes from '@/components/EpisodeNotes';
import { usePlayerStore } from '@/store/usePlayerStore';
import { useBookmarkStore } from '@/store/useBookmarkStore';
import { formatTime } from '@/lib/utils';
import { 
  Play, Pause, ArrowRight, Share2, 
  Clock, Check, Radio, Moon, Headphones, Video, Sparkles, BookOpen, Bookmark
} from 'lucide-react';

declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void;
    YT?: any;
  }
}

function YoutubeIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

export default function EpisodeDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [episode, setEpisode] = useState<Episode | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const ytPlayerRef = useRef<any>(null);

  const { 
    currentEpisode, 
    isPlaying, 
    currentTime, 
    duration,
    mode,
    playEpisode, 
    pauseEpisode,
    resumeEpisode,
    setCurrentTime, 
    setDuration, 
    setIsPlaying,
    setPlaylist,
    setMode,
    playNext
  } = usePlayerStore();

  const { isBookmarked, toggleBookmark, loadBookmarks } = useBookmarkStore();

  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  const isCurrentActive = currentEpisode?.id === episode?.id;
  const hasStarted = currentTime > 1;
  const bookmarked = episode ? isBookmarked(episode.id) : false;

  useEffect(() => {
    async function loadEpisodeAndPlaylist() {
      if (!slug) return;
      try {
        const { data, error } = await supabase
          .from('episodes')
          .select('*, recommendations(*)')
          .eq('slug', slug)
          .single();

        if (!error && data) {
          const ep = data as Episode;
          setEpisode(ep);

          const storeEp = usePlayerStore.getState().currentEpisode;
          if (!storeEp || storeEp.id !== ep.id) {
            usePlayerStore.getState().playEpisode(ep, mode, 0);
          }

          const { data: allEpisodes } = await supabase
            .from('episodes')
            .select('*');

          if (allEpisodes && allEpisodes.length > 0) {
            const sorted = [...allEpisodes].sort((a, b) => {
              if (Number(a.season) !== Number(b.season)) {
                return Number(a.season) - Number(b.season);
              }
              return Number(a.episode_number) - Number(b.episode_number);
            });
            setPlaylist(sorted as Episode[]);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadEpisodeAndPlaylist();
  }, [slug, setPlaylist]);

  useEffect(() => {
    if (!episode) return;

    const initPlayer = () => {
      if (!window.YT || !window.YT.Player) return;

      if (ytPlayerRef.current) {
        try {
          ytPlayerRef.current.destroy();
        } catch {}
      }

      ytPlayerRef.current = new window.YT.Player('yt-embed-player', {
        videoId: episode.youtube_video_id,
        playerVars: {
          enablejsapi: 1,
          rel: 0,
          modestbranding: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: (e: any) => {
            const vidDuration = e.target.getDuration();
            if (vidDuration > 0) setDuration(vidDuration);
            const targetTime = usePlayerStore.getState().currentTime;
            if (targetTime > 0) e.target.seekTo(targetTime, true);
            if (usePlayerStore.getState().isPlaying) e.target.playVideo();
          },
          onStateChange: (e: any) => {
            if (e.data === 1) setIsPlaying(true);
            else if (e.data === 2) setIsPlaying(false);
            else if (e.data === 0) {
              setIsPlaying(false);
              playNext();
            }
          },
        },
      });
    };

    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
      window.onYouTubeIframeAPIReady = initPlayer;
    } else {
      initPlayer();
    }

    return () => {
      if (ytPlayerRef.current) {
        try {
          ytPlayerRef.current.destroy();
        } catch {}
      }
    };
  }, [episode?.id, episode?.youtube_video_id, setDuration, setIsPlaying, playNext]);

  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        if (ytPlayerRef.current && typeof ytPlayerRef.current.getCurrentTime === 'function') {
          const current = ytPlayerRef.current.getCurrentTime();
          setCurrentTime(current);
          const total = ytPlayerRef.current.getDuration();
          if (total > 0 && total !== duration) setDuration(total);
        }
      }, 400);
    }
    return () => clearInterval(interval);
  }, [isPlaying, duration, setCurrentTime, setDuration]);

  useEffect(() => {
    const handlePlayCmd = () => ytPlayerRef.current?.playVideo?.();
    const handlePauseCmd = () => ytPlayerRef.current?.pauseVideo?.();
    const handleSeekCmd = (e: any) => {
      const targetTime = e.detail;
      if (ytPlayerRef.current?.seekTo && typeof targetTime === 'number') {
        ytPlayerRef.current.seekTo(targetTime, true);
        setCurrentTime(targetTime);
      }
    };

    window.addEventListener('player-cmd-play', handlePlayCmd);
    window.addEventListener('player-cmd-pause', handlePauseCmd);
    window.addEventListener('player-cmd-seek', handleSeekCmd);

    return () => {
      window.removeEventListener('player-cmd-play', handlePlayCmd);
      window.removeEventListener('player-cmd-pause', handlePauseCmd);
      window.removeEventListener('player-cmd-seek', handleSeekCmd);
    };
  }, [setCurrentTime]);

  const handleDynamicButtonClick = () => {
    if (!episode) return;
    if (isPlaying) {
      pauseEpisode();
    } else {
      resumeEpisode();
    }
  };

  const dynamicButtonLabel = useMemo(() => {
    if (isPlaying) return 'إيقاف مؤقت';
    if (hasStarted) return mode === 'audio' ? 'استئناف الاستماع' : 'استئناف الفيديو';
    return mode === 'audio' ? 'بدء الاستماع' : 'تشغيل الفيديو';
  }, [isPlaying, hasStarted, mode]);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading && !episode) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-300"></div>
      </div>
    );
  }

  if (!episode) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center gap-4">
        <p className="text-zinc-400">عذراً، لم يتم العثور على هذه الحلقة.</p>
        <button
          onClick={() => router.push('/')}
          className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm font-bold text-white hover:bg-zinc-800"
        >
          العودة للرئيسية
        </button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col pb-36">
      <Navbar />

      <div className="container mx-auto max-w-6xl px-4 sm:px-6 pt-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push('/#series')}
            className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white transition-colors group"
          >
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            <span>العودة لجميع الحلقات</span>
          </button>

          <div className="flex items-center bg-zinc-900 border border-zinc-800 p-1 rounded-xl shadow-inner">
            <button
              onClick={() => setMode('video')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === 'video'
                  ? 'bg-zinc-100 text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>فيديو</span>
            </button>

            <button
              onClick={() => setMode('audio')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === 'audio'
                  ? 'bg-zinc-100 text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Headphones className="w-3.5 h-3.5" />
              <span>صوت فقط (التركيز)</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-zinc-800 shadow-2xl">
              <div className={`w-full h-full ${mode === 'audio' ? 'opacity-0 pointer-events-none absolute inset-0' : 'block'}`}>
                <div id="yt-embed-player" className="w-full h-full" />
              </div>

              {mode === 'audio' && (
                <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center p-6 text-center overflow-hidden bg-gradient-to-b from-zinc-900 via-zinc-950 to-zinc-950">
                  <img
                    src={episode.thumbnail_url}
                    alt={episode.title}
                    className="absolute inset-0 w-full h-full object-cover opacity-20 blur-md pointer-events-none"
                  />
                  <div className="relative z-10 flex flex-col items-center gap-4">
                    <div className="relative">
                      <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl overflow-hidden shadow-2xl border-2 border-zinc-700/80">
                        <img
                          src={episode.thumbnail_url}
                          alt={episode.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {isPlaying && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500"></span>
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col items-center gap-1">
                      <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                        <Sparkles className="w-3.5 h-3.5" />
                        وضع الاستماع الصوتي والتركيز
                      </span>
                      <p className="text-xs text-zinc-400 max-w-sm">
                        يعمل الصوت بسلاسة في الخلفية لتقليل التشتت البصري وتسهيل كتابة الملاحظات.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-slate-300 font-bold">
                  {episode.program === 'ala-el-maghreb' ? <Moon className="w-3 h-3 text-amber-400" /> : <Radio className="w-3 h-3 text-slate-300" />}
                  {episode.program === 'ala-el-maghreb' ? `عالـمغرب • الموسم ${episode.season}` : `إيه المشكلة • الموسم ${episode.season}`}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-zinc-900/60 text-zinc-400 border border-zinc-800/80">
                  الحلقة {episode.episode_number}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-zinc-900/60 text-zinc-400 border border-zinc-800/80">
                  {episode.topic}
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-tight">
                {episode.title}
              </h1>

              <div className="flex items-center gap-4 text-xs text-zinc-400 font-medium">
                <span className="flex items-center gap-1.5 font-mono bg-zinc-900/80 border border-zinc-800/80 px-2.5 py-1 rounded-lg">
                  <Clock className="w-3.5 h-3.5 text-slate-300" />
                  <span className="text-white font-bold">{formatTime(currentTime)}</span>
                  <span className="text-zinc-500">/</span>
                  <span>{formatTime(duration || episode.duration_seconds)}</span>
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={handleDynamicButtonClick}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-extrabold text-xs sm:text-sm shadow-md transition-all hover:scale-105 active:scale-95"
                >
                  {isPlaying ? <Pause className="w-4 h-4 fill-zinc-950" /> : <Play className="w-4 h-4 fill-zinc-950" />}
                  <span>{dynamicButtonLabel}</span>
                </button>

                <button
                  onClick={() => setMode(mode === 'video' ? 'audio' : 'video')}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold transition-colors"
                >
                  {mode === 'video' ? <Headphones className="w-4 h-4 text-slate-300" /> : <Video className="w-4 h-4 text-slate-300" />}
                  <span>{mode === 'video' ? 'تحويل لوضع الصوت فقط' : 'تحويل لوضع الفيديو'}</span>
                </button>

                {/* زر الحفظ في المفضلة */}
                <button
                  onClick={() => toggleBookmark(episode.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                    bookmarked
                      ? 'bg-amber-400 text-zinc-950 border-amber-300 shadow-md'
                      : 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-300 hover:text-white'
                  }`}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-current' : ''}`} />
                  <span>{bookmarked ? 'محفوظة في المفضلة' : 'حفظ في المفضلة'}</span>
                </button>

                <button
                  onClick={handleShare}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{copied ? 'تم النسخ' : 'مشاركة'}</span>
                </button>

                <a
                  href={`https://www.youtube.com/watch?v=${episode.youtube_video_id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-red-400 text-xs font-semibold transition-colors mr-auto"
                >
                  <YoutubeIcon className="w-3.5 h-3.5 text-red-500" />
                  <span className="hidden sm:inline">يوتيوب</span>
                </a>
              </div>
            </div>

            <EpisodeNotes episodeId={episode.id} episodeTitle={episode.title} />

          </div>

          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 flex flex-col gap-3">
              <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-slate-300" />
                عن {episode.program === 'ala-el-maghreb' ? 'عالـمغرب' : 'بودكاست إيه المشكلة'}
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                مساحة حوارية وتأملية مع د. أمير منير، د. ياسر ممدوح، ود. محمد الغليظ لمناقشة تحديات وقضايا الشباب المعاصرة من منظور شرعي وواقعي مبسط.
              </p>
            </div>

            <div className="bg-zinc-900/30 border border-zinc-800/60 rounded-2xl p-5 flex flex-col gap-2.5">
              <h5 className="text-xs font-bold text-zinc-300">💡 ميزة تدوين الملاحظات</h5>
              <p className="text-xs text-zinc-400 leading-relaxed">
                اضغط على «حفظ الملاحظة» أثناء استماعك لأي فكرة مميزة لحفظها مع توقيتها التلقائي، والعودة إليها بنقرة واحدة لاحقاً.
              </p>
            </div>
          </div>

        </div>
      </div>

      <Player />
    </main>
  );
}
