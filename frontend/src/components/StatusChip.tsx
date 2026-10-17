import { Chip } from '@mui/material';
import type { TaskItemStatus } from '../types/api.types';

const COLOR: Record<TaskItemStatus, 'warning' | 'info' | 'success'> = {
  Pending: 'warning',
  InProgress: 'info',
  Done: 'success',
};

const LABEL: Record<TaskItemStatus, string> = {
  Pending: 'Pending',
  InProgress: 'In Progress',
  Done: 'Done',
};

export default function StatusChip({ status }: { status: TaskItemStatus }) {
  return (
    <Chip
      size="small"
      label={LABEL[status]}
      color={COLOR[status]}
      sx={{ minWidth: 112, justifyContent: 'center' }}
    />
  );
}
