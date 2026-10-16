import { useState } from 'react';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Link,
  TextField,
  Typography,
} from '@mui/material';
import { login } from '../api/auth.api';
import { getApiErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const [searchParams] = useSearchParams();
  const sessionExpired = searchParams.get('expired') === '1';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setError(null);
    setSubmitting(true);
    try {
      const result = await login({ email, password });
      setSession(result);
      navigate('/tasks', { replace: true });
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

          {sessionExpired && !error && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Your session expired. Please sign in again.
            </Alert>
          )}

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

          <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
            Don&apos;t have an account?{' '}
            <Link component={RouterLink} to="/register">
              Sign up
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
}
