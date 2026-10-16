import { useCallback, useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getTaskById, updateTaskStatus } from '../api/tasks.api';
import { getApiErrorMessage, isNotFoundError } from '../api/client';
import type { TaskItemStatus, TaskResponse } from '../types/api.types';
import AsyncState from '../components/AsyncState';
import StatusChip from '../components/StatusChip';
import PriorityChip from '../components/PriorityChip';

const STATUSES: TaskItemStatus[] = ['Pending', 'InProgress', 'Done'];
const STATUS_LABEL: Record<TaskItemStatus, string> = {
  Pending: 'Pending',
  InProgress: 'In Progress',
  Done: 'Done',
};

export default function TaskDetailsPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState<TaskResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const [status, setStatus] = useState<TaskItemStatus>('Pending');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setNotFound(false);
    try {
      const data = await getTaskById(id);
      setTask(data);
      setStatus(data.status);
    } catch (err) {
      if (isNotFoundError(err)) setNotFound(true);
      else setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleUpdateStatus() {
    if (!task) return;
    setSaveError(null);
    setSaving(true);
    try {
      const updated = await updateTaskStatus(task.id, status);
      setTask(updated);
      setStatus(updated.status);
    } catch (err) {
      setSaveError(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  // A missing task (or another user's task) returns 404 -> send to the not-found page.
  if (notFound) {
    return <Navigate to="/not-found" replace />;
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/tasks')} sx={{ mb: 2 }}>
        Back to tasks
      </Button>

      <AsyncState loading={loading} error={error} isEmpty={false}>
          {task && (
            <Card variant="outlined">
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h1" sx={{ fontSize: '1.5rem', mb: 1 }}>
                  {task.title}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                  <PriorityChip priority={task.priority} />
                  <StatusChip status={task.status} />
                </Stack>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ whiteSpace: 'pre-wrap', mb: 2 }}
                >
                  {task.description || 'No description.'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Created {new Date(task.createdAt).toLocaleString()}
                </Typography>

                <Divider sx={{ my: 3 }} />

                <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
                  Update status
                </Typography>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={2}
                  alignItems={{ sm: 'center' }}
                >
                  <TextField
                    select
                    label="Status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as TaskItemStatus)}
                    size="small"
                    sx={{ minWidth: 180 }}
                  >
                    {STATUSES.map((s) => (
                      <MenuItem key={s} value={s}>
                        {STATUS_LABEL[s]}
                      </MenuItem>
                    ))}
                  </TextField>
                  <Button
                    variant="contained"
                    onClick={() => void handleUpdateStatus()}
                    disabled={saving || status === task.status}
                  >
                    {saving ? 'Saving…' : 'Save status'}
                  </Button>
                </Stack>

                {saveError && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {saveError}
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}
      </AsyncState>
    </Container>
  );
}
