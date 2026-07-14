import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import Box from '@mui/material/Box';

interface SearchBarProps {
  /** 当前搜索词 */
  value: string;
  /** 变化回调 */
  onChange: (value: string) => void;
  /** 占位提示 */
  placeholder?: string;
}

// 通用搜索框（受控组件）
export default function SearchBar({
  value,
  onChange,
  placeholder = '搜索…',
}: SearchBarProps) {
  return (
    <Box className="w-full">
      <TextField
        fullWidth
        size="small"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
      />
    </Box>
  );
}
