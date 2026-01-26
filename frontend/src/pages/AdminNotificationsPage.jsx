import { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
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

const AdminNotificationsPage = () => {
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
      case 'coordinator':
        return <People color="secondary" />;
      case 'info':
        return <Info color="info" />;
      default:
        return <Notifications color="action" />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <AdminLayout>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <Chip
              label={`${unreadCount} unread`}
              color="primary"
              onClick={markAllAsRead}
              clickable
            />
          )}
        </Box>

        {loading ? (
          <Typography>Loading notifications...</Typography>
        ) : notifications.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <NotificationsActive sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No notifications yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              You'll see notifications about drives, coordinator activities, and system alerts here.
            </Typography>
          </Paper>
        ) : (
          <Card>
            <CardContent sx={{ p: 0 }}>
              <List>
                {notifications.map((notification, index) => (
                  <Box key={notification._id}>
                    <ListItem
                      sx={{
                        bgcolor: notification.isRead ? 'transparent' : 'action.hover',
                        '&:hover': { bgcolor: 'action.selected' },
                      }}
                    >
                      <ListItemIcon>
                        {notification.isRead ? (
                          <Notifications sx={{ color: 'text.secondary' }} />
                        ) : (
                          <NotificationsActive color="primary" />
                        )}
                        {getNotificationIcon(notification.type)}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography
                              variant="subtitle1"
                              sx={{ fontWeight: notification.isRead ? 'normal' : 'bold' }}
                            >
                              {notification.title}
                            </Typography>
                            {!notification.isRead && (
                              <Chip label="New" size="small" color="primary" />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {notification.message}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
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
    </AdminLayout>
  );
};

export default AdminNotificationsPage;

