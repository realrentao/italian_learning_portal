import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

interface AZIndexProps {
  /** 可用的首字母集合（大写，如 ['A','B','C']） */
  letters: string[];
  /** 当前选中的字母（null 表示全部） */
  active: string | null;
  /** 选中字母回调，再次点击已选中的字母则取消（回到全部） */
  onSelect: (letter: string | null) => void;
}

// A-Z 首字母索引条
// 用于动词页按首字母快速筛选；点击「全部」取消筛选。
export default function AZIndex({ letters, active, onSelect }: AZIndexProps) {
  return (
    <Box className="flex flex-wrap gap-1">
      <Button
        size="small"
        variant={active === null ? 'contained' : 'outlined'}
        onClick={() => onSelect(null)}
      >
        全部
      </Button>
      {letters.map((letter) => (
        <Button
          key={letter}
          size="small"
          variant={active === letter ? 'contained' : 'outlined'}
          onClick={() => onSelect(active === letter ? null : letter)}
        >
          {letter}
        </Button>
      ))}
    </Box>
  );
}
