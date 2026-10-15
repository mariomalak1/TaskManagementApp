import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { createUser } from '../api/users.api';
import { getApiErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import UserForm from './UserForm';
import type { UserFormValues } from './UserForm';
import type { UserResponse } from '../types/api.types';

interface CreateUserDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: (user: UserResponse) => void;
}

export default function CreateUserDialog({ open, onClose, onCreated }: CreateUserDialogProps) {
  // Role field shows only for admins (this dialog is admin-only anyway).
  const { isAdmin } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setServerError(null);
      setSubmitting(false);
    }
  }, [open]);

  async function handleSubmit(values: UserFormValues) {
    setServerError(null);
    setSubmitting(true);
    try {
      const user = await createUser({
        name: values.name,
        email: values.email,
        password: values.password,
        role: values.role,
      });
      onCreated(user);
    } catch (err) {
      setServerError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onClose={submitting ? undefined : onClose} fullWidth maxWidth="xs">
      <DialogTitle
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
      >
        Add user
        <IconButton onClick={onClose} disabled={submitting} size="small" aria-label="Close">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <UserForm
          showRole={isAdmin}
          submitLabel="Create user"
          submitting={submitting}
          serverError={serverError}
          onSubmit={(values) => void handleSubmit(values)}
        />
      </DialogContent>
    </Dialog>
  );
}
