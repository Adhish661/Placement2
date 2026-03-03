import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Link,
} from '@mui/material';
import PublicNavbar from '../components/PublicNavbar';
import { ArrowBack } from '@mui/icons-material';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';

const ForgotPasswordPage = () => {
  const [step, setStep] = useState('email'); // 'email' or 'reset'
  const [emailInput, setEmailInput] = useState('');
  const [resetData, setResetData] = useState({
    email: '',
    code: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    
    if (!emailInput.trim()) {
      toast.error('Please enter your email');
      return;
    }

    setLoading(true);
    try {
      await axios.post('/api/auth/request-password-reset', {
        email: emailInput,
      });
      
      setResetData({
        ...resetData,
        email: emailInput,
      });
      setStep('reset');
      toast.success('OTP sent to your email');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!resetData.code.trim()) {
      toast.error('Please enter the OTP');
      return;
    }

    if (!resetData.newPassword.trim()) {
      toast.error('Please enter a new password');
      return;
    }

    if (resetData.newPassword !== resetData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (resetData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      await axios.post('/api/auth/reset-password', {
        email: resetData.email,
        code: resetData.code,
        newPassword: resetData.newPassword,
      });

      toast.success('Password reset successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setStep('email');
    setResetData({ email: '', code: '', newPassword: '', confirmPassword: '' });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at top left, #1d4ed8 0%, #020617 55%, #000000 100%)',
        color: '#e5e7eb',
      }}
    >
      <Helmet>
        <title>Forgot Password | IES Career Connect</title>
      </Helmet>
      <PublicNavbar />

      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper
          elevation={8}
          sx={{
            background: 'rgba(15, 23, 42, 0.9)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(148, 163, 184, 0.3)',
            borderRadius: 3,
            p: 4,
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              mb: 1,
              textAlign: 'center',
              color: '#e5e7eb',
            }}
          >
            Reset Password
          </Typography>

          <Typography
            variant="body2"
            sx={{
              textAlign: 'center',
              color: '#9ca3af',
              mb: 3,
            }}
          >
            {step === 'email'
              ? 'Enter your email to receive a password reset OTP'
              : 'Enter the OTP and your new password'}
          </Typography>

          {step === 'email' ? (
            <form onSubmit={handleRequestOtp}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                disabled={loading}
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    color: '#e5e7eb',
                    '& fieldset': { borderColor: '#4b5563' },
                    '&:hover fieldset': { borderColor: '#64748b' },
                    '&.Mui-focused fieldset': { borderColor: '#eab308' },
                  },
                  '& .MuiInputBase-input': { color: '#e5e7eb' },
                  '& .MuiInputBase-input::placeholder': { color: '#d1d5db', opacity: 1 },
                  '& .MuiInputLabel-root': { color: '#d1d5db' },
                  '& .MuiInputLabel-root.Mui-focused': { color: '#eab308' },
                }}
              />

              <Button
                fullWidth
                variant="contained"
                type="submit"
                disabled={loading}
                sx={{
                  background: 'linear-gradient(135deg, #facc15 0%, #eab308 50%, #f97316 100%)',
                  color: '#1f2937',
                  fontWeight: 600,
                  py: 1.5,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #eab308 0%, #facc15 50%, #ea580c 100%)',
                  },
                  '&:disabled': { color: '#6b7280' },
                }}
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </Button>

              <Link
                onClick={() => navigate('/login')}
                sx={{
                  display: 'block',
                  textAlign: 'center',
                  mt: 2,
                  cursor: 'pointer',
                  color: '#4facfe',
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                Back to Login
              </Link>
            </form>
          ) : (
            <form onSubmit={handleResetPassword}>
              <TextField
                fullWidth
                label="OTP Code"
                value={resetData.code}
                onChange={(e) =>
                  setResetData({ ...resetData, code: e.target.value })
                }
                disabled={loading}
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    color: '#e5e7eb',
                    '& fieldset': { borderColor: '#4b5563' },
                    '&:hover fieldset': { borderColor: '#64748b' },
                    '&.Mui-focused fieldset': { borderColor: '#eab308' },
                  },
                  '& .MuiInputBase-input': { color: '#e5e7eb' },
                  '& .MuiInputBase-input::placeholder': { color: '#d1d5db', opacity: 1 },
                  '& .MuiInputLabel-root': { color: '#d1d5db' },
                  '& .MuiInputLabel-root.Mui-focused': { color: '#eab308' },
                }}
              />

              <TextField
                fullWidth
                label="New Password"
                type="password"
                value={resetData.newPassword}
                onChange={(e) =>
                  setResetData({ ...resetData, newPassword: e.target.value })
                }
                disabled={loading}
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    color: '#e5e7eb',
                    '& fieldset': { borderColor: '#4b5563' },
                    '&:hover fieldset': { borderColor: '#64748b' },
                    '&.Mui-focused fieldset': { borderColor: '#eab308' },
                  },
                  '& .MuiInputBase-input': { color: '#e5e7eb' },
                  '& .MuiInputBase-input::placeholder': { color: '#d1d5db', opacity: 1 },
                  '& .MuiInputLabel-root': { color: '#d1d5db' },
                  '& .MuiInputLabel-root.Mui-focused': { color: '#eab308' },
                }}
              />

              <TextField
                fullWidth
                label="Confirm Password"
                type="password"
                value={resetData.confirmPassword}
                onChange={(e) =>
                  setResetData({ ...resetData, confirmPassword: e.target.value })
                }
                disabled={loading}
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    color: '#e5e7eb',
                    '& fieldset': { borderColor: '#4b5563' },
                    '&:hover fieldset': { borderColor: '#64748b' },
                    '&.Mui-focused fieldset': { borderColor: '#eab308' },
                  },
                  '& .MuiInputBase-input': { color: '#e5e7eb' },
                  '& .MuiInputBase-input::placeholder': { color: '#d1d5db', opacity: 1 },
                  '& .MuiInputLabel-root': { color: '#d1d5db' },
                  '& .MuiInputLabel-root.Mui-focused': { color: '#eab308' },
                }}
              />

              <Button
                fullWidth
                variant="contained"
                type="submit"
                disabled={loading}
                sx={{
                  background: 'linear-gradient(135deg, #facc15 0%, #eab308 50%, #f97316 100%)',
                  color: '#1f2937',
                  fontWeight: 600,
                  py: 1.5,
                  mb: 1,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #eab308 0%, #facc15 50%, #ea580c 100%)',
                  },
                  '&:disabled': { color: '#6b7280' },
                }}
              >
                {loading ? 'Resetting Password...' : 'Reset Password'}
              </Button>

              <Button
                fullWidth
                variant="outlined"
                onClick={handleBackToEmail}
                disabled={loading}
                startIcon={<ArrowBack />}
                sx={{
                  color: '#4facfe',
                  borderColor: '#4facfe',
                  '&:hover': {
                    backgroundColor: 'rgba(79, 172, 254, 0.1)',
                    borderColor: '#4facfe',
                  },
                }}
              >
                Back
              </Button>
            </form>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default ForgotPasswordPage;
