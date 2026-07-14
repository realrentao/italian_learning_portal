import { useMemo, useState } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import verbsData from '@/data/verbs.json';
import { Verb } from '@/types';
import AZIndex from '@/components/AZIndex';
import SearchBar from '@/components/SearchBar';
import VerbMatrix from '@/components/VerbMatrix';

// 动词页（R06/R07：A-Z 索引 + 搜索 + 7 语式变位矩阵）
// - 顶部 A-Z 首字母索引 + 搜索框
// - 列表展示每个动词的原形与中文，点击展开完整变位矩阵

const verbList = verbsData as Verb[];

// 计算所有动词首字母（大写去重排序）
const ALL_LETTERS: string[] = Array.from(
  new Set(verbList.map((v) => v.infinitive[0].toUpperCase())),
).sort();

export default function VerbPage() {
  const [letter, setLetter] = useState<string | null>(null);
  const [query, setQuery] = useState<string>('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return verbList.filter((v) => {
      const matchesLetter = letter
        ? v.infinitive.toUpperCase().startsWith(letter)
        : true;
      const matchesQuery =
        q === ''
          ? true
          : v.infinitive.toLowerCase().includes(q) ||
            v.chinese.includes(q);
      return matchesLetter && matchesQuery;
    });
  }, [letter, query]);

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
        动词变位 Congiugazione
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        共 {verbList.length} 个常用动词，覆盖 7 大语式。点击喇叭可播放原形发音。
      </Typography>

      <Box className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Box className="md:max-w-[70%]">
          <AZIndex letters={ALL_LETTERS} active={letter} onSelect={setLetter} />
        </Box>
        <Box className="md:w-64">
          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder="搜索动词（意/中）"
          />
        </Box>
      </Box>

      <Grid container spacing={3}>
        {filtered.map((verb) => (
          <Grid item xs={12} key={verb.id}>
            <Paper elevation={1} sx={{ p: 2 }}>
              <Box className="mb-2 flex items-baseline gap-2">
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {verb.infinitive}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {verb.chinese}
                </Typography>
              </Box>
              <VerbMatrix
                infinitive={verb.infinitive}
                audioId={verb.id}
                conjugation={verb.conjugation}
              />
            </Paper>
          </Grid>
        ))}
      </Grid>

      {filtered.length === 0 && (
        <Typography variant="body1" sx={{ mt: 4 }} color="text.secondary">
          没有匹配的动词。
        </Typography>
      )}
    </Box>
  );
}
