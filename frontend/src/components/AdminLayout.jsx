import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home,
  People,
  Upload,
  Notifications,
  Logout,
  Settings,
  Edit,
} from '@mui/icons-material';
import { logout } from '../store/slices/authSlice';
import axiosInstance from '../utils/axios';
import { useEffect } from 'react';
import PropTypes from 'prop-types';

const drawerWidth = 260;

// general container for dashboard pages
const PageContainer = ({ children }) => (
  <Box sx={{ flexGrow: 1, p: 3, background: '#f5f5f5', minHeight: '100vh' }}>
    {children}
  </Box>
);

const AdminLayout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const safeProfilePhoto =
    typeof profilePhoto === 'string' &&
    (profilePhoto.startsWith('http') || profilePhoto.startsWith('/') || profilePhoto.startsWith('data:'))
      ? profilePhoto
      : null;
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    if (userInfo) {
      fetchNotifications();
      fetchProfilePhoto();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [userInfo]);

  const fetchProfilePhoto = async () => {
    try {
      const authHeaders = userInfo?.token ? { Authorization: `Bearer ${userInfo.token}` } : {};
      const { data } = await axiosInstance.get('/profile', { headers: authHeaders });
      setProfilePhoto(data?.profilePhoto?.url);
    } catch (error) {
      console.error('Error fetching profile photo:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      if (!userInfo?.token) return;
      const { data } = await axiosInstance.get('/notifications', {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });
      setNotifications(data);
      const unread = data.filter((n) => !n.isRead).length;
      setUnreadCount(unread);
    } catch (error) {
      // Silently handle connection errors - backend might not be running
      if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error') || error.message?.includes('ERR_CONNECTION_REFUSED')) {
        // Backend is not available, don't spam console
        return;
      }
      if (error.response?.status === 401) {
        return;
      }
      console.error('Error fetching notifications:', error);
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const menuItems = [
    { text: 'Home', icon: <Home />, path: '/dashboard' },
    { text: 'View Coordinators', icon: <People />, path: '/admin/coordinators' },
    { text: 'Upload Drive Details', icon: <Upload />, path: '/admin/drives' },
  ];

  const drawer = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background:
          'radial-gradient(900px circle at 0% 0%, rgba(56,189,248,0.28) 0%, rgba(56,189,248,0) 55%), linear-gradient(180deg, #020617 0%, #020024 100%)',
      }}
    >
      <Toolbar
        sx={{
          background: 'transparent',
          color: '#ffffff',
          boxShadow: '0 1px 0 rgba(15,23,42,0.6)',
          minHeight: '64px !important',
        }}
      >
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: 0.6, color: '#ffffff' }}>
          Admin Portal
        </Typography>
      </Toolbar>
      <Box sx={{ flex: 1, pt: 2 }}>
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding sx={{ px: 1.5 }}>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) setMobileOpen(false);
                }}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(79, 172, 254, 0.2)',
                    color: '#4facfe',
                    '&:hover': {
                      backgroundColor: 'rgba(79, 172, 254, 0.3)',
                    },
                    '& .MuiListItemIcon-root': {
                      color: '#4facfe',
                    },
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                <ListItemIcon sx={{ color: location.pathname === item.path ? '#4facfe' : 'rgba(255, 255, 255, 0.7)', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{
                    fontSize: '0.95rem',
                    fontWeight: location.pathname === item.path ? 600 : 400,
                    color: location.pathname === item.path ? '#f9fafb' : 'rgba(226, 232, 240, 0.9)',
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  );

  if (!userInfo) {
    return null;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        background:
          'radial-gradient(1200px circle at 0% 0%, rgba(56,189,248,0.30) 0%, rgba(56,189,248,0) 55%), radial-gradient(900px circle at 100% 0%, rgba(129,140,248,0.30) 0%, rgba(129,140,248,0) 55%), linear-gradient(180deg, #020617 0%, #020024 100%)',
        color: '#e5e7eb',
      }}
    >
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          background: 'rgba(15,23,42,0.85)',
          color: '#e5e7eb',
          boxShadow: '0 18px 45px rgba(15,23,42,0.65)',
          borderBottom: '1px solid rgba(148,163,184,0.35)',
          backdropFilter: 'blur(16px)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 700, letterSpacing: 0.4 }}>
            {menuItems.find((item) => item.path === location.pathname)?.text || 'Home'}
          </Typography>
          <IconButton 
            sx={{ mr: 2, color: '#e5e7eb' }}
            onClick={() => navigate('/admin/notifications')}
          >
            <Badge badgeContent={unreadCount} color="error">
              <Notifications />
            </Badge>
          </IconButton>
          <IconButton onClick={handleMenuOpen} sx={{ position: 'relative' }}>
            <Avatar 
              src={safeProfilePhoto} 
              sx={{ width: 32, height: 32, bgcolor: '#1d4ed8' }}
            >
              {!safeProfilePhoto && userInfo?.name?.charAt(0).toUpperCase()}
            </Avatar>
            {safeProfilePhoto && (
              <IconButton
                size="small"
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  bgcolor: '#38bdf8',
                  color: 'white',
                  width: 20,
                  height: 20,
                  '&:hover': { bgcolor: '#3d8bfe' },
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/profile');
                }}
              >
                <Edit sx={{ fontSize: 12 }} />
              </IconButton>
            )}
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              sx: {
                mt: 1,
                borderRadius: 3,
                bgcolor: 'rgba(15,23,42,0.98)',
                border: '1px solid rgba(148,163,184,0.45)',
                color: '#e5e7eb',
                minWidth: 200,
              },
            }}
          >
            <MenuItem onClick={() => { navigate('/admin/settings'); handleMenuClose(); }}>
              <ListItemIcon>
                <Settings fontSize="small" />
              </ListItemIcon>
              Settings
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              background: 'transparent',
              borderRight: '1px solid rgba(15,23,42,0.9)',
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              background: 'transparent',
              borderRight: '1px solid rgba(15,23,42,0.9)',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2.5, md: 3.5 },
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
          minHeight: '100vh',
          position: 'relative',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            opacity: 0.18,
            background:
              'radial-gradient(700px circle at 0% 100%, rgba(56,189,248,0.45) 0%, rgba(56,189,248,0) 60%), radial-gradient(700px circle at 100% 100%, rgba(129,140,248,0.45) 0%, rgba(129,140,248,0) 60%)',
          }}
        />
        <Box sx={{ position: 'relative', zIndex: 1 }}>{children}</Box>
      </Box>
    </Box>
  );
};

PageContainer.propTypes = {
  children: PropTypes.node,
};
AdminLayout.propTypes = {
  children: PropTypes.node,
};

export default AdminLayout;

