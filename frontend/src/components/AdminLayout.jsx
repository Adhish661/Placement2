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

const drawerWidth = 260;

const AdminLayout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [profilePhoto, setProfilePhoto] = useState(null);
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
      const { data } = await axiosInstance.get('/profile');
      setProfilePhoto(data?.profilePhoto?.url);
    } catch (error) {
      console.error('Error fetching profile photo:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const { data } = await axiosInstance.get('/notifications');
      setNotifications(data);
      const unread = data.filter((n) => !n.isRead).length;
      setUnreadCount(unread);
    } catch (error) {
      // Silently handle connection errors - backend might not be running
      if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error') || error.message?.includes('ERR_CONNECTION_REFUSED')) {
        // Backend is not available, don't spam console
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
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar
        sx={{
          background: 'linear-gradient(135deg, #1e3a5f 0%, #2d4a6b 100%)',
          color: 'white',
          boxShadow: 2,
          minHeight: '64px !important',
        }}
      >
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
          Admin Portal
        </Typography>
      </Toolbar>
      <Box sx={{ flex: 1, background: 'linear-gradient(180deg, #1e3a5f 0%, #2d4a6b 100%)', pt: 2 }}>
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
                    color: location.pathname === item.path ? '#ffffff' : 'rgba(255, 255, 255, 0.9)',
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
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          background: '#f5f5f5',
          color: '#1e3a5f',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          borderBottom: '1px solid #e0e0e0',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' }, color: '#1e3a5f' }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, color: '#1e3a5f', fontWeight: 600 }}>
            {menuItems.find((item) => item.path === location.pathname)?.text || 'Home'}
          </Typography>
          <IconButton 
            sx={{ mr: 2, color: '#1e3a5f' }}
            onClick={() => navigate('/admin/notifications')}
          >
            <Badge badgeContent={unreadCount} color="error">
              <Notifications />
            </Badge>
          </IconButton>
          <IconButton onClick={handleMenuOpen} sx={{ position: 'relative' }}>
            <Avatar 
              src={profilePhoto} 
              sx={{ width: 32, height: 32, bgcolor: '#4facfe' }}
            >
              {!profilePhoto && userInfo?.name?.charAt(0).toUpperCase()}
            </Avatar>
            {profilePhoto && (
              <IconButton
                size="small"
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  bgcolor: '#4facfe',
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
              background: 'linear-gradient(180deg, #1e3a5f 0%, #2d4a6b 100%)',
              borderRight: 'none',
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
              background: 'linear-gradient(180deg, #1e3a5f 0%, #2d4a6b 100%)',
              borderRight: 'none',
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
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
          background: '#ffffff',
          minHeight: '100vh',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default AdminLayout;

