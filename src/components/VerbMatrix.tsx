import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { ConjugationCell, Mood } from '@/types';
import PlayButton from './PlayButton';

// 6 个人称的固定顺序（与 ConjugationCell.forms 顺序一致）
const PERSONS = ['io', 'tu', 'lui/lei', 'noi', 'voi', 'loro'];

// 语式中文标签
const MOOD_LABELS: Record<Mood, string> = {
  infinito: '不定式',
  indicativo: '直陈式',
  congiuntivo: '虚拟式',
  condizionale: '条件式',
  imperativo: '命令式',
  participio: '分词',
  gerundio: '副动词',
};

interface VerbMatrixProps {
  /** 动词原形（用于发音 id） */
  infinitive: string;
  /** 音频 id（通常与动词 id 一致） */
  audioId: string;
  /** 完整变位表 */
  conjugation: ConjugationCell[];
}

// 动词变位矩阵
// 按语式分组展示各时态的 6 个人称形式；无人称语式（不定式/分词/副动词）
// 仅含 1 个形式，渲染为通栏单元格。
export default function VerbMatrix({
  infinitive,
  audioId,
  conjugation,
}: VerbMatrixProps) {
  // 按语式对变位单元格分组，保持 7 语式顺序
  const moodOrder: Mood[] = [
    'infinito',
    'indicativo',
    'congiuntivo',
    'condizionale',
    'imperativo',
    'participio',
    'gerundio',
  ];
  const grouped = moodOrder
    .map((mood) => ({
      mood,
      cells: conjugation.filter((c) => c.mood === mood),
    }))
    .filter((g) => g.cells.length > 0);

  return (
    <Box>
      <Box className="mb-2 flex items-center justify-between">
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          {infinitive} · 变位表
        </Typography>
        <PlayButton audioId={audioId} size="small" />
      </Box>

      <TableContainer component={Paper} variant="outlined">
        <Table size="small" aria-label={`${infinitive} 变位表`}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>语式 / 时态</TableCell>
              {PERSONS.map((p) => (
                <TableCell key={p} sx={{ fontWeight: 700 }}>
                  {p}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {grouped.map((group) =>
              group.cells.map((cell, idx) => {
                const isImpersonal = cell.forms.length === 1;
                return (
                  <TableRow key={`${group.mood}-${cell.tense}-${idx}`}>
                    <TableCell
                      component="th"
                      scope="row"
                      sx={{ whiteSpace: 'nowrap' }}
                    >
                      {idx === 0 && (
                        <Typography
                          component="span"
                          variant="body2"
                          sx={{ fontWeight: 700, color: 'primary.main' }}
                        >
                          {MOOD_LABELS[group.mood]}{' '}
                        </Typography>
                      )}
                      <Typography component="span" variant="body2">
                        {cell.tense}
                      </Typography>
                    </TableCell>

                    {isImpersonal ? (
                      <TableCell colSpan={PERSONS.length} sx={{ fontStyle: 'italic' }}>
                        {cell.forms[0]}
                      </TableCell>
                    ) : (
                      PERSONS.map((_, i) => (
                        <TableCell key={i}>
                          {cell.forms[i] ?? '—'}
                        </TableCell>
                      ))
                    )}
                  </TableRow>
                );
              }),
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
