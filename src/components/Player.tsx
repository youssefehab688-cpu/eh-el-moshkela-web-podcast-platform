'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { usePlayerStore } from '@/store/usePlayerStore';
import { 
  Play, Pause, RotateCcw, RotateCw, Volume2, VolumeX, 
  SkipBack, SkipForward, X, Maximize2, Moon, Link2, Check
} from 'lucide-react';

export default function Player() {
  const router = useRouter();
  const {
    currentEpisode,
    isPlaying,
    mode,
    playlist,
    setIsPlaying,
    setMode,
    playEpisode,
  } = usePlayerStore();

  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [sleepTimer, setSleepTimer] = useState<number | null>(null);
  const [showSleepMenu, setShowSleepMenu] = useState(false);
  const [copiedTimestamp, setCopiedTimestamp] = useState(false);

  const playerRef = useRef<any>(null);
  const timeUpdateInterval = useRef<NodeJS.Timeout | null>(null);
  const sleepTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleClose = () => {
    if (playerRef.current) {
      try { playerRef.current.pauseVideo(); } catch (e) {}
    }
    usePlayerStore.setState({ currentEpisode: null, isPlaying: false });
  };

  const handleOpenEpisodePage = () => {
    if (!currentEpisode) return;
    const targetSlug = currentEpisode.slug || currentEpisode.youtube_video_id || currentEpisode.id;
    const seekTime = Math.floor(currentTime);

    try {
      localStorage.setItem('eh_el_moshkla_seek_target', seekTime.toString());
    } catch (e) {}

    if (playerRef.current) {
      try { playerRef.current.pauseVideo(); } catch (e) {}
    }
    usePlayerStore.setState({ currentEpisode: null, isPlaying: false });

    router.push(`/episodes/${targetSlug}?t=${seekTime}`);
  };

  const copyCurrentMomentLink = () => {
    if (!currentEpisode || typeof window === 'undefined') return;
    const targetSlug = currentEpisode.slug || currentEpisode.youtube_video_id || currentEpisode.id;
    const url = `${window.location.origin}/episodes/${targetSlug}?t=${Math.floor(currentTime)}`;
    navigator.clipboard.writeText(url);
    setCopiedTimestamp(true);
    setTimeout(() => setCopiedTimestamp(false), 2500);
  };

  const setTimer = (mins: number | null) => {
    if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
    setSleepTimer(mins);
    setShowSleepMenu(false);

    if (mins !== null) {
      sleepTimerRef.current = setTimeout(() => {
        if (playerRef.current) {
          playerRef.current.pauseVideo();
          setIsPlaying(false);
        }
        setSleepTimer(null);
      }, mins * 60 * 1000);
    }
  };

  useEffect(() => {
    return () => {
      if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (currentEpisode && currentTime > 5) {
      try {
        localStorage.setItem(
          'eh_el_moshkla_last_played',
          JSON.stringify({
            episode: currentEpisode,
            currentTime,
            duration: duration || currentEpisode.duration_seconds || 0,
            savedAt: Date.now()
          })
        );
      } catch (e) {}
    }
  }, [currentEpisode, currentTime, duration]);

  useEffect(() => {
    if (!currentEpisode || typeof window === 'undefined' || !('mediaSession' in navigator)) return;

    const programName = currentEpisode.program === 'ala-el-maghreb' ? 'عالـمغرب' : 'إيه المشكلة؟';
    const artworkUrl = `https://img.youtube.com/vi/${currentEpisode.youtube_video_id}/maxresdefault.jpg`;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentEpisode.title,
      artist: 'د. محمد الغليظ، د. أمير منير، م. ياسر ممدوح',
      album: `${programName} - الموسم ${currentEpisode.season}`,
      artwork: [
        { src: `https://img.youtube.com/vi/${currentEpisode.youtube_video_id}/hqdefault.jpg`, sizes: '480x360', type: 'image/jpeg' },
        { src: artworkUrl, sizes: '1280x720', type: 'image/jpeg' },
      ],
    });

    navigator.mediaSession.setActionHandler('play', () => {
      playerRef.current?.playVideo();
      setIsPlaying(true);
    });

    navigator.mediaSession.setActionHandler('pause', () => {
      playerRef.current?.pauseVideo();
      setIsPlaying(false);
    });

    navigator.mediaSession.setActionHandler('seekbackward', () => {
      const newTime = Math.max((playerRef.current?.getCurrentTime() || 0) - 15, 0);
      playerRef.current?.seekTo(newTime, true);
    });

    navigator.mediaSession.setActionHandler('seekforward', () => {
      const newTime = (playerRef.current?.getCurrentTime() || 0) + 15;
      playerRef.current?.seekTo(newTime, true);
    });
  }, [currentEpisode, setIsPlaying]);

  useEffect(() => {
    if (typeof window !== 'undefined' && !(window as any).YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
    }
  }, []);

  useEffect(() => {
    if (!currentEpisode || typeof window === 'undefined') return;

    const initPlayer = () => {
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch (e) {}
      }

      const initialTime = (currentEpisode as any).initialSeekTime || 0;

      if ((window as any).YT && (window as any).YT.Player) {
        playerRef.current = new (window as any).YT.Player('youtube-player', {
          videoId: currentEpisode.youtube_video_id,
          playerVars: {
            autoplay: 1,
            controls: 0,
            disablekb: 1,
            enablejsapi: 1,
            fs: 0,
            modestbranding: 1,
            rel: 0,
            start: Math.floor(initialTime),
          },
          events: {
            onReady: (event: any) => {
              setDuration(event.target.getDuration());
              if (initialTime > 0) {
                event.target.seekTo(initialTime, true);
              }
              event.target.playVideo();
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
                setIsPlaying(false);
                stopTimeTracking();
                handleNext();
              }
            },
          },
        });
      }
    };

    if ((window as any).YT && (window as any).YT.Player) {
      initPlayer();
    } else {
      (window as any).onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      stopTimeTracking();
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch (e) {}
      }
    };
  }, [currentEpisode?.youtube_video_id]);

  const startTimeTracking = () => {
    stopTimeTracking();
    timeUpdateInterval.current = setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
        setCurrentTime(playerRef.current.getCurrentTime());
      }
    }, 1000);
  };

  const stopTimeTracking = () => {
    if (timeUpdateInterval.current) {
      clearInterval(timeUpdateInterval.current);
    }
  };

  const togglePlay = useCallback(() => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  }, [isPlaying]);

  const seekRelative = useCallback((seconds: number) => {
    if (!playerRef.current) return;
    const newTime = Math.max(0, Math.min(currentTime + seconds, duration));
    playerRef.current.seekTo(newTime, true);
    setCurrentTime(newTime);
  }, [currentTime, duration]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (playerRef.current) {
      playerRef.current.seekTo(newTime, true);
      setCurrentTime(newTime);
    }
  };

  const toggleMute = useCallback(() => {
    if (!playerRef.current) return;
    if (isMuted) {
      playerRef.current.unMute();
      setIsMuted(false);
    } else {
      playerRef.current.mute();
      setIsMuted(true);
    }
  }, [isMuted]);

  const changeSpeed = () => {
    const rates = [1, 1.25, 1.5, 1.75, 2];
    const nextRate = rates[(rates.indexOf(playbackRate) + 1) % rates.length];
    if (playerRef.current && playerRef.current.setPlaybackRate) {
      playerRef.current.setPlaybackRate(nextRate);
      setPlaybackRate(nextRate);
    }
  };

  const handleNext = useCallback(() => {
    if (!currentEpisode || playlist.length === 0) return;
    const currentIndex = playlist.findIndex((ep) => ep.id === currentEpisode.id);
    if (currentIndex > -1 && currentIndex < playlist.length - 1) {
      playEpisode(playlist[currentIndex + 1], mode);
    }
  }, [currentEpisode, playlist, mode, playEpisode]);

  const handlePrev = useCallback(() => {
    if (!currentEpisode || playlist.length === 0) return;
    const currentIndex = playlist.findIndex((ep) => ep.id === currentEpisode.id);
    if (currentIndex > 0) {
      playEpisode(playlist[currentIndex - 1], mode);
    }
  }, [currentEpisode, playlist, mode, playEpisode]);

  // استماع لاختصارات لوحة المفاتيح
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.code === 'Space' || e.key.toLowerCase() === 'k') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'l') {
        e.preventDefault();
        seekRelative(10);
      } else if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'j') {
        e.preventDefault();
        seekRelative(-10);
      } else if (e.key.toLowerCase() === 'm') {
        e.preventDefault();
        toggleMute();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, seekRelative, toggleMute]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!currentEpisode) return null;

  return (
    <div
      className={`fixed z-50 transition-all duration-300 ${
        mode === 'video'
          ? 'bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:w-[480px] bg-zinc-950/95 border border-zinc-700/80 rounded-3xl shadow-2xl backdrop-blur-2xl overflow-hidden'
          : 'bottom-0 inset-x-0 bg-zinc-950/90 border-t border-zinc-800/80 backdrop-blur-2xl px-4 py-3'
      }`}
    >
      <div className={`${mode === 'video' ? 'w-full aspect-video bg-black relative' : 'hidden'}`}>
        <div id="youtube-player" className="w-full h-full" />
      </div>
      {mode === 'audio' && <div id="youtube-player" className="hidden" />}

      <div className="flex flex-col gap-2.5 p-2 sm:p-3 relative">
        {showSleepMenu && (
          <div className="absolute bottom-full mb-3 left-4 bg-zinc-900 border border-zinc-800 rounded-2xl p-2 shadow-2xl flex flex-col gap-1 z-50 min-w-[140px] text-right">
            <span className="text-[10px] text-zinc-500 font-bold px-2 py-1">مؤقت النوم</span>
            {[15, 30, 45, 60].map((mins) => (
              <button
                key={mins}
                onClick={() => setTimer(mins)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold text-right transition-colors ${
                  sleepTimer === mins ? 'bg-amber-400 text-zinc-950' : 'text-zinc-300 hover:bg-zinc-800'
                }`}
              >
                بعد {mins} دقيقة
              </button>
            ))}
            {sleepTimer && (
              <button
                onClick={() => setTimer(null)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-red-400 hover:bg-red-950/30 text-right"
              >
                إلغاء المؤقت
              </button>
            )}
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 overflow-hidden">
            <img
              src={`https://img.youtube.com/vi/${currentEpisode.youtube_video_id}/hqdefault.jpg`}
              alt={currentEpisode.title}
              className="w-11 h-11 rounded-xl object-cover flex-shrink-0 border border-zinc-800"
            />
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-white truncate max-w-[170px] sm:max-w-xs">
                {currentEpisode.title}
              </span>
              <span className="text-[11px] text-zinc-400">
                {currentEpisode.program === 'ala-el-maghreb' ? 'عالـمغرب' : 'إيه المشكلة؟'} • الموسم {currentEpisode.season}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={copyCurrentMomentLink}
              title="مشاركة رابط اللحظة الحالية"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-bold text-zinc-300 hover:text-amber-400 transition-colors"
            >
              {copiedTimestamp ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Link2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copiedTimestamp ? 'تم النسخ!' : 'مشاركة الدقيقة'}</span>
            </button>

            <button
              onClick={handleOpenEpisodePage}
              title="فتح صفحة الحلقة والملاحظات"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-bold text-amber-400 transition-colors"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">تدوين</span>
            </button>

            <button
              onClick={() => setMode(mode === 'audio' ? 'video' : 'audio')}
              className="px-2.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs font-bold text-zinc-300 hover:text-white"
            >
              {mode === 'audio' ? 'عرض الفيديو' : 'وضع الصوت'}
            </button>

            <button
              onClick={handleClose}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div dir="ltr" className="flex items-center gap-2.5 text-[11px] text-zinc-400 font-mono select-none">
          <span className="w-10 text-right">{formatTime(currentTime)}</span>
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-400 focus:outline-none"
          />
          <span className="w-10 text-left">{formatTime(duration)}</span>
        </div>

        <div dir="ltr" className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <button onClick={toggleMute} className="text-zinc-400 hover:text-white p-1">
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              onClick={changeSpeed}
              className="text-[11px] font-bold font-mono px-2 py-0.5 rounded-lg bg-zinc-900 text-amber-400 border border-zinc-800"
            >
              {playbackRate}x
            </button>

            <button
              onClick={() => setShowSleepMenu(!showSleepMenu)}
              title="مؤقت النوم"
              className={`p-1.5 rounded-lg transition-colors ${
                sleepTimer ? 'bg-amber-400/20 text-amber-400 border border-amber-400/40' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <button onClick={handlePrev} title="الحلقة السابقة" className="text-zinc-400 hover:text-white">
              <SkipBack className="w-4 h-4" />
            </button>
            <button onClick={() => seekRelative(-15)} title="رجوع 15 ثانية" className="text-zinc-400 hover:text-white">
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-white hover:bg-zinc-200 text-zinc-950 flex items-center justify-center shadow-lg transition-transform active:scale-95"
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
            </button>

            <button onClick={() => seekRelative(15)} title="تقديم 15 ثانية" className="text-zinc-400 hover:text-white">
              <RotateCw className="w-4 h-4" />
            </button>
            <button onClick={handleNext} title="الحلقة التالية" className="text-zinc-400 hover:text-white">
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          <div className="w-12" />
        </div>
      </div>
    </div>
  );
}
