'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { usePlayerStore } from '@/store/usePlayerStore';
import { 
  Play, Pause, RotateCcw, RotateCw, Volume2, VolumeX, 
  Maximize2, Minimize2, SkipBack, SkipForward, X, Radio, Sparkles
} from 'lucide-react';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export default function Player() {
  const {
    currentEpisode,
    isPlaying,
    mode,
    playlist,
    setIsPlaying,
    setMode,
    playEpisode,
    closePlayer,
  } = usePlayerStore();

  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isPlayerReady, setIsPlayerReady] = useState(false);

  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeUpdateInterval = useRef<NodeJS.Timeout | null>(null);

  // حفظ التوقيت الحالي والحلقة لاستئناف الاستماع لاحقاً
  useEffect(() => {
    if (currentEpisode && currentTime > 5) {
      localStorage.setItem(
        'eh_el_moshkla_last_played',
        JSON.stringify({
          episode: currentEpisode,
          currentTime,
          duration: duration || currentEpisode.duration_seconds || 0,
          savedAt: Date.now()
        })
      );
    }
  }, [currentEpisode, currentTime, duration]);

  // إعداد التحكم من شاشة القفل عبر Media Session API
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

    navigator.mediaSession.setActionHandler('previoustrack', () => handlePrev());
    navigator.mediaSession.setActionHandler('nexttrack', () => handleNext());
  }, [currentEpisode]);

  // تحميل YouTube IFrame API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }
  }, []);

  // تجهيز المشغل
  useEffect(() => {
    if (!currentEpisode) return;

    const initPlayer = () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }

      const initialTime = currentEpisode.initialSeekTime || 0;

      playerRef.current = new window.YT.Player('youtube-player', {
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
            setIsPlayerReady(true);
            setDuration(event.target.getDuration());
            if (initialTime > 0) {
              event.target.seekTo(initialTime, true);
            }
            event.target.playVideo();
            setIsPlaying(true);
          },
          onStateChange: (event: any) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
              startTimeTracking();
            } else if (event.data === window.YT.PlayerState.PAUSED) {
              setIsPlaying(false);
              stopTimeTracking();
            } else if (event.data === window.YT.PlayerState.ENDED) {
              setIsPlaying(false);
              stopTimeTracking();
              handleNext();
            }
          },
        },
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      stopTimeTracking();
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [currentEpisode?.youtube_video_id]);

  const startTimeTracking = () => {
    stopTimeTracking();
    timeUpdateInterval.current = setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
        const time = playerRef.current.getCurrentTime();
        setCurrentTime(time);
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
    const newTime = Math.max(0, Math.min(currentTime + seconds, duration));
    playerRef.current.seekTo(newTime, true);
    setCurrentTime(newTime);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (playerRef.current) {
      playerRef.current.seekTo(newTime, true);
      setCurrentTime(newTime);
    }
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

  return (
    <div
      ref={containerRef}
      className={`fixed z-50 transition-all duration-300 ${
        mode === 'video'
          ? 'bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:w-[480px] bg-zinc-950/95 border border-zinc-700/80 rounded-3xl shadow-2xl backdrop-blur-2xl overflow-hidden'
          : 'bottom-0 inset-x-0 bg-zinc-950/90 border-t border-zinc-800/80 backdrop-blur-2xl px-4 py-3'
      }`}
    >
      {/* مشغل يوتيوب غير المرئي في وضع الصوت أو المرئي في وضع الفيديو */}
      <div className={`${mode === 'video' ? 'w-full aspect-video bg-black relative' : 'hidden'}`}>
        <div id="youtube-player" className="w-full h-full" />
      </div>
      {mode === 'audio' && <div id="youtube-player" className="hidden" />}

      {/* لوحة التحكم */}
      <div className="flex flex-col gap-2 p-3 sm:p-4">
        {/* معلومات الحلقة وأزرار التحكم بالوضع */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 overflow-hidden">
            <img
              src={`https://img.youtube.com/vi/${currentEpisode.youtube_video_id}/hqdefault.jpg`}
              alt={currentEpisode.title}
              className="w-11 h-11 rounded-xl object-cover flex-shrink-0 border border-zinc-800"
            />
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-white truncate max-w-[220px] sm:max-w-xs">
                {currentEpisode.title}
              </span>
              <span className="text-[11px] text-zinc-400">
                {currentEpisode.program === 'ala-el-maghreb' ? 'عالـمغرب' : 'إيه المشكلة؟'} • الموسم {currentEpisode.season}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={() => setMode(mode === 'audio' ? 'video' : 'audio')}
              className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-700 text-xs font-bold text-zinc-300 hover:text-white"
            >
              {mode === 'audio' ? 'عرض الفيديو' : 'وضع الصوت'}
            </button>
            <button
              onClick={closePlayer}
              className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* شريط التقدم الزمني */}
        <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-mono">
          <span>{formatTime(currentTime)}</span>
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
          />
          <span>{formatTime(duration)}</span>
        </div>

        {/* أزرار التحكم بالصوت والسرعة والتقديم */}
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={changeSpeed}
            className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-zinc-900 text-amber-400 border border-zinc-800"
          >
            {playbackRate}x
          </button>

          <div className="flex items-center gap-3">
            <button onClick={handlePrev} className="text-zinc-400 hover:text-white">
              <SkipBack className="w-4 h-4" />
            </button>
            <button onClick={() => seekRelative(-15)} className="text-zinc-400 hover:text-white">
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-white hover:bg-zinc-200 text-zinc-950 flex items-center justify-center shadow-lg transition-transform active:scale-95"
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
            </button>
            <button onClick={() => seekRelative(15)} className="text-zinc-400 hover:text-white">
              <RotateCw className="w-4 h-4" />
            </button>
            <button onClick={handleNext} className="text-zinc-400 hover:text-white">
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          <button onClick={toggleMute} className="text-zinc-400 hover:text-white">
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
