import { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Divider,
  Switch,
  FormControlLabel,
  Stack,
  Fade,
} from '@mui/material';
import { Save, Lock, Notifications, Person } from '@mui/icons-material';
import axiosInstance from '../utils/axios';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

const neuBg = '#0f1b2d';
const neuCard = '#13243c';
const neuBorder = 'rgba(255,255,255,0.06)';

const AdminSettingsPage = () => {
  const { userInfo } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(false);

  const [settings, setSettings] = useState({
    emailNotifications: true,
    driveNotifications: true,
    coordinatorNotifications: true,
    systemAlerts: true,
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [profileData, setProfileData] = useState({
    name: userInfo?.name || '',
    email: userInfo?.email || '',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const savedSettings = localStorage.getItem('adminSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      localStorage.setItem('adminSettings', JSON.stringify(settings));
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    try {
      setLoading(true);
      await axiosInstance.put('/auth/update-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      toast.success('Password updated successfully');

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

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
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: '#e5ecff',
            mb: 3,
            animation: 'fadeIn 0.6s ease',
          }}
        >
          Settings
        </Typography>

        <Fade in>
          <Stack spacing={3}>
            {/* Profile */}
            <Card
              sx={{
                background: neuCard,
                borderRadius: '18px',
                border: `1px solid ${neuBorder}`,
                transition: 'all .25s ease',
                '&:hover': {
                  transform: 'scale(1.01)',
                },
              }}
            >
              <CardContent>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Person sx={{ color: '#d1d5db' }} />
                  <Typography
                    variant="h6"
                    sx={{ color: '#e5ecff', fontWeight: 600 }}
                  >
                    Profile Information
                  </Typography>
                </Stack>

                <Divider sx={{ my: 2, borderColor: neuBorder }} />

                <Stack spacing={2}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={profileData.name}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        name: e.target.value,
                      })
                    }
                  />

                  <TextField
                    fullWidth
                    label="Email"
                    value={profileData.email}
                    disabled 
                  />
                </Stack>
              </CardContent>
            </Card>

            {/* Password */}
            <Card
              sx={{
                background: neuCard,
                borderRadius: '18px',
                border: `1px solid ${neuBorder}`,
                transition: 'all .25s ease',
                '&:hover': {
                  transform: 'scale(1.01)',
                },
              }}
            >
              <CardContent>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Lock sx={{ color: '#d1d5db' }} />
                  <Typography
                    variant="h6"
                    sx={{ color: '#e5ecff', fontWeight: 600 }}
                  >
                    Change Password
                  </Typography>
                </Stack>

                <Divider sx={{ my: 2, borderColor: neuBorder }} />

                <Stack spacing={2}>
                  <TextField
                    fullWidth
                    label="Current Password"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        currentPassword: e.target.value,
                      })
                    }
                  />

                  <TextField
                    fullWidth
                    label="New Password"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value,
                      })
                    }
                  />

                  <TextField
                    fullWidth
                    label="Confirm New Password"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value,
                      })
                    }
                  />

                  <Button
                    variant="contained"
                    startIcon={<Lock />}
                    onClick={handleChangePassword}
                    disabled={loading}
                    sx={{
                      alignSelf: 'flex-start',
                      mt: 1,
                      background:
                        'linear-gradient(135deg,#5c8cff,#6aa9ff)',
                      fontWeight: 600,
                      textTransform: 'none',
                    }}
                  >
                    Update Password
                  </Button>
                </Stack>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card
              sx={{
                background: neuCard,
                borderRadius: '18px',
                border: `1px solid ${neuBorder}`,
                transition: 'all .25s ease',
                '&:hover': {
                  transform: 'scale(1.01)',
                },
              }}
            >
              <CardContent>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Notifications sx={{ color: '#d1d5db' }} />
                  <Typography
                    variant="h6"
                    sx={{ color: '#e5ecff', fontWeight: 600 }}
                  >
                    Notification Preferences
                  </Typography>
                </Stack>

                <Divider sx={{ my: 2, borderColor: neuBorder }} />

                <Stack spacing={1.5}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.emailNotifications}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            emailNotifications: e.target.checked,
                          })
                        }
                      />
                    }
                    label="Email Notifications"
                    sx={{ color: '#cfd8ff' }}
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.driveNotifications}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            driveNotifications: e.target.checked,
                          })
                        }
                      />
                    }
                    label="Drive Notifications"
                    sx={{ color: '#cfd8ff' }}
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.coordinatorNotifications}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            coordinatorNotifications:
                              e.target.checked,
                          })
                        }
                      />
                    }
                    label="Coordinator Activity Notifications"
                    sx={{ color: '#cfd8ff' }}
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.systemAlerts}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            systemAlerts: e.target.checked,
                          })
                        }
                      />
                    }
                    label="System Alerts"
                    sx={{ color: '#cfd8ff' }}
                  />

                  <Button
                    variant="contained"
                    startIcon={<Save />}
                    onClick={handleSaveSettings}
                    disabled={loading}
                    sx={{
                      mt: 1,
                      alignSelf: 'flex-start',
                      background:
                        'linear-gradient(135deg,#5c8cff,#6aa9ff)',
                      fontWeight: 600,
                      textTransform: 'none',
                    }}
                  >
                    Save Notification Settings
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Fade>

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

export default AdminSettingsPage;