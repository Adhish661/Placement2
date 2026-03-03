import { useEffect, useState } from 'react';
import StudentLayout from '../components/StudentLayout';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  IconButton,
  Paper,
  Divider,
} from '@mui/material';
import {
  Notifications,
  NotificationsActive,
  CheckCircle,
  Work,
  Description,
  Info,
  Delete,
} from '@mui/icons-material';
import axiosInstance from '../utils/axios';
import { toast } from 'react-toastify';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await axiosInstance.get('/notifications');
      setNotifications(data);
      setLoading(false);
    } catch (error) {
      // Silently handle connection errors
      if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
        setLoading(false);
        return;
      }
      console.error('Error fetching notifications:', error);
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axiosInstance.put(`/notifications/${notificationId}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await axiosInstance.delete(`/notifications/${notificationId}`);
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  const markAllAsRead = async () => {
    try {
      await axiosInstance.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'drive':
        return <Work color="primary" />;
      case 'application':
        return <Description color="secondary" />;
      case 'info':
        return <Info color="info" />;
      default:
        return <Notifications color="action" />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const cardSx = {
    bgcolor: 'rgba(15,23,42,0.96)',
    borderRadius: 3,
    border: '1px solid rgba(148,163,184,0.35)',
    boxShadow: '0 18px 45px rgba(15,23,42,0.7)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  };

  return (
    <StudentLayout>
      <Box sx={{ animation: 'fadeIn 0.4s ease-out' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#e5e7eb' }}>
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <Chip
              label={`${unreadCount} unread`}
              onClick={markAllAsRead}
              clickable
              sx={{
                background: 'linear-gradient(135deg, #38bdf8 0%, #6366f1 100%)',
                color: 'white',
                fontWeight: 600,
              }}
            />
          )}
        </Box>

        {loading ? (
          <Typography sx={{ color: 'rgba(148,163,184,0.9)' }}>Loading notifications...</Typography>
        ) : notifications.length === 0 ? (
          <Paper sx={{ 
            p: 4, 
            textAlign: 'center', 
            bgcolor: 'rgba(15,23,42,0.96)', 
            border: '1px solid rgba(148,163,184,0.35)',
            borderRadius: 3,
          }}>
            <NotificationsActive sx={{ fontSize: 60, color: '#38bdf8', mb: 2 }} />
            <Typography variant="h6" sx={{ color: '#e5e7eb' }}>
              No notifications yet
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, color: 'rgba(148,163,184,0.9)' }}>
              You'll see notifications about new drives, application updates, and other important information here.
            </Typography>
          </Paper>
        ) : (
          <Card sx={cardSx}>
            <CardContent sx={{ p: 0 }}>
              <List>
                {notifications.map((notification, index) => (
                  <Box key={notification._id}>
                    <ListItem
                      sx={{
                        bgcolor: notification.isRead ? 'transparent' : 'rgba(56,189,248,0.12)',
                        '&:hover': { bgcolor: 'rgba(56,189,248,0.08)' },
                      }}
                    >
                      <ListItemIcon>
                        {notification.isRead ? (
                          <Notifications sx={{ color: 'rgba(148,163,184,0.9)' }} />
                        ) : (
                          <NotificationsActive sx={{ color: '#d1d5db' }} />
                        )}
                        {getNotificationIcon(notification.type)}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography
                              variant="subtitle1"
                              sx={{ fontWeight: notification.isRead ? 'normal' : 'bold', color: '#e5e7eb' }}
                            >
                              {notification.title}
                            </Typography>
                            {!notification.isRead && (
                              <Chip label="New" size="small" sx={{ background: 'linear-gradient(135deg, #38bdf8 0%, #6366f1 100%)', color: 'white' }} />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" sx={{ color: 'rgba(148,163,184,0.9)' }}>
                              {notification.message}
                            </Typography>
                            <Typography variant="caption" sx={{ mt: 0.5, color: 'rgba(148,163,184,0.7)' }}>
                              {new Date(notification.createdAt).toLocaleString()}
                            </Typography>
                          </Box>
                        }
                      />
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {!notification.isRead && (
                          <IconButton
                            size="small"
                            onClick={() => markAsRead(notification._id)}
                            title="Mark as read"
                          >
                            <CheckCircle />
                          </IconButton>
                        )}
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => deleteNotification(notification._id)}
                          title="Delete"
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </ListItem>
                    {index < notifications.length - 1 && <Divider />}
                  </Box>
                ))}
              </List>
            </CardContent>
          </Card>
        )}
      </Box>
    </StudentLayout>
  );
};

export default NotificationsPage;

