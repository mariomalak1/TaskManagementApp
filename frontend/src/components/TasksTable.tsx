import {
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import type { TaskResponse } from '../types/api.types';
import StatusChip from './StatusChip';
import PriorityChip from './PriorityChip';

export default function TasksTable({ tasks }: { tasks: TaskResponse[] }) {
  return (
    <TableContainer component={Paper} variant="outlined">
      <Table>
        <TableHead>
          <TableRow sx={{ '& th': { fontWeight: 700, bgcolor: 'action.hover' } }}>
            <TableCell>Title</TableCell>
            <TableCell>Priority</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right">Created</TableCell>
            <TableCell align="right">Details</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.id} hover>
              <TableCell>
                <Typography
                  variant="body2"
                  fontWeight={600}
                  noWrap
                  sx={{ maxWidth: 320 }}
                >
                  {task.title}
                </Typography>
                {task.description && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    noWrap
                    sx={{ display: 'block', maxWidth: 360 }}
                  >
                    {task.description}
                  </Typography>
                )}
              </TableCell>
              <TableCell>
                <PriorityChip priority={task.priority} />
              </TableCell>
              <TableCell>
                <StatusChip status={task.status} />
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2" color="text.secondary">
                  {new Date(task.createdAt).toLocaleDateString()}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Button component={RouterLink} to={`/tasks/${task.id}`} size="small">
                  Details
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
