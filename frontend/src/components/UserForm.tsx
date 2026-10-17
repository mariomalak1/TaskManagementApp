import { useState } from 'react';
import { Alert, Box, Button, MenuItem, TextField } from '@mui/material';
import type { UserRole } from '../types/api.types';

export interface UserFormValues {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

interface UserFormProps {
  submitLabel: string;
  submitting: boolean;
  serverError?: string | null;
  // When true, a Role select is shown (admin "create user"). Register leaves it off.
  showRole?: boolean;
  onSubmit: (values: UserFormValues) => void;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// matches api, at least one letter and one digit.
const PASSWORD_RE = /^(?=.*[A-Za-z])(?=.*\d).+$/;

export default function UserForm({
  submitLabel,
  submitting,
  serverError,
  showRole = false,
  onSubmit,
}: UserFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('User');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  function validate(): FieldErrors {
    const errors: FieldErrors = {};
    const trimmedName = name.trim();

    if (!trimmedName) errors.name = 'Name is required.';
    else if (trimmedName.length < 2) errors.name = 'Name must be at least 2 characters.';
    else if (trimmedName.length > 100) errors.name = 'Name must be at most 100 characters.';

    if (!email) errors.email = 'Email is required.';
    else if (!EMAIL_RE.test(email)) errors.email = 'Enter a valid email address.';

    if (!password) errors.password = 'Password is required.';
    else if (password.length < 8) errors.password = 'Password must be at least 8 characters.';
    else if (!PASSWORD_RE.test(password))
      errors.password = 'Password must contain at least one letter and one digit.';

    if (!confirmPassword) errors.confirmPassword = 'Please confirm your password.';
    else if (confirmPassword !== password) errors.confirmPassword = 'Passwords do not match.';

    return errors;
  }

  function handleSubmit() {
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    onSubmit({ name: name.trim(), email, password, role });
  }

  return (
    <Box
      component="form"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        handleSubmit();
      }}
    >
      <TextField
        label="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        autoComplete="name"
        margin="normal"
        error={!!fieldErrors.name}
        helperText={fieldErrors.name}
      />
      <TextField
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        autoComplete="email"
        margin="normal"
        error={!!fieldErrors.email}
        helperText={fieldErrors.email}
      />
      <TextField
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        autoComplete="new-password"
        margin="normal"
        error={!!fieldErrors.password}
        helperText={fieldErrors.password ?? 'At least 8 characters, with a letter and a digit.'}
      />
      <TextField
        label="Confirm password"
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
        autoComplete="new-password"
        margin="normal"
        error={!!fieldErrors.confirmPassword}
        helperText={fieldErrors.confirmPassword}
      />

      {showRole && (
        <TextField
          select
          label="Role"
          value={role}
          onChange={(e) => setRole(e.target.value as UserRole)}
          required
          margin="normal"
        >
          <MenuItem value="User">User</MenuItem>
          <MenuItem value="Admin">Admin</MenuItem>
        </TextField>
      )}

      <Button type="submit" variant="contained" disabled={submitting} fullWidth sx={{ mt: 2 }}>
        {submitting ? `${submitLabel}…` : submitLabel}
      </Button>

      {serverError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {serverError}
        </Alert>
      )}
    </Box>
  );
}
