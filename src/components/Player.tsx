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
  const [showSleepMenu, setShowSleepMenu] = useState(false);
  const [copiedTimestamp, setCopiedTimestamp] = useState(false);

  // تمييز الضغط السريع عن الضغط المطول
  const closePressStartRef = useRef<number>(0);
  const [isHoldingClose, setIsHoldingClose] = useState(false);

  // حجم النافذة العائمة والتحجيم الديناميكي متعدد الاتجاهات
  const [windowWidth, setWindowWidth] = useState(420);
  const [isResizing, setIsResizing] = useState(false);
  const resizeOriginRef = useRef<{ 
    startX: number; 
    startY: number; 
    startW: number; 
    startPosX: number;
    startPosY: number;
    corner: 'tl' | 'tr' | 'bl' | 'br';
  } | null>(null);

  // السحب الحر للنافذة
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ startX: number; startY: number; posX: number; posY: number } | null>(null);

  // مؤقت النوم اللحظي
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null);
  const [sleepTimerTimeLeft, setSleepTimerTimeLeft] = useState<number | null>(null);
  const sleepTimerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [stopAtEndOfVideo, setStopAtEndOfVideo] = useState(false);
  const stopAtEndOfVideoRef = useRef(false);

  const playerRef = useRef<any>(null);
  const timeUpdateInterval = useRef<NodeJS.Timeout | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  // الإغلاق مع الحفظ الفوري للحظة التوقف وإشعار الصفحة الرئيسية
  const handleClose = useCallback(() => {
    let exactTime = currentTime;
    if (playerRef.current?.getCurrentTime) {
      try {
        exactTime = playerRef.current.getCurrentTime();
        playerRef.current.pauseVideo();
      } catch (e) {}
    }

    if (currentEpisode && exactTime > 2) {
      try {
        localStorage.setItem(
          'eh_el_moshkla_last_played',
          JSON.stringify({
            episode: currentEpisode,
            currentTime: exactTime,
            duration: duration || currentEpisode.duration_seconds || 0,
            savedAt: Date.now()
          })
        );
        window.dispatchEvent(new Event('app_storage_updated'));
      } catch (e) {}
    }

    usePlayerStore.setState({ currentEpisode: null, isPlaying: false });
  }, [currentEpisode, currentTime, duration]);

  // الضغط على زر X: النقرة السريعة فقط تغلق، والضغطة المطولة تُلغى لحماية السحب
  const handleClosePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    closePressStartRef.current = Date.now();
    setIsHoldingClose(true);
  };

  const handleClosePointerUp = (e: React.PointerEvent) => {
    e.stopPropagation();
    setIsHoldingClose(false);
    const pressDuration = Date.now() - closePressStartRef.current;
    
    // إذا كانت نقرة عادية سريعة (أقل من 320 ميلي ثانية) يغلق فوراً
    if (pressDuration < 320) {
      handleClose();
    }
    // إذا كانت ضغطة مطولة (أثناء محاولة السحب أو لمس عريض) لا يفعل شيئاً
  };

  const handleClosePointerCancel = (e: React.PointerEvent) => {
    e.stopPropagation();
    setIsHoldingClose(false);
  };

  const handleMinimizeToAudio = useCallback((e?: React.SyntheticEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setPosition({ x: 0, y: 0 });
    setMode('audio');
  }, [setMode]);

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

  const setTimer = (mins: number | 'end' | null) => {
    if (sleepTimerIntervalRef.current) clearInterval(sleepTimerIntervalRef.current);
    setShowSleepMenu(false);

    if (mins === null) {
      setSleepTimerMinutes(null);
      setSleepTimerTimeLeft(null);
      setStopAtEndOfVideo(false);
      stopAtEndOfVideoRef.current = false;
      return;
    }

    if (mins === 'end') {
      setStopAtEndOfVideo(true);
      stopAtEndOfVideoRef.current = true;
      setSleepTimerMinutes(null);
      setSleepTimerTimeLeft(null);
    } else {
      setStopAtEndOfVideo(false);
      stopAtEndOfVideoRef.current = false;
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

  const startResizeFromCorner = (corner: 'tl' | 'tr' | 'bl' | 'br') => (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

    resizeOriginRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startW: windowWidth,
      startPosX: position.x,
      startPosY: position.y,
      corner,
    };
    setIsResizing(true);
  };

  const handleDragStart = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      posX: position.x,
      posY: position.y,
    };
    setIsDragging(true);
  };

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (isResizing && resizeOriginRef.current) {
        const { startX, startY, startW, startPosX, startPosY, corner } = resizeOriginRef.current;
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;

        let deltaW = 0;
        if (corner === 'tl') {
          deltaW = (-deltaX + (-deltaY * (16 / 9))) / 2;
        } else if (corner === 'tr') {
          deltaW = (deltaX + (-deltaY * (16 / 9))) / 2;
        } else if (corner === 'bl') {
          deltaW = (-deltaX + (deltaY * (16 / 9))) / 2;
        } else if (corner === 'br') {
          deltaW = (deltaX + (deltaY * (16 / 9))) / 2;
        }

        const maxAllowed = typeof window !== 'undefined' ? Math.min(window.innerWidth - 32, 800) : 800;
        const newW = Math.min(Math.max(260, startW + deltaW), maxAllowed);
        const actualDW = newW - startW;
        const actualDH = actualDW * (9 / 16);

        let newX = startPosX;
        let newY = startPosY;

        if (corner === 'tl') {
          newX = startPosX;
          newY = startPosY;
        } else if (corner === 'br') {
          newX = startPosX + actualDW;
          newY = startPosY + actualDH;
        } else if (corner === 'tr') {
          newX = startPosX + actualDW;
          newY = startPosY;
        } else if (corner === 'bl') {
          newX = startPosX;
          newY = startPosY + actualDH;
        }

        setWindowWidth(newW);
        setPosition({ x: newX, y: newY });
      } else if (isDragging && dragStartRef.current) {
        const deltaX = e.clientX - dragStartRef.current.startX;
        const deltaY = e.clientY - dragStartRef.current.startY;
        setPosition({
          x: dragStartRef.current.posX + deltaX,
          y: dragStartRef.current.posY + deltaY,
        });
      }
    };

    const handlePointerUp = () => {
      if (isDragging && position.y > 110) {
        handleMinimizeToAudio();
      }
      setIsDragging(false);
      setIsResizing(false);
      dragStartRef.current = null;
      resizeOriginRef.current = null;
    };

    if (isDragging || isResizing) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging, isResizing, position.y, handleMinimizeToAudio]);

  const handleSeekEvent = (clientX: number) => {
    if (!trackRef.current || !playerRef.current || duration === 0) return;
    const rect = trackRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const newTime = ratio * duration;
    playerRef.current.seekTo(newTime, true);
    setCurrentTime(newTime);
  };

  const handleTrackPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    handleSeekEvent(e.clientX);
  };

  const handleTrackPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.buttons === 1) {
      handleSeekEvent(e.clientX);
    }
  };

  useEffect(() => {
    return () => {
      if (sleepTimerIntervalRef.current) clearInterval(sleepTimerIntervalRef.current);
    };
  }, []);

  // حفظ تقدم الحلقة بشكل دوري + فحص الـ 80%
  useEffect(() => {
    if (!currentEpisode || currentTime <= 2) return;

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

    const effectiveDuration = duration || currentEpisode.duration_seconds || 0;
    if (effectiveDuration > 0 && currentTime / effectiveDuration >= 0.8) {
      try {
        const watchedList: string[] = JSON.parse(localStorage.getItem('eh_el_moshkla_watched') || '[]');
        if (!watchedList.includes(currentEpisode.id)) {
          const updated = [...watchedList, currentEpisode.id];
          localStorage.setItem('eh_el_moshkla_watched', JSON.stringify(updated));
          window.dispatchEvent(new Event('app_storage_updated'));
        }
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
                if (stopAtEndOfVideoRef.current) {
                  setIsPlaying(false);
                  stopTimeTracking();
                  setSleepTimerMinutes(null);
                  setStopAtEndOfVideo(false);
                  stopAtEndOfVideoRef.current = false;
                } else {
                  setIsPlaying(false);
                  stopTimeTracking();
                  handleNext();
                }
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

  const formatTimerLeft = (secs: number | null) => {
    if (secs === null) return '';
    const m = Math.ceil(secs / 60);
    return `${m} د`;
  };

  if (!currentEpisode) return null;

  const progressRatio = duration > 0 ? Math.min(1, Math.max(0, currentTime / duration)) : 0;
  const progressPercent = progressRatio * 100;
  const timerActive = sleepTimerMinutes !== null || stopAtEndOfVideo;

  return (
    <div
      style={{
        transform: mode === 'video' ? `translate3d(${position.x}px, ${position.y}px, 0)` : 'none',
        width: mode === 'video' ? `${windowWidth}px` : '100%',
        maxWidth: mode === 'video' ? '96vw' : '100%',
      }}
      className={`fixed z-50 transition-all ${
        isDragging || isResizing ? 'duration-0 select-none touch-none' : 'duration-300'
      } ${
        mode === 'video'
          ? 'bottom-6 right-6 bg-zinc-950/95 border border-zinc-800/90 rounded-3xl shadow-2xl backdrop-blur-2xl overflow-hidden'
          : 'bottom-0 inset-x-0 bg-zinc-950/90 border-t border-zinc-800/80 backdrop-blur-2xl px-4 py-3'
      }`}
    >
      {/* مقابض التحجيم غير المرئية في الزوايا الأربع */}
      {mode === 'video' && (
        <>
          <div onPointerDown={startResizeFromCorner('tl')} className="absolute top-0 left-0 w-6 h-6 z-40 cursor-nwse-resize select-none touch-none" />
          <div onPointerDown={startResizeFromCorner('tr')} className="absolute top-0 right-0 w-6 h-6 z-40 cursor-nesw-resize select-none touch-none" />
          <div onPointerDown={startResizeFromCorner('bl')} className="absolute bottom-0 left-0 w-6 h-6 z-40 cursor-nesw-resize select-none touch-none" />
          <div onPointerDown={startResizeFromCorner('br')} className="absolute bottom-0 right-0 w-6 h-6 z-40 cursor-nwse-resize select-none touch-none" />
        </>
      )}

      {/* مشغل يوتيوب مع شريط السحب والأزرار المدمجة في الأعلى */}
      <div className={`${mode === 'video' ? 'w-full aspect-video bg-black relative overflow-hidden group' : 'hidden'}`}>
        <div
          className="absolute inset-0 z-20"
          style={{ pointerEvents: isDragging || isResizing ? 'auto' : 'none' }}
        />
        <div id="youtube-player" className="w-full h-full" />

        {/* شريط السحب العلوي المدمج الشفاف داخل الفيديو */}
        {mode === 'video' && (
          <div
            onPointerDown={handleDragStart}
            className="absolute top-0 inset-x-0 h-11 z-30 flex items-center justify-between px-3 bg-gradient-to-b from-black/80 via-black/30 to-transparent touch-none cursor-grab active:cursor-grabbing select-none"
          >
            {/* زر التحويل لصوت والتنزيل للأسفل (ChevronDown) */}
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={handleMinimizeToAudio}
              title="تحويل لصوت وتنزيل للأسفل"
              className="p-1.5 rounded-full bg-black/60 hover:bg-black/90 text-zinc-300 hover:text-amber-400 transition-all backdrop-blur-md active:scale-90 z-50 flex items-center justify-center border border-white/10"
            >
              <ChevronDown className="w-4 h-4 stroke-[2.5]" />
            </button>

            {/* مؤشر السحب الرفيع في المنتصف */}
            <div className="w-8 h-1 bg-white/35 rounded-full pointer-events-none" />

            {/* زر الإغلاق: النقرة السريعة تغلق، والضغطة المطولة تضيء فقط ولا تغلق */}
            <button
              type="button"
              onPointerDown={handleClosePointerDown}
              onPointerUp={handleClosePointerUp}
              onPointerLeave={handleClosePointerCancel}
              onPointerCancel={handleClosePointerCancel}
              className={`relative p-1.5 rounded-full transition-all backdrop-blur-md active:scale-90 z-50 touch-none border ${
                isHoldingClose
                  ? 'bg-amber-400 text-zinc-950 border-amber-400 scale-105 shadow-lg'
                  : 'bg-black/60 hover:bg-black/90 text-zinc-300 hover:text-white border-white/10'
              }`}
              title="نقرة سريعة للإغلاق"
            >
              <X className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
        )}
      </div>

      {mode === 'audio' && <div id="youtube-player" className="hidden" />}

      {/* شريط التحكم السفلي */}
      <div className="flex flex-col gap-2 p-2 sm:p-3 relative overflow-hidden">
        
        {/* قائمة مؤقت النوم */}
        {showSleepMenu && (
          <div className="absolute bottom-full mb-3 left-4 bg-zinc-900 border border-zinc-800 rounded-2xl p-2 shadow-2xl flex flex-col gap-1 z-50 min-w-[140px] text-right animate-card-fade">
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
              نهاية الفيديو
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

        {/* رأس المشغل */}
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
                setPosition({ x: 0, y: 0 });
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

        {/* شريط الصوت: تدرج لوني شمسي ثابت وفاتح عند الدائرة */}
        <div dir="ltr" className="flex items-center gap-3 text-[11px] text-zinc-400 font-mono select-none px-1">
          <span className="w-10 text-right font-medium">{formatTime(currentTime)}</span>
          
          <div
            ref={trackRef}
            onPointerDown={handleTrackPointerDown}
            onPointerMove={handleTrackPointerMove}
            className="flex-1 h-7 relative flex items-center cursor-pointer group touch-none select-none"
            title="انقر أو اسحب للانتقال في التوقيت"
          >
            <div className="w-full h-1.5 rounded-full bg-zinc-800/90 group-hover:bg-zinc-700/80 transition-colors overflow-hidden relative">
              <div
                style={{
                  width: `${progressPercent}%`,
                  background: 'linear-gradient(90deg, #9a3412 0%, #ea580c 25%, #f59e0b 60%, #fde047 88%, #fffbeb 100%)',
                }}
                className="h-full rounded-full shadow-[0_0_8px_rgba(245,158,11,0.4)]"
              />
            </div>

            <div
              style={{ left: `${progressPercent}%` }}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-none flex items-center justify-center transition-all duration-75"
            >
              <div className="relative w-3.5 h-3.5 rounded-full bg-white shadow-[0_0_10px_rgba(251,191,36,0.6)] border-2 border-amber-400 flex items-center justify-center group-hover:scale-125 transition-transform">
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

            {/* زر مؤقت النوم */}
            <div className="flex items-center gap-1.5 relative">
              <button
                onClick={() => setShowSleepMenu(!showSleepMenu)}
                title="مؤقت النوم"
                className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 ${
                  timerActive ? 'bg-amber-400/20 text-amber-400 border border-amber-400/40' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                {timerActive && stopAtEndOfVideo && (
                  <span className="text-[10px] font-bold">نهاية الفيديو</span>
                )}
              </button>
              {timerActive && sleepTimerTimeLeft !== null && (
                <span className="text-[11px] font-mono text-amber-300 font-medium">
                  {formatTimerLeft(sleepTimerTimeLeft)}
                </span>
              )}
            </div>
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
