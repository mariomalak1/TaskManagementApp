import {
  Chip,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import type { UserResponse } from '../types/api.types';

interface UsersTableProps {
  users: UserResponse[];
  currentUserId?: string;
  onDelete: (user: UserResponse) => void;
}

export default function UsersTable({ users, currentUserId, onDelete }: UsersTableProps) {
  return (
    <TableContainer component={Paper} variant="outlined">
      <Table>
        <TableHead>
          <TableRow sx={{ '& th': { fontWeight: 700, bgcolor: 'action.hover' } }}>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Role</TableCell>
            <TableCell align="right">Created</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => {
            const isSelf = user.id === currentUserId;
            return (
              <TableRow key={user.id} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>
                    {user.name}
                  </Typography>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={user.role}
                    color={user.role === 'Admin' ? 'primary' : 'default'}
                  />
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" color="text.secondary">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Tooltip title={isSelf ? "You can't delete your own account" : 'Delete user'}>
                    <span>
                      <IconButton
                        size="small"
                        color="error"
                        disabled={isSelf}
                        onClick={() => onDelete(user)}
                        aria-label="Delete user"
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
