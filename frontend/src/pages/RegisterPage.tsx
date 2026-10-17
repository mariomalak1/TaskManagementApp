import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Card, CardContent, Container, Link, Typography } from '@mui/material';
import { register } from '../api/auth.api';
import { getApiErrorMessage } from '../api/client';
import UserForm from '../components/UserForm';
import type { UserFormValues } from '../components/UserForm';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  async function handleSubmit(values: UserFormValues) {
    setServerError(null);
    setSubmitting(true);
    try {
      await register({ name: values.name, email: values.email, password: values.password });
      navigate('/login', { replace: true });
    } catch (err) {
      setServerError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Container
      maxWidth="xs"
      sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', py: 4 }}
    >
      <Card elevation={2} sx={{ width: '100%' }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h1" sx={{ fontSize: '1.75rem', mb: 0.5 }}>
            Create account
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Sign up to start managing your tasks.
          </Typography>

          <UserForm
            submitLabel="Create account"
            submitting={submitting}
            serverError={serverError}
            onSubmit={(values) => void handleSubmit(values)}
          />

          <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
            Already have an account?{' '}
            <Link component={RouterLink} to="/login">
              Sign in
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
}
