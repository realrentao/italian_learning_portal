import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { Word, WordCategory } from '@/types';
import { useFavorites } from '@/context/FavoritesContext';
import PlayButton from './PlayButton';

// 分类中文显示映射
export const CATEGORY_LABELS: Record<WordCategory, string> = {
  color: '颜色',
  daily: '日常',
  travel: '旅行',
  food: '食物',
  number: '数字',
};

interface WordCardProps {
  word: Word;
}

// 单词卡片：展示意大利语、中文释义、分类标签、发音按钮与收藏按钮
export default function WordCard({ word }: WordCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const fav = isFavorite(word.id);

  return (
    <Card
      elevation={2}
      sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      <CardContent className="flex flex-1 flex-col gap-2">
        <Box className="flex items-start justify-between">
          <Box>
            <Typography variant="h6" component="div" sx={{ fontWeight: 700 }}>
              {word.italian}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {word.chinese}
            </Typography>
          </Box>
          <IconButton
            aria-label={fav ? '取消收藏' : '收藏'}
            size="small"
            color="error"
            onClick={() => toggleFavorite(word.id)}
          >
            {fav ? <FavoriteIcon /> : <FavoriteBorderIcon />}
          </IconButton>
        </Box>

        <Box className="flex items-center justify-between">
          <Chip
            label={CATEGORY_LABELS[word.category]}
            size="small"
            color="primary"
            variant="outlined"
          />
          <PlayButton audioId={word.audioFile} />
        </Box>

        {word.example && (
          <Box className="mt-1 rounded-md bg-slate-50 p-2">
            <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
              {word.example}
            </Typography>
            {word.exampleZh && (
              <Typography variant="caption" color="text.secondary">
                {word.exampleZh}
              </Typography>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
