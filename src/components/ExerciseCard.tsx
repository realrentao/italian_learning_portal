import { useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import RadioGroup from '@mui/material/RadioGroup';
import Radio from '@mui/material/Radio';
import FormControlLabel from '@mui/material/FormControlLabel';
import Alert from '@mui/material/Alert';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { Exercise } from '@/types';
import PlayButton from './PlayButton';

interface ExerciseCardProps {
  exercise: Exercise;
  /** 题号，从 1 开始 */
  index: number;
}

type Status = 'idle' | 'correct' | 'wrong';

// 听力选择题卡片
// 用户选择选项并提交后判分，显示正确答案与解析。
export default function ExerciseCard({ exercise, index }: ExerciseCardProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [status, setStatus] = useState<Status>('idle');

  const handleSubmit = () => {
    if (selected === null) return;
    setStatus(selected === exercise.answer ? 'correct' : 'wrong');
  };

  const handleReset = () => {
    setSelected(null);
    setStatus('idle');
  };

  return (
    <Card elevation={2}>
      <CardContent className="flex flex-col gap-3">
        <Box className="flex items-center justify-between">
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            第 {index} 题 · {exercise.prompt}
          </Typography>
          <PlayButton audioId={exercise.audioFile} />
        </Box>

        <RadioGroup
          value={selected ?? ''}
          onChange={(e) => {
            setSelected(Number(e.target.value));
            if (status !== 'idle') setStatus('idle');
          }}
        >
          {exercise.options.map((opt, i) => {
            const isAnswer = i === exercise.answer;
            const showAsCorrect = status !== 'idle' && isAnswer;
            const showAsWrong = status === 'wrong' && i === selected;
            return (
              <FormControlLabel
                key={opt.id}
                value={i}
                control={<Radio />}
                disabled={status !== 'idle'}
                label={
                  <Typography
                    component="span"
                    sx={{
                      color: showAsCorrect
                        ? 'success.main'
                        : showAsWrong
                          ? 'error.main'
                          : 'text.primary',
                      fontWeight: showAsCorrect || showAsWrong ? 700 : 400,
                    }}
                  >
                    {opt.text}
                  </Typography>
                }
              />
            );
          })}
        </RadioGroup>

        {status === 'idle' && (
          <Box className="flex gap-2">
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={selected === null}
            >
              提交
            </Button>
          </Box>
        )}

        {status === 'correct' && (
          <Alert
            icon={<CheckCircleIcon fontSize="inherit" />}
            severity="success"
            action={
              <Button color="inherit" size="small" onClick={handleReset}>
                重做
              </Button>
            }
          >
            回答正确！{exercise.explanation ?? ''}
          </Alert>
        )}

        {status === 'wrong' && (
          <Alert
            icon={<CancelIcon fontSize="inherit" />}
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={handleReset}>
                重做
              </Button>
            }
          >
            回答错误，正确答案是「{exercise.options[exercise.answer].text}」。
            {exercise.explanation ?? ''}
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
