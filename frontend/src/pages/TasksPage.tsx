import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Container,
  MenuItem,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { getAllTasks } from '../api/tasks.api';
import { getApiErrorMessage } from '../api/client';
import type { TaskItemStatus, TaskPriority, TaskResponse } from '../types/api.types';
import AsyncState from '../components/AsyncState';
import TasksTable from '../components/TasksTable';
import TaskCard from '../components/TaskCard';
import CreateTaskDialog from '../components/CreateTaskDialog';

type StatusFilter = TaskItemStatus | 'all';

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'Pending', label: 'Pending' },
  { value: 'InProgress', label: 'In Progress' },
  { value: 'Done', label: 'Done' },
];

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

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce the search input so we don't hit the API on every keystroke.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAllTasks({
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: debouncedSearch || undefined,
      });
      setTasks(result.data);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [statusFilter, debouncedSearch]);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  const matchesFilters = useCallback(
    (task: TaskResponse) => {
      const statusOk = statusFilter === 'all' || task.status === statusFilter;
      const searchOk =
        !debouncedSearch || task.title.toLowerCase().includes(debouncedSearch.toLowerCase());
      return statusOk && searchOk;
    },
    [statusFilter, debouncedSearch],
  );

  function handleCreated(task: TaskResponse) {
    // Only show the new task if it matches the active filters.
    if (matchesFilters(task)) {
      setTasks((prev) => sortTasks([task, ...prev]));
    }
    setDialogOpen(false);
  }

  const hasFilters = statusFilter !== 'all' || debouncedSearch !== '';

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

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <TextField
          label="Search by title"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          fullWidth
        />
        <TextField
          select
          label="Status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          size="small"
          sx={{ minWidth: 160 }}
        >
          {STATUS_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      <AsyncState
        loading={loading && tasks.length === 0}
        error={error}
        isEmpty={!loading && tasks.length === 0}
        emptyMessage={hasFilters ? 'No tasks match your filters.' : 'You have no tasks yet.'}
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
