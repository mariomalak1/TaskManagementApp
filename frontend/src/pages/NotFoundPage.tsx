import { Box, Button, Container, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function NotFoundPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  function goBack() {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(isAuthenticated ? '/tasks' : '/login', { replace: true });
    }
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ py: 10, textAlign: 'center' }}>
        <Typography variant="h1" sx={{ fontSize: '4rem', fontWeight: 700, mb: 1 }}>
          404
        </Typography>
        <Typography variant="h2" sx={{ fontSize: '1.5rem', mb: 1 }}>
          Page not found
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          The page you&apos;re looking for doesn&apos;t exist or has moved.
        </Typography>
        <Button variant="contained" onClick={goBack}>
          Go back
        </Button>
      </Box>
    </Container>
  );
}
