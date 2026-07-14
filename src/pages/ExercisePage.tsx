import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import exercisesData from '@/data/exercises.json';
import { Exercise } from '@/types';
import ExerciseCard from '@/components/ExerciseCard';

// 听力练习页（R08：听力选择题 + 提交判分）
export default function ExercisePage() {
  const exercises = exercisesData as Exercise[];

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
        听力练习 Esercizi
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        共 {exercises.length} 道听力选择题。先听音频，再选择正确答案并提交。
      </Typography>

      <Stack spacing={3}>
        {exercises.map((ex, i) => (
          <ExerciseCard key={ex.id} exercise={ex} index={i + 1} />
        ))}
      </Stack>
    </Box>
  );
}
