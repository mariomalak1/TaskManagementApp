import { useState } from 'react';
import { AppBar, Box, Button, Chip, Toolbar, Typography } from '@mui/material';
import ChecklistIcon from '@mui/icons-material/Checklist';
import GroupIcon from '@mui/icons-material/Group';
import LogoutIcon from '@mui/icons-material/Logout';
import { Link as RouterLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ConfirmDialog from './ConfirmDialog';

export default function Layout() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);

  const navColor = (path: string) =>
    location.pathname === path ? 'primary' : 'inherit';

  function handleLogout() {
    setConfirmLogoutOpen(false);
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar sx={{ gap: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            TaskMan
          </Typography>

          {/* Nav links are for admins only: a normal user only has /tasks. */}
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

          <Box sx={{ flexGrow: 1 }} />

          {user && (
            <Box
              sx={{
                display: { xs: 'none', sm: 'flex' },
                alignItems: 'center',
                gap: 1,
                mr: 1,
              }}
            >
              <Typography variant="body2" noWrap sx={{ maxWidth: 160 }}>
                {user.name}
              </Typography>
              {isAdmin && 
                (
                    <Chip
                    size="small"
                    label={user.role}
                    color={user.role === 'Admin' ? 'primary' : 'default'}
                  />
                )
              }
            </Box>
          )}

          <Button
            color="error"
            startIcon={<LogoutIcon />}
            onClick={() => setConfirmLogoutOpen(true)}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Box component="main">
        <Outlet />
      </Box>

      <ConfirmDialog
        open={confirmLogoutOpen}
        title="Log out"
        message="Are you sure you want to log out?"
        confirmLabel="Log out"
        confirmColor="error"
        onConfirm={handleLogout}
        onClose={() => setConfirmLogoutOpen(false)}
      />
    </Box>
  );
}
