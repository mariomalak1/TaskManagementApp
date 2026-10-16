import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Container,
  MenuItem,
  Stack,
  TablePagination,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { getAllTasks } from '../api/tasks.api';
import { getApiErrorMessage } from '../api/client';
import type { TaskItemStatus, TaskResponse } from '../types/api.types';
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

const ROWS_PER_PAGE_OPTIONS = [5, 10, 25, 50];

export default function TasksPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [tasks, setTasks] = useState<TaskResponse[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(0); // 0-based (MUI)
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Debounce the search input.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Back to the first page whenever the filters change.
  useEffect(() => {
    setPage(0);
  }, [statusFilter, debouncedSearch]);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAllTasks({
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: debouncedSearch || undefined,
        page: page + 1,
        pageSize: rowsPerPage,
      });
      setTasks(result.data);
      setTotalCount(result.totalCount);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [statusFilter, debouncedSearch, page, rowsPerPage]);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  function handleCreated() {
    setDialogOpen(false);
    if (page !== 0) {
      setPage(0);
    } else {
      void loadTasks();
    }
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
        isEmpty={!loading && totalCount === 0}
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

      {totalCount > 0 && (
        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
          showFirstButton
          showLastButton
          
        />
      )}

      <CreateTaskDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onCreated={handleCreated}
      />
    </Container>
  );
}
