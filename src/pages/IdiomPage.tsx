import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import idiomsData from '@/data/idioms.json';
import { Idiom } from '@/types';
import IdiomCard from '@/components/IdiomCard';

// 习语页（R09：习语卡 + 文化注释 + 发音）
export default function IdiomPage() {
  const idioms = idiomsData as Idiom[];

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
        习语 Modi di dire
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        共 {idioms.length} 条意大利语习语，含字面意思与文化注释。
      </Typography>

      <Grid container spacing={2}>
        {idioms.map((idiom) => (
          <Grid item xs={12} sm={6} md={4} key={idiom.id}>
            <IdiomCard idiom={idiom} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
