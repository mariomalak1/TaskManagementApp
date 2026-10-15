import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Container,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { getAllTasks } from '../api/tasks.api';
import { getApiErrorMessage } from '../api/client';
import type { TaskPriority, TaskResponse } from '../types/api.types';
import AsyncState from '../components/AsyncState';
import TasksTable from '../components/TasksTable';
import TaskCard from '../components/TaskCard';
import CreateTaskDialog from '../components/CreateTaskDialog';

const PRIORITY_RANK: Record<TaskPriority, number> = { High: 2, Medium: 1, Low: 0 };

// Mirrors the API order: priority (High -> Low), then newest first.
function sortTasks(list: TaskResponse[]): TaskResponse[] {
  return [...list].sort((a, b) => {
    const byPriority = PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority];
    if (byPriority !== 0) return byPriority;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export default function TasksPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [tasks, setTasks] = useState<TaskResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setTasks(await getAllTasks());
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  function handleCreated(task: TaskResponse) {
    setTasks((prev) => sortTasks([task, ...prev]));
    setDialogOpen(false);
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Typography variant="h1" sx={{ fontSize: '2rem' }}>
          My Tasks
        </Typography>
        <Button variant="contained" onClick={() => setDialogOpen(true)}>
          Add task
        </Button>
      </Stack>

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

      <CreateTaskDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onCreated={handleCreated}
      />
    </Container>
  );
}
