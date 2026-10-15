import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  TextField,
  Typography,
} from '@mui/material';
import { login } from '../api/auth.api';
import { getApiErrorMessage } from '../api/client';
import type { UserResponse } from '../types/api.types';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<UserResponse | null>(null);

  async function handleSubmit() {
    setError(null);
    setUser(null);
    setSubmitting(true);
    try {
      const result = await login({ email, password });
      setUser(result.user);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Container
      maxWidth="xs"
      sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}
    >
      <Card elevation={2} sx={{ width: '100%' }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h1" sx={{ fontSize: '1.75rem', mb: 0.5 }}>
            Sign in
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Welcome back. Enter your credentials to continue.
          </Typography>

          <Box
            component="form"
            onSubmit={(event) => {
              event.preventDefault();
              void handleSubmit();
            }}
          >
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              margin="normal"
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              margin="normal"
            />
            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
              fullWidth
              sx={{ mt: 2 }}
            >
              {submitting ? 'Signing in…' : 'Sign in'}
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
          {user && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Signed in as {user.name} ({user.role}).
            </Alert>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
