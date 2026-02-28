import { useEffect, useState } from 'react';
import StudentLayout from '../components/StudentLayout';
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

const SettingsPage = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    driveNotifications: true,
    applicationUpdates: true,
    profileVisibility: true,
    resumeVisibility: true,
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
      // In a real app, you'd fetch user settings from the backend
      // For now, we'll use localStorage or default values
      const savedSettings = localStorage.getItem('userSettings');
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
      // Save to localStorage (in a real app, save to backend)
      localStorage.setItem('userSettings', JSON.stringify(settings));
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

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
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

  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      // In a real app, update user profile via API
      toast.success('Profile information updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <StudentLayout>
      <Box>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
          Settings
        </Typography>

        <Grid container spacing={3}>
          {/* Profile Settings */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Person sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">Profile Information</Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <TextField
                  fullWidth
                  label="Full Name"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  margin="normal"
                  disabled
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
              </CardContent>
            </Card>
          </Grid>

          {/* Password Settings */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Lock sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">Change Password</Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <TextField
                  fullWidth
                  label="Current Password"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="New Password"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Confirm New Password"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  margin="normal"
                />
                <Button
                  variant="contained"
                  startIcon={<Lock />}
                  onClick={handleChangePassword}
                  sx={{ mt: 2 }}
                  disabled={loading}
                >
                  Update Password
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Notification Settings */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Notifications sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">Notification Preferences</Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.emailNotifications}
                      onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                    />
                  }
                  label="Email Notifications"
                />
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" color="text.secondary">
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
                  sx={{ mt: 2, display: 'block' }}
                />
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Get notified when new placement drives are available
                  </Typography>
                </Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.applicationUpdates}
                      onChange={(e) => setSettings({ ...settings, applicationUpdates: e.target.checked })}
                    />
                  }
                  label="Application Status Updates"
                  sx={{ mt: 2, display: 'block' }}
                />
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Receive updates about your job applications
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={handleSaveSettings}
                  sx={{ mt: 3 }}
                  disabled={loading}
                >
                  Save Notification Settings
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Privacy Settings */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Security sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">Privacy Settings</Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.profileVisibility}
                      onChange={(e) => setSettings({ ...settings, profileVisibility: e.target.checked })}
                    />
                  }
                  label="Profile Visibility"
                />
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Allow coordinators to view your profile
                  </Typography>
                </Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.resumeVisibility}
                      onChange={(e) => setSettings({ ...settings, resumeVisibility: e.target.checked })}
                    />
                  }
                  label="Resume Visibility"
                  sx={{ mt: 2, display: 'block' }}
                />
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Allow coordinators to download your resume
                  </Typography>
                </Box>
                <Alert severity="info" sx={{ mt: 2 }}>
                  These settings control who can view your profile and resume. Coordinators need access to help with placements.
                </Alert>
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={handleSaveSettings}
                  sx={{ mt: 2 }}
                  disabled={loading}
                >
                  Save Privacy Settings
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </StudentLayout>
  );
};

export default SettingsPage;

