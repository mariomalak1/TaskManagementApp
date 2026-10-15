import { Box, Button, Container, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import BlockIcon from '@mui/icons-material/Block';

export default function AccessDeniedPage() {
  return (
    <Container maxWidth="sm">
      <Box sx={{ py: 10, textAlign: 'center' }}>
        <BlockIcon color="error" sx={{ fontSize: 56, mb: 2 }} />
        <Typography variant="h1" sx={{ fontSize: '2rem', mb: 1 }}>
          Access denied
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          You don&apos;t have permission to view this page.
        </Typography>
        <Button component={RouterLink} to="/tasks" variant="contained">
          Back to tasks
        </Button>
      </Box>
    </Container>
  );
}
