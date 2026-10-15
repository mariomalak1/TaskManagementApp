import { Card, CardContent, Stack, Typography } from '@mui/material';
import type { TaskResponse } from '../types/api.types';
import StatusChip from './StatusChip';
import PriorityChip from './PriorityChip';

export default function TaskCard({ task }: { task: TaskResponse }) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          spacing={1}
        >
          <Typography
            variant="subtitle1"
            fontWeight={600}
            noWrap
            sx={{ flex: 1, minWidth: 0 }}
          >
            {task.title}
          </Typography>
          <PriorityChip priority={task.priority} />
        </Stack>

        {task.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {task.description}
          </Typography>
        )}

        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mt: 1.5 }}
        >
          <StatusChip status={task.status} />
          <Typography variant="caption" color="text.secondary">
            {new Date(task.createdAt).toLocaleDateString()}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
