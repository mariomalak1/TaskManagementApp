import { useEffect, useState } from 'react';
import {
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { getAllUsers, deleteUser } from '../api/users.api';
import { getApiErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import type { UserResponse } from '../types/api.types';
import AsyncState from '../components/AsyncState';
import UsersTable from '../components/UsersTable';
import CreateUserDialog from '../components/CreateUserDialog';
import ConfirmDialog from '../components/ConfirmDialog';

export default function AdminUsersPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [userToDelete, setUserToDelete] = useState<UserResponse | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    getAllUsers()
      .then((result) => {
        if (active) setUsers(result.data);
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

  function requestDelete(user: UserResponse) {
    setDeleteError(null);
    setUserToDelete(user);
  }

  function closeDelete() {
    if (!deleting) setUserToDelete(null);
  }

  async function confirmDelete() {
    if (!userToDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteUser(userToDelete.id);
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
      setUserToDelete(null);
    } catch (err) {
      setDeleteError(getApiErrorMessage(err));
    } finally {
      setDeleting(false);
    }
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
            {users.map((user) => {
              const isSelf = user.id === currentUser?.id;
              return (
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
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <Chip
                          size="small"
                          label={user.role}
                          color={user.role === 'Admin' ? 'primary' : 'default'}
                        />
                        <Tooltip title={isSelf ? "You can't delete your own account" : 'Delete user'}>
                          <span>
                            <IconButton
                              size="small"
                              color="error"
                              disabled={isSelf}
                              onClick={() => requestDelete(user)}
                              aria-label="Delete user"
                            >
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Stack>
                    </Stack>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {user.email}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Created {new Date(user.createdAt).toLocaleDateString()}
                    </Typography>
                  </CardContent>
                </Card>
              );
            })}
          </Stack>
        ) : (
          <UsersTable users={users} currentUserId={currentUser?.id} onDelete={requestDelete} />
        )}
      </AsyncState>

      <CreateUserDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onCreated={handleCreated}
      />

      <ConfirmDialog
        open={userToDelete !== null}
        title="Delete user"
        message={
          userToDelete
            ? `Remove ${userToDelete.name} (${userToDelete.email})? This can't be undone.`
            : ''
        }
        confirmLabel="Delete"
        confirmColor="error"
        loading={deleting}
        error={deleteError}
        onConfirm={() => void confirmDelete()}
        onClose={closeDelete}
      />
    </Container>
  );
}
