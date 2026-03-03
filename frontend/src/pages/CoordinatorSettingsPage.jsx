import { useEffect, useState } from 'react';
import CoordinatorLayout from '../components/CoordinatorLayout';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Divider,
  Switch,
  FormControlLabel,
  Alert,
} from '@mui/material';
import { Save, Lock, Notifications, Security, Person } from '@mui/icons-material';
import axiosInstance from '../utils/axios';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

const CoordinatorSettingsPage = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    driveNotifications: true,
    applicationUpdates: true,
    studentNotifications: true,
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [profileData, setProfileData] = useState({
    name: userInfo?.name || '',
    email: userInfo?.email || '',
    department: userInfo?.department || '',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const savedSettings = localStorage.getItem('coordinatorSettings');
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
      localStorage.setItem('coordinatorSettings', JSON.stringify(settings));
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    const nameTrimmed = profileData.name.trim();
    if (nameTrimmed && !/^[A-Za-z\s.]+$/.test(nameTrimmed)) {
      toast.error('Name should contain alphabets and spaces only');
      return;
    }
    toast.success('Profile information updated (local only)');
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
    <CoordinatorLayout>
      <Box sx={{ animation: 'fadeIn 0.4s ease-out' }}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{ fontWeight: 800, mb: 3, color: '#e5e7eb', letterSpacing: 0.3 }}
        >
          Settings
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                bgcolor: 'rgba(15,23,42,0.96)',
                borderRadius: 3,
                border: '1px solid rgba(148,163,184,0.35)',
                boxShadow: '0 18px 45px rgba(15,23,42,0.7)',
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Person sx={{ mr: 1, color: '#38bdf8' }} />
                  <Typography variant="h6" sx={{ color: '#e5e7eb', fontWeight: 600 }}>
                    Profile Information
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2, borderColor: 'rgba(148,163,184,0.4)' }} />
                <TextField
                  fullWidth
                  label="Full Name"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  margin="normal"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: 'rgba(15,23,42,0.9)',
                      color: '#e5e7eb',
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(148,163,184,0.9)',
                    },
                  }}
                />
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  margin="normal"
                  disabled
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: 'rgba(15,23,42,0.9)',
                      color: 'rgba(148,163,184,0.9)',
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(148,163,184,0.9)',
                    },
                  }}
                />
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={handleUpdateProfile}
                  sx={{ mt: 2 }}
                  disabled={loading}
                >
                  Update Profile
                </Button>
                <TextField
                  fullWidth
                  label="Department"
                  value={profileData.department}
                  onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
                  margin="normal"
                  disabled
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: 'rgba(15,23,42,0.9)',
                      color: 'rgba(148,163,184,0.9)',
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(148,163,184,0.9)',
                    },
                  }}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card
              sx={{
                bgcolor: 'rgba(15,23,42,0.96)',
                borderRadius: 3,
                border: '1px solid rgba(148,163,184,0.35)',
                boxShadow: '0 18px 45px rgba(15,23,42,0.7)',
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Lock sx={{ mr: 1, color: '#38bdf8' }} />
                  <Typography variant="h6" sx={{ color: '#e5e7eb', fontWeight: 600 }}>
                    Change Password
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2, borderColor: 'rgba(148,163,184,0.4)' }} />
                <TextField
                  fullWidth
                  label="Current Password"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  margin="normal"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: 'rgba(15,23,42,0.9)',
                      color: '#e5e7eb',
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(148,163,184,0.9)',
                    },
                  }}
                />
                <TextField
                  fullWidth
                  label="New Password"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  margin="normal"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: 'rgba(15,23,42,0.9)',
                      color: '#e5e7eb',
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(148,163,184,0.9)',
                    },
                  }}
                />
                <TextField
                  fullWidth
                  label="Confirm New Password"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  margin="normal"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: 'rgba(15,23,42,0.9)',
                      color: '#e5e7eb',
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(148,163,184,0.9)',
                    },
                  }}
                />
                <Button
                  variant="contained"
                  startIcon={<Lock />}
                  onClick={handleChangePassword}
                  sx={{
                    mt: 2,
                    background: 'linear-gradient(135deg, #38bdf8 0%, #6366f1 100%)',
                    boxShadow: '0 12px 32px rgba(37,99,235,0.65)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #0ea5e9 0%, #4f46e5 100%)',
                      boxShadow: '0 16px 42px rgba(37,99,235,0.85)',
                    },
                  }}
                  disabled={loading}
                >
                  Update Password
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card
              sx={{
                bgcolor: 'rgba(15,23,42,0.96)',
                borderRadius: 3,
                border: '1px solid rgba(148,163,184,0.35)',
                boxShadow: '0 18px 45px rgba(15,23,42,0.7)',
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Notifications sx={{ mr: 1, color: '#38bdf8' }} />
                  <Typography variant="h6" sx={{ color: '#e5e7eb', fontWeight: 600 }}>
                    Notification Preferences
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2, borderColor: 'rgba(148,163,184,0.4)' }} />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.emailNotifications}
                      onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                    />
                  }
                  label="Email Notifications"
                  sx={{ color: '#e5e7eb' }}
                />
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" sx={{ color: 'rgba(148,163,184,0.9)' }}>
                    Receive email notifications for important updates
                  </Typography>
                </Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.driveNotifications}
                      onChange={(e) => setSettings({ ...settings, driveNotifications: e.target.checked })}
                    />
                  }
                  label="New Drive Notifications"
                  sx={{ mt: 2, display: 'block', color: '#e5e7eb' }}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.applicationUpdates}
                      onChange={(e) => setSettings({ ...settings, applicationUpdates: e.target.checked })}
                    />
                  }
                  label="Application Status Updates"
                  sx={{ mt: 2, display: 'block', color: '#e5e7eb' }}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.studentNotifications}
                      onChange={(e) => setSettings({ ...settings, studentNotifications: e.target.checked })}
                    />
                  }
                  label="Student Activity Notifications"
                  sx={{ mt: 2, display: 'block', color: '#e5e7eb' }}
                />
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={handleSaveSettings}
                  sx={{
                    mt: 3,
                    background: 'linear-gradient(135deg, #38bdf8 0%, #6366f1 100%)',
                    boxShadow: '0 12px 32px rgba(37,99,235,0.65)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #0ea5e9 0%, #4f46e5 100%)',
                      boxShadow: '0 16px 42px rgba(37,99,235,0.85)',
                    },
                  }}
                  disabled={loading}
                >
                  Save Notification Settings
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </CoordinatorLayout>
  );
};

export default CoordinatorSettingsPage;

