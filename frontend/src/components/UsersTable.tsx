import {
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import type { UserResponse } from '../types/api.types';

export default function UsersTable({ users }: { users: UserResponse[] }) {
  return (
    <TableContainer component={Paper} variant="outlined">
      <Table>
        <TableHead>
          <TableRow sx={{ '& th': { fontWeight: 700, bgcolor: 'action.hover' } }}>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Role</TableCell>
            <TableCell align="right">Created</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
