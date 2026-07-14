import IconButton from '@mui/material/IconButton';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import { useAudioPlayer } from '@/context/AudioPlayerContext';

interface PlayButtonProps {
  /** 音频 id（与音频文件名一致） */
  audioId: string;
  /** 按钮尺寸 */
  size?: 'small' | 'medium' | 'large';
  /** 自定义颜色 */
  color?: string;
}

// 通用发音按钮
// 点击后通过全局单例播放器播放对应音频，播放中显示暂停图标。
export default function PlayButton({
  audioId,
  size = 'medium',
  color = 'primary',
}: PlayButtonProps) {
  const { currentId, isPlaying, play } = useAudioPlayer();
  const isCurrent = currentId === audioId;
  const playingThis = isCurrent && isPlaying;

  return (
    <IconButton
      aria-label={playingThis ? '暂停发音' : '播放发音'}
      size={size}
      color={color as 'primary' | 'secondary' | 'default'}
      onClick={(e) => {
        e.stopPropagation();
        play(audioId);
      }}
    >
      {playingThis ? <PauseIcon /> : <PlayArrowIcon />}
    </IconButton>
  );
}
