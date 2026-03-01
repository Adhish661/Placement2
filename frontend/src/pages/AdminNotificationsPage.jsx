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
  Divider,
  Stack,
  Fade,
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

const neuBg = '#0f1b2d';
const neuCard = '#13243c';
const neuBorder = 'rgba(255,255,255,0.06)';

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
      if (
        error.code === 'ECONNREFUSED' ||
        error.message?.includes('Network Error')
      ) {
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
        prev.map((n) =>
          n._id === notificationId ? { ...n, isRead: true } : n
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await axiosInstance.delete(`/notifications/${notificationId}`);
      setNotifications((prev) =>
        prev.filter((n) => n._id !== notificationId)
      );
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
        return <Work sx={{ color: '#9fb4ff' }} />;
      case 'coordinator':
        return <People sx={{ color: '#9fb4ff' }} />;
      case 'info':
        return <Info sx={{ color: '#9fb4ff' }} />;
      default:
        return <Notifications sx={{ color: '#9fb4ff' }} />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <AdminLayout>
      <Box
        sx={{
          minHeight: '100%',
          background: neuBg,
          borderRadius: 4,
          animation: 'fadeIn 0.4s ease-out',
          p: 2,
        }}
      >
        {/* Header */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
          sx={{ mb: 3, animation: 'fadeIn 0.6s ease' }}
        >
          <Typography
            variant="h4"
            sx={{ fontWeight: 700, color: '#e5ecff' }}
          >
            Notifications
          </Typography>

          {unreadCount > 0 && (
            <Chip
              label={`${unreadCount} unread – mark all`}
              onClick={markAllAsRead}
              clickable
              sx={{
                background: 'rgba(46,213,115,0.15)',
                color: '#2ed573',
                border: `1px solid ${neuBorder}`,
                fontWeight: 600,
              }}
            />
          )}
        </Stack>

        {/* Body */}
        {loading ? (
          <Typography sx={{ color: '#cfd8ff' }}>
            Loading notifications...
          </Typography>
        ) : notifications.length === 0 ? (
          <Fade in>
            <Card
              sx={{
                background: neuCard,
                borderRadius: '18px',
                border: `1px solid ${neuBorder}`,
                p: 5,
                textAlign: 'center',
              }}
            >
              <NotificationsActive
                sx={{ fontSize: 64, color: '#9fb4ff', mb: 2 }}
              />
              <Typography
                variant="h6"
                sx={{ color: '#e5ecff', fontWeight: 600 }}
              >
                No notifications yet
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: '#9fb4ff', mt: 1 }}
              >
                You&apos;ll see notifications about drives, coordinators and
                system alerts here.
              </Typography>
            </Card>
          </Fade>
        ) : (
          <Fade in>
            <Card
              sx={{
                background: neuCard,
                borderRadius: '18px',
                border: `1px solid ${neuBorder}`,
                overflow: 'hidden',
              }}
            >
              <CardContent sx={{ p: 0 }}>
                <List disablePadding>
                  {notifications.map((notification, index) => (
                    <Box key={notification._id}>
                      <ListItem
                        alignItems="flex-start"
                        sx={{
                          px: 2,
                          py: 1.6,
                          background: notification.isRead
                            ? 'transparent'
                            : 'rgba(255,255,255,0.03)',
                          transition: 'all 0.25s ease',
                          '&:hover': {
                            background: 'rgba(255,255,255,0.06)',
                            transform: 'translateY(-2px)',
                          },
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 40, mt: 0.5 }}>
                          {notification.isRead ? (
                            <Notifications sx={{ color: '#6f85c8' }} />
                          ) : (
                            <NotificationsActive
                              sx={{ color: '#5c8cff' }}
                            />
                          )}
                        </ListItemIcon>

                        <ListItemIcon
                          sx={{ minWidth: 36, mt: 0.6 }}
                        >
                          {getNotificationIcon(notification.type)}
                        </ListItemIcon>

                        <ListItemText
                          primary={
                            <Stack
                              direction="row"
                              alignItems="center"
                              spacing={1}
                            >
                              <Typography
                                sx={{
                                  color: '#e5ecff',
                                  fontWeight: notification.isRead
                                    ? 500
                                    : 700,
                                }}
                              >
                                {notification.title}
                              </Typography>

                              {!notification.isRead && (
                                <Chip
                                  label="New"
                                  size="small"
                                  sx={{
                                    background:
                                      'rgba(92,140,255,0.15)',
                                    color: '#5c8cff',
                                    height: 20,
                                  }}
                                />
                              )}
                            </Stack>
                          }
                          secondary={
                            <Box sx={{ mt: 0.5 }}>
                              <Typography
                                variant="body2"
                                sx={{ color: '#cfd8ff' }}
                              >
                                {notification.message}
                              </Typography>

                              <Typography
                                variant="caption"
                                sx={{ color: '#9fb4ff' }}
                              >
                                {new Date(
                                  notification.createdAt
                                ).toLocaleString()}
                              </Typography>
                            </Box>
                          }
                        />

                        <Stack direction="row" spacing={1}>
                          {!notification.isRead && (
                            <IconButton
                              size="small"
                              onClick={() =>
                                markAsRead(notification._id)
                              }
                              sx={{ color: '#2ed573' }}
                            >
                              <CheckCircle fontSize="small" />
                            </IconButton>
                          )}

                          <IconButton
                            size="small"
                            onClick={() =>
                              deleteNotification(notification._id)
                            }
                            sx={{ color: '#ff6b6b' }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Stack>
                      </ListItem>

                      {index < notifications.length - 1 && (
                        <Divider
                          sx={{
                            borderColor: neuBorder,
                          }}
                        />
                      )}
                    </Box>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Fade>
        )}

        <style>
          {`
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(10px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}
        </style>
      </Box>
    </AdminLayout>
  );
};

export default AdminNotificationsPage;