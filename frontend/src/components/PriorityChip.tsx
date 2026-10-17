import { Chip } from '@mui/material';
import type { TaskPriority } from '../types/api.types';

const COLOR: Record<TaskPriority, 'default' | 'info' | 'error'> = {
  Low: 'default',
  Medium: 'info',
  High: 'error',
};

export default function PriorityChip({ priority }: { priority: TaskPriority }) {
  return (
    <Chip
      size="small"
      variant="outlined"
      label={priority}
      color={COLOR[priority]}
      sx={{ minWidth: 88, justifyContent: 'center' }}
    />
  );
}
