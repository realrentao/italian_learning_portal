import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import TranslateIcon from '@mui/icons-material/Translate';
import SpellcheckIcon from '@mui/icons-material/Spellcheck';
import HeadphonesIcon from '@mui/icons-material/Headphones';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';

// 首页：四个模块入口卡片
interface Entry {
  path: string;
  title: string;
  titleIt: string;
  desc: string;
  icon: ReactNode;
}

const ENTRIES: Entry[] = [
  {
    path: '/vocabulary',
    title: '词汇',
    titleIt: 'Vocabolario',
    desc: '60+ 常用单词，按颜色 / 日常 / 旅行 / 食物 / 数字分类，支持发音与收藏。',
    icon: <TranslateIcon fontSize="large" color="primary" />,
  },
  {
    path: '/verbs',
    title: '动词变位',
    titleIt: 'Congiugazione',
    desc: '30+ 常用动词的 7 大语式完整变位矩阵，支持 A-Z 索引与搜索。',
    icon: <SpellcheckIcon fontSize="large" color="primary" />,
  },
  {
    path: '/exercises',
    title: '听力练习',
    titleIt: 'Esercizi',
    desc: '听力选择题，听音辨词，提交即判分并给出解析。',
    icon: <HeadphonesIcon fontSize="large" color="primary" />,
  },
  {
    path: '/idioms',
    title: '习语',
    titleIt: 'Modi di dire',
    desc: '30+ 意大利语习语，含字面意思与文化背景注释。',
    icon: <AutoStoriesIcon fontSize="large" color="primary" />,
  },
];

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <Box>
      <Box className="mb-6 text-center">
        <Typography variant="h3" sx={{ fontWeight: 800 }}>
          Benvenuto! 欢迎来到意大利语学习门户
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
          词汇 · 动词变位 · 听力练习 · 习语，全部离线可用。
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {ENTRIES.map((entry) => (
          <Grid item xs={12} sm={6} md={3} key={entry.path}>
            <Card elevation={3} sx={{ height: '100%' }}>
              <CardActionArea
                onClick={() => navigate(entry.path)}
                sx={{ height: '100%' }}
              >
                <CardContent className="flex h-full flex-col items-center gap-2 p-4 text-center">
                  {entry.icon}
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {entry.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {entry.titleIt}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {entry.desc}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
