import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';
import { createTask } from '../api/tasks.api';
import { getApiErrorMessage } from '../api/client';
import type { CreateTaskRequest, TaskPriority, TaskResponse } from '../types/api.types';

const PRIORITIES: TaskPriority[] = ['Low', 'Medium', 'High'];
const TITLE_MAX = 200;
const DESCRIPTION_MAX = 2000;

interface CreateTaskDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: (task: TaskResponse) => void;
}

export default function CreateTaskDialog({ open, onClose, onCreated }: CreateTaskDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [titleError, setTitleError] = useState<string | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setTitle('');
      setDescription('');
      setPriority();
      setTitleError(undefined);
      setServerError(null);
      setSubmitting(false);
    }
  }, [open]);

  function validate(): boolean {
    const trimmed = title.trim();
    if (!trimmed) {
      setTitleError('Title is required.');
      return false;
    }
    if (trimmed.length > TITLE_MAX) {
      setTitleError(`Title must be at most ${TITLE_MAX} characters.`);
      return false;
    }
    setTitleError(undefined);
    return true;
  }

  async function handleSubmit() {
    setServerError(null);
    if (!validate()) return;

    const payload: CreateTaskRequest = {
      title: title.trim(),
      description: description.trim(),
      priority,
    };

    setSubmitting(true);
    try {
      const task = await createTask(payload);
      onCreated(task);
    } catch (err) {
      setServerError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onClose={submitting ? undefined : onClose} fullWidth maxWidth="sm">
      <Box
        component="form"
        onSubmit={(event) => {
          event.preventDefault();
          void handleSubmit();
        }}
      >
        <DialogTitle>Add task</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
              error={!!titleError}
              helperText={titleError ?? `${title.length}/${TITLE_MAX}`}
              slotProps={{ htmlInput: { maxLength: TITLE_MAX } }}
            />
            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              minRows={3}
              helperText={`${description.length}/${DESCRIPTION_MAX}`}
              slotProps={{ htmlInput: { maxLength: DESCRIPTION_MAX } }}
            />
            <TextField
              select
              label="Priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
            >
              {PRIORITIES.map((p) => (
                <MenuItem key={p} value={p}>
                  {p}
                </MenuItem>
              ))}
            </TextField>

            {serverError && <Alert severity="error">{serverError}</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={submitting}>
            {submitting ? 'Creating…' : 'Create task'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
