'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { usePlayerStore } from '@/store/usePlayerStore';
import { 
  Play, Pause, RotateCcw, RotateCw, Volume2, VolumeX, 
  SkipBack, SkipForward, X, Maximize2, Moon, Link2, Check,
  ChevronDown
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

  // إحداثيات وأبعاد النافذة العائمة المستقلة
  const [windowBounds, setWindowBounds] = useState<{ x: number; y: number; width: number } | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const resizeOriginRef = useRef<{ 
    startX: number; 
    startY: number; 
    startW: number; 
    startPosX: number; 
    startPosY: number; 
    corner: 'tl' | 'tr' | 'bl' | 'br' 
  } | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ startX: number; startY: number; posX: number; posY: number } | null>(null);

  const playerRef = useRef<any>(null);
  const timeUpdateInterval = useRef<NodeJS.Timeout | null>(null);
  const sleepTimerRef = useRef<NodeJS.Timeout | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  // تعيين الموقع التلقائي في أسفل اليمين
  useEffect(() => {
    if (typeof window !== 'undefined' && !windowBounds) {
      const defaultW = Math.min(420, window.innerWidth - 32);
      const defaultH = defaultW * (9 / 16) + 105;
      setWindowBounds({
        x: Math.max(16, window.innerWidth - defaultW - 24),
        y: Math.max(16, window.innerHeight - defaultH - 24),
        width: defaultW,
      });
    }
  }, [windowBounds]);

  // منع سحب وتمرير الصفحة في الخلفية أثناء تحريك أو تكبير المشغل باللمس على الموبايل
  useEffect(() => {
    if (isDragging || isResizing) {
      document.body.style.userSelect = 'none';
      document.body.style.touchAction = 'none';
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.userSelect = '';
      document.body.style.touchAction = '';
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.userSelect = '';
      document.body.style.touchAction = '';
      document.body.style.overflow = '';
    };
  }, [isDragging, isResizing]);

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

  // بدء التحجيم مع دعم كامل للمس والأصابع
  const startResizeFromCorner = (corner: 'tl' | 'tr' | 'bl' | 'br') => (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

    if (!windowBounds) return;
    resizeOriginRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startW: windowBounds.width,
      startPosX: windowBounds.x,
      startPosY: windowBounds.y,
      corner,
    };
    setIsResizing(true);
  };

  // بدء السحب الحر للنافذة
  const handleDragStart = (e: React.PointerEvent) => {
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

    if (!windowBounds) return;
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      posX: windowBounds.x,
      posY: windowBounds.y,
    };
    setIsDragging(true);
  };

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (isResizing && resizeOriginRef.current) {
        const { startX, startW, startPosX, startPosY, corner } = resizeOriginRef.current;
        const deltaX = e.clientX - startX;
        const minW = 260;
        const maxW = typeof window !== 'undefined' ? Math.min(window.innerWidth - 24, 760) : 760;

        let newW = startW;
        let newX = startPosX;
        let newY = startPosY;

        if (corner === 'br') {
          newW = Math.min(Math.max(minW, startW + deltaX), maxW);
          newX = startPosX;
          newY = startPosY;
        } else if (corner === 'bl') {
          newW = Math.min(Math.max(minW, startW - deltaX), maxW);
          newX = startPosX + (startW - newW);
          newY = startPosY;
        } else if (corner === 'tr') {
          newW = Math.min(Math.max(minW, startW + deltaX), maxW);
          newX = startPosX;
          newY = startPosY - (newW - startW) * (9 / 16);
        } else if (corner === 'tl') {
          newW = Math.min(Math.max(minW, startW - deltaX), maxW);
          newX = startPosX + (startW - newW);
          newY = startPosY - (newW - startW) * (9 / 16);
        }

        setWindowBounds({ x: newX, y: newY, width: newW });
      } else if (isDragging && dragStartRef.current && windowBounds) {
        const deltaX = e.clientX - dragStartRef.current.startX;
        const deltaY = e.clientY - dragStartRef.current.startY;
        setWindowBounds({
          ...windowBounds,
          x: dragStartRef.current.posX + deltaX,
          y: dragStartRef.current.posY + deltaY,
        });
      }
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      dragStartRef.current = null;
      resizeOriginRef.current = null;
    };

    if (isDragging || isResizing) {
      window.addEventListener('pointermove', handlePointerMove, { passive: false });
      window.addEventListener('pointerup', handlePointerUp);
      window.addEventListener('pointercancel', handlePointerUp);
    }

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [isDragging, isResizing, windowBounds]);

  const handleSeekEvent = (clientX: number) => {
    if (!trackRef.current || !playerRef.current || duration === 0) return;
    const rect = trackRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const newTime = ratio * duration;
    playerRef.current.seekTo(newTime, true);
    setCurrentTime(newTime);
  };

  const handleTrackPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    handleSeekEvent(e.clientX);
  };

  const handleTrackPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.buttons === 1) {
      e.preventDefault();
      handleSeekEvent(e.clientX);
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

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!currentEpisode) return null;

  const progressRatio = duration > 0 ? Math.min(1, Math.max(0, currentTime / duration)) : 0;
  const progressPercent = progressRatio * 100;

  return (
    <div
      style={
        mode === 'video' && windowBounds
          ? {
              position: 'fixed',
              left: `${windowBounds.x}px`,
              top: `${windowBounds.y}px`,
              width: `${windowBounds.width}px`,
              maxWidth: '96vw',
              touchAction: 'none',
            }
          : undefined
      }
      className={`fixed z-50 transition-all ${isDragging || isResizing ? 'duration-0 select-none' : 'duration-300'} ${
        mode === 'video'
          ? 'bg-zinc-950/95 border border-zinc-800 rounded-3xl shadow-2xl backdrop-blur-2xl overflow-hidden'
          : 'bottom-0 inset-x-0 bg-zinc-950/90 border-t border-zinc-800/80 backdrop-blur-2xl px-4 py-3'
      }`}
    >
      {/* مقابض التحجيم العريضة (44px) للمس بالأصابع على الموبايل والتابلت بدون تداخل مع الشاشة */}
      {mode === 'video' && (
        <>
          <div
            onPointerDown={startResizeFromCorner('tl')}
            className="absolute top-0 left-0 w-11 h-11 z-40 cursor-nwse-resize select-none touch-none"
            title="تكبير أو تصغير"
          />
          <div
            onPointerDown={startResizeFromCorner('tr')}
            className="absolute top-0 right-0 w-11 h-11 z-40 cursor-nesw-resize select-none touch-none"
            title="تكبير أو تصغير"
          />
          <div
            onPointerDown={startResizeFromCorner('bl')}
            className="absolute bottom-0 left-0 w-11 h-11 z-40 cursor-nesw-resize select-none touch-none"
            title="تكبير أو تصغير"
          />
          <div
            onPointerDown={startResizeFromCorner('br')}
            className="absolute bottom-0 right-0 w-11 h-11 z-40 cursor-nwse-resize select-none touch-none"
            title="تكبير أو تصغير"
          />

          {/* شريط السحب الحر العلوي مع حماية اللمس التامة touch-none */}
          <div
            onPointerDown={handleDragStart}
            className="w-full bg-zinc-900/90 py-2 px-3 flex items-center justify-between cursor-grab active:cursor-grabbing border-b border-zinc-800/60 select-none touch-none relative"
          >
            <button
              onClick={() => setMode('audio')}
              title="تصغير إلى شريط الصوت"
              className="text-zinc-400 hover:text-amber-400 p-1 rounded-lg"
            >
              <ChevronDown className="w-4 h-4" />
            </button>

            <div className="w-12 h-1 bg-zinc-600 rounded-full pointer-events-none" />

            <button
              onClick={handleClose}
              className="text-zinc-400 hover:text-white p-1 rounded-lg"
              title="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </>
      )}

      {/* مشغل يوتيوب بنسبة 16:9 ثابتة */}
      <div className={`${mode === 'video' ? 'w-full aspect-video bg-black relative select-none' : 'hidden'}`}>
        <div
          className="absolute inset-0 z-20"
          style={{ pointerEvents: isDragging || isResizing ? 'auto' : 'none' }}
        />
        <div id="youtube-player" className="w-full h-full" />
      </div>
      {mode === 'audio' && <div id="youtube-player" className="hidden" />}

      {/* شريط التحكم السفلي المحمي من التمدد */}
      <div className="flex flex-col gap-2 p-2 sm:p-3 relative overflow-hidden select-none">
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

        {/* رأس المشغل: عنوان بسطر واحد يقتطع بنعومة */}
        <div className="flex items-center justify-between gap-3 h-10 flex-shrink-0 overflow-hidden">
          <div className="flex items-center gap-2.5 min-w-0 flex-1 overflow-hidden">
            <img
              src={`https://img.youtube.com/vi/${currentEpisode.youtube_video_id}/hqdefault.jpg`}
              alt={currentEpisode.title}
              className="w-10 h-10 rounded-xl object-cover border border-zinc-800 flex-shrink-0"
            />
            <div className="flex flex-col min-w-0 flex-1 overflow-hidden text-right">
              <span className="text-xs font-bold text-white truncate whitespace-nowrap block w-full">
                {currentEpisode.title}
              </span>
              <span className="text-[11px] text-zinc-400 truncate whitespace-nowrap block w-full">
                {currentEpisode.program === 'ala-el-maghreb' ? 'عالـمغرب' : 'إيه المشكلة؟'} • الموسم {currentEpisode.season}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={copyCurrentMomentLink}
              title="مشاركة رابط اللحظة الحالية"
              className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-bold text-zinc-300 hover:text-amber-400 transition-colors"
            >
              {copiedTimestamp ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Link2 className="w-3.5 h-3.5" />}
              <span className="hidden md:inline">{copiedTimestamp ? 'تم!' : 'مشاركة'}</span>
            </button>

            <button
              onClick={handleOpenEpisodePage}
              title="فتح صفحة الحلقة والملاحظات"
              className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-bold text-amber-400 transition-colors"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden md:inline">تدوين</span>
            </button>

            <button
              onClick={() => {
                setMode(mode === 'audio' ? 'video' : 'audio');
              }}
              className="px-2 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs font-bold text-zinc-300 hover:text-white"
            >
              {mode === 'audio' ? 'فيديو' : 'صوت'}
            </button>

            {mode === 'audio' && (
              <button
                onClick={handleClose}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* شريط صوت نبض المايك والتوهج المتنفس (Voice Breath & Mic Pulse Scrubber) */}
        <div dir="ltr" className="flex items-center gap-3 text-[11px] text-zinc-400 font-mono select-none px-1">
          <span className="w-10 text-right font-medium">{formatTime(currentTime)}</span>
          
          <div
            ref={trackRef}
            onPointerDown={handleTrackPointerDown}
            onPointerMove={handleTrackPointerMove}
            className="flex-1 h-7 relative flex items-center cursor-pointer group touch-none select-none"
            title="انقر أو اسحب للانتقال في التوقيت"
          >
            {/* مسار الخلفية الرمادي الهادئ */}
            <div className="w-full h-1.5 rounded-full bg-zinc-800 group-hover:bg-zinc-700/80 transition-colors overflow-hidden relative">
              {/* المسار الملون المتوهج بنبض تنفس الصوت أثناء التشغيل */}
              <div
                style={{ width: `${progressPercent}%` }}
                className={`h-full rounded-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-300 transition-all ${
                  isPlaying ? 'animate-voice-breath' : 'opacity-85'
                }`}
              />
            </div>

            {/* مؤشر الصوت النابض مع هالة اهتزاز المايكروفون (Mic Vibration Ring) */}
            <div
              style={{ left: `${progressPercent}%` }}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-none flex items-center justify-center transition-all duration-75"
            >
              {/* حلقة اهتزاز المايك الحركية التي تتسع وتضيق مع الصوت */}
              {isPlaying && (
                <div className="absolute w-7 h-7 rounded-full border border-amber-400/80 animate-mic-pulse pointer-events-none" />
              )}
              
              {/* النواة الصلبة الأنيقة للمؤشر */}
              <div className="relative w-3.5 h-3.5 rounded-full bg-white shadow-md border-2 border-amber-500 flex items-center justify-center group-hover:scale-125 transition-transform">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              </div>
            </div>
          </div>

          <span className="w-10 text-left font-medium">{formatTime(duration)}</span>
        </div>

        {/* أزرار التحكم السفلية */}
        <div dir="ltr" className="flex items-center justify-between pt-0.5">
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
              className="w-9 h-9 rounded-full bg-white hover:bg-zinc-200 text-zinc-950 flex items-center justify-center shadow-lg transition-transform active:scale-95"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
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
