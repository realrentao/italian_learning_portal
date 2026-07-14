import { useMemo, useState } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import wordsData from '@/data/words.json';
import { Word, WordCategory } from '@/types';
import WordCard, { CATEGORY_LABELS } from '@/components/WordCard';

// 词汇页（R04/R05：分类筛选 + 中意展示）
// - 顶部下拉筛选分类（全部 / 颜色 / 日常 / 旅行 / 食物 / 数字）
// - 下方以响应式网格展示单词卡片

const wordList = wordsData as Word[];

const FILTERS: Array<{ value: WordCategory | 'all'; label: string }> = [
  { value: 'all', label: '全部分类' },
  { value: 'color', label: CATEGORY_LABELS.color },
  { value: 'daily', label: CATEGORY_LABELS.daily },
  { value: 'travel', label: CATEGORY_LABELS.travel },
  { value: 'food', label: CATEGORY_LABELS.food },
  { value: 'number', label: CATEGORY_LABELS.number },
];

export default function VocabularyPage() {
  const [filter, setFilter] = useState<WordCategory | 'all'>('all');

  const filtered = useMemo(
    () =>
      filter === 'all'
        ? wordList
        : wordList.filter((w) => w.category === filter),
    [filter],
  );

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
        词汇 Vocabulary
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        共 {wordList.length} 个单词，点击喇叭图标可离线播放发音。
      </Typography>

      <FormControl size="small" sx={{ minWidth: 200, mb: 3 }}>
        <InputLabel id="category-filter-label">分类筛选</InputLabel>
        <Select
          labelId="category-filter-label"
          label="分类筛选"
          value={filter}
          onChange={(e) => setFilter(e.target.value as WordCategory | 'all')}
        >
          {FILTERS.map((f) => (
            <MenuItem key={f.value} value={f.value}>
              {f.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Grid container spacing={2}>
        {filtered.map((word) => (
          <Grid item xs={12} sm={6} md={4} key={word.id}>
            <WordCard word={word} />
          </Grid>
        ))}
      </Grid>

      {filtered.length === 0 && (
        <Typography variant="body1" sx={{ mt: 4 }} color="text.secondary">
          该分类下暂无单词。
        </Typography>
      )}
    </Box>
  );
}
