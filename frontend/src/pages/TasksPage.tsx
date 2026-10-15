import { useEffect, useState } from 'react';
import {
  Container,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { getAllTasks } from '../api/tasks.api';
import { getApiErrorMessage } from '../api/client';
import type { TaskResponse } from '../types/api.types';
import AsyncState from '../components/AsyncState';
import TasksTable from '../components/TasksTable';
import TaskCard from '../components/TaskCard';

export default function TasksPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [tasks, setTasks] = useState<TaskResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    getAllTasks()
      .then((data) => {
        if (active) setTasks(data);
      })
      .catch((err: unknown) => {
        if (active) setError(getApiErrorMessage(err));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h1" sx={{ fontSize: '2rem', mb: 3 }}>
        My Tasks
      </Typography>

      <AsyncState
        loading={loading}
        error={error}
        isEmpty={tasks.length === 0}
        emptyMessage="You have no tasks yet."
      >
        {isMobile ? (
          <Stack spacing={2}>
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </Stack>
        ) : (
          <TasksTable tasks={tasks} />
        )}
      </AsyncState>
    </Container>
  );
}
