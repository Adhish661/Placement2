import { useEffect, useState } from 'react';
import CoordinatorLayout from '../components/CoordinatorLayout';
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
  People,
  Info,
  Delete,
} from '@mui/icons-material';
import axiosInstance from '../utils/axios';
import { toast } from 'react-toastify';

const CoordinatorNotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await axiosInstance.get('/notifications');
      setNotifications(data);
      setLoading(false);
    } catch (error) {
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
      case 'student':
        return <People color="secondary" />;
      case 'info':
        return <Info color="info" />;
      default:
        return <Notifications color="action" />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <CoordinatorLayout>
      <Box sx={{ animation: 'fadeIn 0.4s ease-out' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography
            variant="h4"
            sx={{ fontWeight: 800, color: '#e5e7eb', letterSpacing: 0.3 }}
          >
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <Chip
              label={`${unreadCount} unread`}
              sx={{
                bgcolor: 'rgba(56,189,248,0.2)',
                color: '#38bdf8',
                borderRadius: 2,
                border: '1px solid rgba(56,189,248,0.6)',
                fontWeight: 600,
              }}
              onClick={markAllAsRead}
              clickable
            />
          )}
        </Box>

        {loading ? (
          <Typography sx={{ color: 'rgba(148,163,184,0.9)' }}>
            Loading notifications...
          </Typography>
        ) : notifications.length === 0 ? (
          <Paper
            sx={{
              p: 4,
              textAlign: 'center',
              bgcolor: 'rgba(15,23,42,0.96)',
              borderRadius: 3,
              border: '1px solid rgba(148,163,184,0.4)',
              boxShadow: '0 18px 45px rgba(15,23,42,0.7)',
            }}
          >
            <NotificationsActive
              sx={{ fontSize: 60, color: 'rgba(148,163,184,0.9)', mb: 2 }}
            />
            <Typography variant="h6" sx={{ color: 'rgba(148,163,184,0.95)' }}>
              No notifications yet
            </Typography>
            <Typography
              variant="body2"
              sx={{ mt: 1, color: 'rgba(148,163,184,0.9)' }}
            >
              You'll see notifications about drives, student activities, and other important information here.
            </Typography>
          </Paper>
        ) : (
          <Card
            sx={{
              bgcolor: 'rgba(15,23,42,0.96)',
              borderRadius: 3,
              border: '1px solid rgba(148,163,184,0.35)',
              boxShadow: '0 18px 45px rgba(15,23,42,0.7)',
            }}
          >
            <CardContent sx={{ p: 0 }}>
              <List>
                {notifications.map((notification, index) => (
                  <Box key={notification._id}>
                    <ListItem
                      sx={{
                        bgcolor: notification.isRead
                          ? 'transparent'
                          : 'rgba(30,64,175,0.45)',
                        '&:hover': { bgcolor: 'rgba(30,64,175,0.65)' },
                      }}
                    >
                      <ListItemIcon>
                        {notification.isRead ? (
                          <Notifications sx={{ color: 'rgba(148,163,184,0.9)' }} />
                        ) : (
                          <NotificationsActive sx={{ color: '#38bdf8' }} />
                        )}
                        {getNotificationIcon(notification.type)}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography
                              variant="subtitle1"
                              sx={{
                                fontWeight: notification.isRead ? 500 : 700,
                                color: '#e5e7eb',
                              }}
                            >
                              {notification.title}
                            </Typography>
                            {!notification.isRead && (
                              <Chip
                                label="New"
                                size="small"
                                sx={{
                                  bgcolor: 'rgba(56,189,248,0.2)',
                                  color: '#38bdf8',
                                }}
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{ color: 'rgba(148,163,184,0.9)' }}
                            >
                              {notification.message}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ mt: 0.5, color: 'rgba(148,163,184,0.8)' }}
                            >
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
                            <CheckCircle sx={{ color: '#38bdf8' }} />
                          </IconButton>
                        )}
                        <IconButton
                          size="small"
                          onClick={() => deleteNotification(notification._id)}
                          title="Delete"
                        >
                          <Delete sx={{ color: '#f97373' }} />
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
    </CoordinatorLayout>
  );
};

export default CoordinatorNotificationsPage;

