import { useEffect, useState } from 'react';
import {
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { getAllUsers } from '../api/users.api';
import { getApiErrorMessage } from '../api/client';
import type { UserResponse } from '../types/api.types';
import AsyncState from '../components/AsyncState';
import UsersTable from '../components/UsersTable';
import CreateUserDialog from '../components/CreateUserDialog';

export default function AdminUsersPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    getAllUsers()
      .then((data) => {
        if (active) setUsers(data);
      })
      .catch((err: unknown) => {
        if (active) setError(getApiErrorMessage(err));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  function handleCreated(user: UserResponse) {
    setUsers((prev) => [user, ...prev]);
    setDialogOpen(false);
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Typography variant="h1" sx={{ fontSize: '2rem' }}>
          Users
        </Typography>
        <Button variant="contained" onClick={() => setDialogOpen(true)}>
          Add user
        </Button>
      </Stack>

      <AsyncState
        loading={loading}
        error={error}
        isEmpty={users.length === 0}
        emptyMessage="No users found."
      >
        {isMobile ? (
          <Stack spacing={2}>
            {users.map((user) => (
              <Card key={user.id} variant="outlined">
                <CardContent>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    spacing={1}
                  >
                    <Typography variant="subtitle1" fontWeight={600} noWrap sx={{ minWidth: 0 }}>
                      {user.name}
                    </Typography>
                    <Chip
                      size="small"
                      label={user.role}
                      color={user.role === 'Admin' ? 'primary' : 'default'}
                    />
                  </Stack>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {user.email}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Created {new Date(user.createdAt).toLocaleDateString()}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Stack>
        ) : (
          <UsersTable users={users} />
        )}
      </AsyncState>

      <CreateUserDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onCreated={handleCreated}
      />
    </Container>
  );
}
