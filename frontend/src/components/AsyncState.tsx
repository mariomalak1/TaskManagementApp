import type { ReactNode } from 'react';
import { Alert, Box, CircularProgress } from '@mui/material';

interface AsyncStateProps {
  loading: boolean;
  error: string | null;
  isEmpty: boolean;
  emptyMessage?: string;
  children: ReactNode;
}

// Reusable loading / error / empty wrapper for any data-backed view.
export default function AsyncState({
  loading,
  error,
  isEmpty,
  emptyMessage = 'Nothing to show yet.',
  children,
}: AsyncStateProps) {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }
  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }
  if (isEmpty) {
    return <Alert severity="info">{emptyMessage}</Alert>;
  }
  return <>{children}</>;
}
