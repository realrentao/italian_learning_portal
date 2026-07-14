import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import { Idiom } from '@/types';
import PlayButton from './PlayButton';

interface IdiomCardProps {
  idiom: Idiom;
}

// 习语卡片：展示意大利语习语、中文释义、字面意思、文化注释与发音
export default function IdiomCard({ idiom }: IdiomCardProps) {
  return (
    <Card elevation={2} sx={{ height: '100%' }}>
      <CardContent className="flex flex-col gap-2">
        <Box className="flex items-start justify-between gap-2">
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {idiom.italian}
          </Typography>
          <PlayButton audioId={idiom.audioFile} size="small" />
        </Box>

        <Typography variant="body1">{idiom.chinese}</Typography>

        {idiom.literal && (
          <Typography variant="body2" color="text.secondary">
            字面意思：{idiom.literal}
          </Typography>
        )}

        <Divider sx={{ my: 0.5 }} />

        <Box>
          <Chip label="文化注释" size="small" color="secondary" variant="outlined" />
          <Typography variant="body2" sx={{ mt: 1 }}>
            {idiom.culturalNote}
          </Typography>
        </Box>

        {idiom.category && (
          <Box>
            <Chip label={idiom.category} size="small" />
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
