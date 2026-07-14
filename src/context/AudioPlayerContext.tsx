import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from 'react';
import { buildAudioUrl } from '@/utils/audio';

// 全局音频播放器上下文
// 关键约束：全局仅维护一个 HTMLAudioElement 单例，
// 在播放新音频前先 pause 旧源，避免多个音频叠加播放。

interface AudioPlayerContextValue {
  /** 当前正在播放的音频 id（无则 null） */
  currentId: string | null;
  /** 是否正在播放 */
  isPlaying: boolean;
  /**
   * 播放指定 id 对应的音频。
   * 若与当前播放的是同一 id，则切换为暂停/继续。
   */
  play: (id: string) => void;
  /** 手动停止当前播放 */
  stop: () => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextValue | null>(null);

export function AudioPlayerProvider({ children }: { children: ReactNode }) {
  // 单例 audio 元素，整个应用生命周期只创建一次
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // 首次挂载时创建单例 audio 元素
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentId(null);
    };
    const handlePause = () => {
      // 仅当确实暂停（非切歌）时同步状态
      if (audioRef.current && audioRef.current.paused) {
        setIsPlaying(false);
      }
    };
    const handlePlay = () => setIsPlaying(true);

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('play', handlePlay);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('play', handlePlay);
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  const play = useCallback((id: string) => {
    const audio = audioRef.current;
    if (!audio) return;
    const url = buildAudioUrl(id);

    if (currentId === id) {
      // 同一音频：切换播放/暂停
      if (audio.paused) {
        void audio.play().catch(() => undefined);
      } else {
        audio.pause();
      }
      return;
    }

    // 不同音频：先停止旧源，再载入新源播放（保证全局单例）
    audio.pause();
    audio.src = url;
    audio.load();
    setCurrentId(id);
    void audio.play().catch(() => {
      // 自动播放被浏览器策略阻止或音频缺失时静默失败
      setIsPlaying(false);
    });
  }, [currentId]);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    setCurrentId(null);
    setIsPlaying(false);
  }, []);

  const value: AudioPlayerContextValue = {
    currentId,
    isPlaying,
    play,
    stop,
  };

  return (
    <AudioPlayerContext.Provider value={value}>
      {children}
    </AudioPlayerContext.Provider>
  );
}

/** 获取音频播放器上下文的 Hook */
export function useAudioPlayer(): AudioPlayerContextValue {
  const ctx = useContext(AudioPlayerContext);
  if (!ctx) {
    throw new Error('useAudioPlayer 必须在 AudioPlayerProvider 内使用');
  }
  return ctx;
}
