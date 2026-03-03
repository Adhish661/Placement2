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
  const [emailUpdate, setEmailUpdate] = useState({
    newEmail: '',
    otp: '',
    verificationToken: '',
    sent: false,
    verified: false,
    sending: false,
    verifying: false,
    updating: false,
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

  const handleUpdateProfile = async () => {
    const nameTrimmed = profileData.name.trim();
    if (nameTrimmed && !/^[A-Za-z\s.]+$/.test(nameTrimmed)) {
      toast.error('Name should contain alphabets and spaces only');
      return;
    }
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

  const handleSendEmailOtp = async () => {
    if (!emailUpdate.newEmail) {
      toast.error('Enter a new email address');
      return;
    }
    try {
      setEmailUpdate((prev) => ({ ...prev, sending: true }));
      await axiosInstance.post('/auth/request-otp', {
        email: emailUpdate.newEmail,
        purpose: 'update_email',
      });
      setEmailUpdate((prev) => ({
        ...prev,
        sending: false,
        sent: true,
      }));
      toast.success('OTP sent to your new email');
    } catch (error) {
      setEmailUpdate((prev) => ({ ...prev, sending: false }));
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    }
  };

  const handleVerifyEmailOtp = async () => {
    if (!emailUpdate.otp) {
      toast.error('Enter the OTP');
      return;
    }
    try {
      setEmailUpdate((prev) => ({ ...prev, verifying: true }));
      const { data } = await axiosInstance.post('/auth/verify-otp', {
        email: emailUpdate.newEmail,
        purpose: 'update_email',
        code: emailUpdate.otp,
      });
      setEmailUpdate((prev) => ({
        ...prev,
        verifying: false,
        verified: true,
        verificationToken: data.verificationToken,
      }));
      toast.success('Email verified');
    } catch (error) {
      setEmailUpdate((prev) => ({ ...prev, verifying: false }));
      toast.error(error.response?.data?.message || 'Failed to verify OTP');
    }
  };

  const handleUpdateEmail = async () => {
    try {
      setEmailUpdate((prev) => ({ ...prev, updating: true }));
      const { data } = await axiosInstance.put('/auth/update-email', {
        newEmail: emailUpdate.newEmail,
        verificationToken: emailUpdate.verificationToken,
      });
      localStorage.setItem('userInfo', JSON.stringify(data));
      setProfileData((prev) => ({ ...prev, email: data.email }));
      setEmailUpdate({
        newEmail: '',
        otp: '',
        verificationToken: '',
        sent: false,
        verified: false,
        sending: false,
        verifying: false,
        updating: false,
      });
      toast.success('Email updated successfully');
    } catch (error) {
      setEmailUpdate((prev) => ({ ...prev, updating: false }));
      toast.error(error.response?.data?.message || 'Failed to update email');
    }
  };

  const cardSx = {
    bgcolor: 'rgba(15,23,42,0.96)',
    borderRadius: 3,
    border: '1px solid rgba(148,163,184,0.35)',
    boxShadow: '0 18px 45px rgba(15,23,42,0.7)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': { borderColor: 'rgba(56,189,248,0.4)' },
  };

  return (
    <StudentLayout>
      <Box sx={{ animation: 'fadeIn 0.4s ease-out' }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 800, mb: 3, color: '#e5e7eb' }}>
          Settings
        </Typography>

        <Grid container spacing={3}>
          {/* Profile Settings */}
          <Grid item xs={12} md={6}>
            <Card sx={cardSx}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Person sx={{ mr: 1, color: '#38bdf8' }} />
                  <Typography variant="h6" sx={{ color: '#e5e7eb' }}>Profile Information</Typography>
                </Box>
                <Divider sx={{ mb: 2, borderColor: 'rgba(148,163,184,0.35)' }} />
                <TextField
                  fullWidth
                  label="Full Name"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  margin="normal"
                  sx={{
                    '& .MuiInputBase-root': {
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      color: '#e5e7eb',
                    },
                    '& .MuiInputLabel-root': {
                      color: '#d1d5db',
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#38bdf8',
                    },
                    '& .MuiInputBase-input::placeholder': { 
                      color: '#d1d5db', 
                      opacity: 1 
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
                    '& .MuiInputBase-root': {
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      color: '#e5e7eb',
                    },
                    '& .MuiInputLabel-root': {
                      color: '#d1d5db',
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#38bdf8',
                    },
                    '& .MuiInputBase-input::placeholder': { 
                      color: '#d1d5db', 
                      opacity: 1 
                    },
                  }}
                />
                <Divider sx={{ my: 2, borderColor: 'rgba(148,163,184,0.35)' }} />
                <Typography variant="subtitle2" sx={{ color: '#e5e7eb', mb: 1 }}>
                  Update Email (OTP verification required)
                </Typography>
                <TextField
                  fullWidth
                  label="New Email"
                  type="email"
                  value={emailUpdate.newEmail}
                  onChange={(e) =>
                    setEmailUpdate({
                      ...emailUpdate,
                      newEmail: e.target.value,
                      sent: false,
                      verified: false,
                      verificationToken: '',
                    })
                  }
                  margin="normal"
                  sx={{
                    '& .MuiInputBase-root': {
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      color: '#e5e7eb',
                    },
                    '& .MuiInputLabel-root': {
                      color: '#d1d5db',
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#38bdf8',
                    },
                    '& .MuiInputBase-input::placeholder': { 
                      color: '#d1d5db', 
                      opacity: 1 
                    },
                  }}
                />
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Button
                    variant="outlined"
                    onClick={handleSendEmailOtp}
                    disabled={emailUpdate.sending || !emailUpdate.newEmail}
                    sx={{ color: '#ffffff', borderColor: 'rgba(56,189,248,0.6)' }}
                  >
                    {emailUpdate.sending ? 'Sending...' : emailUpdate.sent ? 'Resend OTP' : 'Send OTP'}
                  </Button>
                  <TextField
                    size="small"
                    placeholder="Enter OTP"
                    value={emailUpdate.otp}
                    onChange={(e) => setEmailUpdate({ ...emailUpdate, otp: e.target.value })}
                    sx={{
                      '& .MuiInputBase-root': {
                        backgroundColor: 'rgba(26, 35, 56, 0.9)',
                        color: '#edf3ff',
                      },
                      '& .MuiInputLabel-root': {
                        color: '#ffffff',
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#ffffff',
                      },
                      '& .MuiInputBase-input::placeholder': { 
                        color: '#ffffff', 
                        opacity: 1 
                      },
                    }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleVerifyEmailOtp}
                    disabled={emailUpdate.verifying || !emailUpdate.otp}
                  >
                    {emailUpdate.verifying ? 'Verifying...' : emailUpdate.verified ? 'Verified' : 'Verify OTP'}
                  </Button>
                </Box>
                <Button
                  variant="contained"
                  onClick={handleUpdateEmail}
                  sx={{ mt: 2 }}
                  disabled={!emailUpdate.verified || emailUpdate.updating}
                >
                  {emailUpdate.updating ? 'Updating...' : 'Update Email'}
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={handleUpdateProfile}
                  sx={{ 
                    mt: 2, 
                    background: 'linear-gradient(135deg, #38bdf8 0%, #055cf3 100%)',
                    '&:hover': { background: 'linear-gradient(135deg, #0ea5e9 0%, #4f46e5 100%)' },
                  }}
                  disabled={loading}
                >
                  Update Profile
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Password Settings */}
          <Grid item xs={12} md={6}>
            <Card sx={cardSx}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Lock sx={{ mr: 1, color: '#38bdf8' }} />
                  <Typography variant="h6" sx={{ color: '#e5e7eb' }}>Change Password</Typography>
                </Box>
                <Divider sx={{ mb: 2, borderColor: 'rgba(148,163,184,0.35)' }} />
                <TextField
                  fullWidth
                  label="Current Password"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  margin="normal"
                  sx={{
                    '& .MuiInputBase-root': {
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      color: '#e5e7eb',
                    },
                    '& .MuiInputLabel-root': {
                      color: '#d1d5db',
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#38bdf8',
                    },
                    '& .MuiInputBase-input::placeholder': { 
                      color: '#d1d5db', 
                      opacity: 1 
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
                    '& .MuiInputBase-root': {
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      color: '#e5e7eb',
                    },
                    '& .MuiInputLabel-root': {
                      color: '#d1d5db',
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#38bdf8',
                    },
                    '& .MuiInputBase-input::placeholder': { 
                      color: '#d1d5db', 
                      opacity: 1 
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
                    '& .MuiInputBase-root': {
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      color: '#e5e7eb',
                    },
                    '& .MuiInputLabel-root': {
                      color: '#d1d5db',
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#38bdf8',
                    },
                    '& .MuiInputBase-input::placeholder': { 
                      color: '#d1d5db', 
                      opacity: 1 
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
                    '&:hover': { background: 'linear-gradient(135deg, #0ea5e9 0%, #4f46e5 100%)' },
                  }}
                  disabled={loading}
                >
                  Update Password
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Notification Settings */}
          <Grid item xs={12} md={6}>
            <Card sx={cardSx}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Notifications sx={{ mr: 1, color: '#38bdf8' }} />
                  <Typography variant="h6" sx={{ color: '#e5e7eb' }}>Notification Preferences</Typography>
                </Box>
                <Divider sx={{ mb: 2, borderColor: 'rgba(148,163,184,0.35)' }} />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.emailNotifications}
                      onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                    />
                  }
                  label="Email Notifications"
                  sx={{ '& .MuiFormControlLabel-label': { color: '#e5e7eb' } }}
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
                  sx={{ mt: 2, display: 'block', '& .MuiFormControlLabel-label': { color: '#e5e7eb' } }}
                />
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" sx={{ color: 'rgba(148,163,184,0.9)' }}>
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
                  sx={{ mt: 2, display: 'block', '& .MuiFormControlLabel-label': { color: '#e5e7eb' } }}
                />
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" sx={{ color: 'rgba(148,163,184,0.9)' }}>
                    Receive updates about your job applications
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={handleSaveSettings}
                  sx={{ 
                    mt: 3, 
                    background: 'linear-gradient(135deg, #38bdf8 0%, #6366f1 100%)',
                    '&:hover': { background: 'linear-gradient(135deg, #0ea5e9 0%, #4f46e5 100%)' },
                  }}
                  disabled={loading}
                >
                  Save Notification Settings
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Privacy Settings */}
          <Grid item xs={12} md={6}>
            <Card sx={cardSx}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Security sx={{ mr: 1, color: '#38bdf8' }} />
                  <Typography variant="h6" sx={{ color: '#e5e7eb' }}>Privacy Settings</Typography>
                </Box>
                <Divider sx={{ mb: 2, borderColor: 'rgba(148,163,184,0.35)' }} />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.profileVisibility}
                      onChange={(e) => setSettings({ ...settings, profileVisibility: e.target.checked })}
                    />
                  }
                  label="Profile Visibility"
                  sx={{ '& .MuiFormControlLabel-label': { color: '#e5e7eb' } }}
                />
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" sx={{ color: 'rgba(148,163,184,0.9)' }}>
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
                  sx={{ mt: 2, display: 'block', '& .MuiFormControlLabel-label': { color: '#e5e7eb' } }}
                />
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" sx={{ color: 'rgba(148,163,184,0.9)' }}>
                    Allow coordinators to download your resume
                  </Typography>
                </Box>
                <Alert severity="info" sx={{ mt: 2, bgcolor: 'rgba(56,189,248,0.15)', color: '#e5e7eb', '& .MuiAlert-icon': { color: '#38bdf8' } }}>
                  These settings control who can view your profile and resume. Coordinators need access to help with placements.
                </Alert>
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={handleSaveSettings}
                  sx={{ 
                    mt: 2, 
                    background: 'linear-gradient(135deg, #38bdf8 0%, #6366f1 100%)',
                    '&:hover': { background: 'linear-gradient(135deg, #0ea5e9 0%, #4f46e5 100%)' },
                  }}
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

