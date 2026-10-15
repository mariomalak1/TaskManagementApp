import { AppBar, Box, Button, Toolbar, Typography } from '@mui/material';
import ChecklistIcon from '@mui/icons-material/Checklist';
import GroupIcon from '@mui/icons-material/Group';
import { Link as RouterLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { isAdmin } = useAuth();
  const location = useLocation();

  const navColor = (path: string) =>
    location.pathname === path ? 'primary' : 'inherit';

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <Typography variant="h6" sx={{ fontWeight: 700, flexGrow: 1 }}>
            TaskMan
          </Typography>

          {/* Nav links are for admins only: as normal user has just /tasks */}
          {isAdmin && (
            <>
              <Button
                component={RouterLink}
                to="/tasks"
                startIcon={<ChecklistIcon />}
                color={navColor('/tasks')}
              >
                Tasks
              </Button>
              <Button
                component={RouterLink}
                to="/users"
                startIcon={<GroupIcon />}
                color={navColor('/users')}
              >
                Users
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>

      <Box component="main">
        <Outlet />
      </Box>
    </Box>
  );
}
