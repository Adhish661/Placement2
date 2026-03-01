import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Link,
  Grid,
  Card,
  CardContent,
  Chip,
  Avatar,
} from '@mui/material';
import PublicNavbar from '../components/PublicNavbar';
import {
  Business,
  People,
  TrendingUp,
  School,
  Work,
  CheckCircle,
  Email,
  Phone,
  LocationOn,
} from '@mui/icons-material';
import { register, clearError } from '../store/slices/authSlice';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [otpState, setOtpState] = useState({
    sent: false,
    code: '',
    verified: false,
    token: '',
    sending: false,
    verifying: false,
    email: '',
  });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userInfo, loading, error } = useSelector((state) => state.auth);
  const aboutUsRef = useRef(null);
  const contactRef = useRef(null);

  useEffect(() => {
    if (userInfo) {
      navigate('/dashboard');
    }
  }, [userInfo, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!otpState.verified) {
      toast.error('Please verify your email with OTP');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    dispatch(register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      verificationToken: otpState.token,
    }));
  };

  const handleChange = (e) => {
    if (e.target.name === 'email') {
      const nextEmail = e.target.value;
      if (otpState.email && otpState.email !== nextEmail) {
        setOtpState({
          sent: false,
          code: '',
          verified: false,
          token: '',
          sending: false,
          verifying: false,
          email: '',
        });
      }
    }
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSendOtp = async () => {
    if (!formData.email) {
      toast.error('Please enter your email');
      return;
    }
    try {
      setOtpState((prev) => ({ ...prev, sending: true }));
      await axios.post('/api/auth/request-otp', {
        email: formData.email,
        purpose: 'register',
      });
      setOtpState((prev) => ({
        ...prev,
        sent: true,
        sending: false,
        email: formData.email,
      }));
      toast.success('OTP sent to your email');
    } catch (error) {
      setOtpState((prev) => ({ ...prev, sending: false }));
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpState.code) {
      toast.error('Please enter the OTP');
      return;
    }
    try {
      setOtpState((prev) => ({ ...prev, verifying: true }));
      const { data } = await axios.post('/api/auth/verify-otp', {
        email: formData.email,
        purpose: 'register',
        code: otpState.code,
      });
      setOtpState((prev) => ({
        ...prev,
        verified: true,
        verifying: false,
        token: data.verificationToken,
      }));
      toast.success('Email verified successfully');
    } catch (error) {
      setOtpState((prev) => ({ ...prev, verifying: false }));
      toast.error(error.response?.data?.message || 'Failed to verify OTP');
    }
  };


  const companies = ['TCS', 'Infosys', 'Wipro', 'Accenture', 'Microsoft', 'Google', 'Amazon', 'IBM', 'Cognizant', 'Tech Mahindra'];
  const coordinators = [
    { name: 'Dr. Rajesh Kumar', dept: 'CSE' },
    { name: 'Dr. Priya Sharma', dept: 'ECE' },
    { name: 'Dr. Amit Singh', dept: 'EEE' },
    { name: 'Dr. Neha Patel', dept: 'ME' },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at top left, #1d4ed8 0%, #020617 55%, #000000 100%)',
        color: '#e5e7eb',
      }}
    >
      <Helmet>
        <title>Register | IES Career Connect</title>
        <meta
          name="description"
          content="Register as a student to access placement drives, recruiter updates, and coordinator support."
        />
      </Helmet>
      {/* Navbar */}
      <PublicNavbar aboutUsRef={aboutUsRef} contactRef={contactRef} />

      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* Hero + Register Section */}
        <Grid container spacing={4} alignItems="center" sx={{ mb: 6 }}>
          {/* Hero content */}
          <Grid item xs={12} md={7}>
            <Box sx={{ maxWidth: 520 }}>
              <Chip
                label="Student Registration"
                sx={{
                  mb: 2,
                  px: 2,
                  py: 0.5,
                  borderRadius: 999,
                  bgcolor: 'rgba(37, 99, 235, 0.3)',
                  color: '#e5e7eb',
                  border: '1px solid rgba(129, 140, 248, 0.6)',
                  fontWeight: 600,
                  letterSpacing: 0.2,
                }}
              />
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  mb: 1.5,
                  color: '#f9fafb',
                  textTransform: 'uppercase',
                  letterSpacing: 1.5,
                }}
              >
                Start your placement journey with confidence
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: '#cbd5f5',
                  mb: 3,
                  fontSize: '1.05rem',
                  lineHeight: 1.8,
                }}
              >
                Join IES Career Connect to access placement drives, recruiter updates, and coordinator support—all in one place.
              </Typography>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={4}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      bgcolor: 'rgba(15, 23, 42, 0.9)',
                      border: '1px solid rgba(59, 130, 246, 0.6)',
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ color: '#facc15', fontWeight: 700, mb: 0.5 }}>
                      Profile
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#e5e7eb' }}>
                      Build a strong student profile for recruiters.
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      bgcolor: 'rgba(15, 23, 42, 0.9)',
                      border: '1px solid rgba(59, 130, 246, 0.6)',
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ color: '#facc15', fontWeight: 700, mb: 0.5 }}>
                      Drives
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#e5e7eb' }}>
                      Apply to drives and track your progress.
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      bgcolor: 'rgba(15, 23, 42, 0.9)',
                      border: '1px solid rgba(59, 130, 246, 0.6)',
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ color: '#facc15', fontWeight: 700, mb: 0.5 }}>
                      Updates
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#e5e7eb' }}>
                      Real-time notifications for opportunities.
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Grid>

          {/* Register card */}
          <Grid item xs={12} md={5}>
            <Paper
              elevation={12}
              sx={{
                p: 4,
                borderRadius: 4,
                bgcolor: 'rgba(15, 23, 42, 0.98)',
                border: '1px solid rgba(148, 163, 184, 0.4)',
                boxShadow: '0 24px 80px rgba(15, 23, 42, 0.9)',
              }}
            >
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Avatar
                  sx={{
                    mx: 'auto',
                    mb: 1.5,
                    bgcolor: '#facc15',
                    width: 56,
                    height: 56,
                  }}
                >
                  <School sx={{ color: '#0f172a' }} />
                </Avatar>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#f9fafb', mb: 0.5 }}>
                  Student Registration
                </Typography>
                <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                  Join IES Career Connect and start your journey to success
                </Typography>
              </Box>

              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="name"
                  label="Full Name"
                  name="name"
                  autoComplete="name"
                  autoFocus
                  value={formData.name}
                  onChange={handleChange}
                  sx={{
                    '& .MuiInputBase-root': {
                      bgcolor: 'rgba(15, 23, 42, 0.9)',
                      color: '#e5e7eb',
                    },
                    '& .MuiInputLabel-root': {
                      color: '#9ca3af',
                    },
                  }}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  sx={{
                    '& .MuiInputBase-root': {
                      bgcolor: 'rgba(15, 23, 42, 0.9)',
                      color: '#e5e7eb',
                    },
                    '& .MuiInputLabel-root': {
                      color: '#9ca3af',
                    },
                  }}
                />
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Button
                    variant="outlined"
                    onClick={handleSendOtp}
                    disabled={otpState.sending || !formData.email}
                    sx={{
                      color: '#facc15',
                      borderColor: 'rgba(250, 204, 21, 0.6)',
                      '&:hover': { borderColor: '#fde68a', bgcolor: 'rgba(250,204,21,0.1)' },
                    }}
                  >
                    {otpState.sending ? 'Sending...' : otpState.sent ? 'Resend OTP' : 'Send OTP'}
                  </Button>
                  <TextField
                    size="small"
                    placeholder="Enter OTP"
                    value={otpState.code}
                    onChange={(e) => setOtpState((prev) => ({ ...prev, code: e.target.value }))}
                    sx={{
                      flex: 1,
                      '& .MuiInputBase-root': {
                        bgcolor: 'rgba(15, 23, 42, 0.9)',
                        color: '#e5e7eb',
                      },
                      '& .MuiInputBase-input::placeholder': { color: '#9ca3af', opacity: 1 },
                    }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleVerifyOtp}
                    disabled={otpState.verifying || !otpState.code}
                    sx={{
                      background: 'linear-gradient(135deg, #38bdf8 0%, #6366f1 100%)',
                      '&:hover': { background: 'linear-gradient(135deg, #0ea5e9 0%, #4f46e5 100%)' },
                    }}
                  >
                    {otpState.verifying ? 'Verifying...' : otpState.verified ? 'Verified' : 'Verify'}
                  </Button>
                </Box>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  sx={{
                    '& .MuiInputBase-root': {
                      bgcolor: 'rgba(15, 23, 42, 0.9)',
                      color: '#e5e7eb',
                    },
                    '& .MuiInputLabel-root': {
                      color: '#9ca3af',
                    },
                  }}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Confirm Password"
                  type="password"
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  sx={{
                    '& .MuiInputBase-root': {
                      bgcolor: 'rgba(15, 23, 42, 0.9)',
                      color: '#e5e7eb',
                    },
                    '& .MuiInputLabel-root': {
                      color: '#9ca3af',
                    },
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{
                    mt: 3,
                    mb: 2,
                    py: 1.4,
                    background:
                      'linear-gradient(135deg, #facc15 0%, #eab308 50%, #f97316 100%)',
                    color: '#111827',
                    fontWeight: 700,
                    borderRadius: 999,
                    textTransform: 'none',
                    letterSpacing: 0.4,
                    '&:hover': {
                      background:
                        'linear-gradient(135deg, #eab308 0%, #f97316 60%, #ea580c 100%)',
                      boxShadow: '0 16px 40px rgba(234, 179, 8, 0.45)',
                    },
                  }}
                  disabled={loading || !otpState.verified}
                >
                  {loading ? 'Registering...' : 'Register'}
                </Button>

                <Box textAlign="center" mt={1}>
                  <Link
                    component="button"
                    variant="body2"
                    onClick={() => navigate('/login')}
                    sx={{
                      cursor: 'pointer',
                      color: '#facc15',
                      fontWeight: 'bold',
                      '&:hover': { color: '#fde68a' },
                    }}
                  >
                    Already have an account? Login here
                  </Link>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Information Section */}
        <Box>
          {/* Top Recruiters - Full Width */}
          <Card sx={{ mb: 3, boxShadow: 4, borderRadius: 3, background: 'rgba(255, 255, 255, 0.95)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Business sx={{ fontSize: 40, color: '#4facfe', mr: 2 }} />
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1e3a5f' }}>
                  Top Recruiters
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 2 }}>
                {companies.map((company, index) => (
                  <Chip
                    key={index}
                    icon={<CheckCircle />}
                    label={company}
                    sx={{
                      bgcolor: 'rgba(79, 172, 254, 0.1)',
                      color: '#4facfe',
                      fontWeight: 'bold',
                      '&:hover': {
                        bgcolor: 'rgba(79, 172, 254, 0.2)',
                      }
                    }}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>

          {/* Placement Coordinators - Grid Layout */}
          <Card sx={{ mb: 3, boxShadow: 4, borderRadius: 3, background: 'rgba(255, 255, 255, 0.95)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <People sx={{ fontSize: 40, color: '#4facfe', mr: 2 }} />
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1e3a5f' }}>
                  Placement Coordinators
                </Typography>
              </Box>
              <Grid container spacing={2}>
                {coordinators.map((coord, index) => (
                  <Grid item xs={6} sm={3} key={index}>
                    <Box sx={{ textAlign: 'center', p: 2, borderRadius: 2, bgcolor: 'rgba(79, 172, 254, 0.1)' }}>
                      <Avatar sx={{ mx: 'auto', mb: 1, bgcolor: '#4facfe' }}>
                        {coord.name.charAt(0)}
                      </Avatar>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {coord.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {coord.dept} Dept
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>

          {/* Promotional Section - Full Width */}
          <Card sx={{ mb: 3, boxShadow: 4, borderRadius: 3, background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Why Choose IES Career Connect?
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'start', mb: 2 }}>
                    <CheckCircle sx={{ mr: 1, mt: 0.5 }} />
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        Expert Guidance
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Dedicated coordinators for each department
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'start', mb: 2 }}>
                    <CheckCircle sx={{ mr: 1, mt: 0.5 }} />
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        Top Companies
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Access to Fortune 500 companies
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'start' }}>
                    <CheckCircle sx={{ mr: 1, mt: 0.5 }} />
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        Career Support
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Resume building and interview preparation
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'start' }}>
                    <CheckCircle sx={{ mr: 1, mt: 0.5 }} />
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        Real-time Updates
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Get notified about new opportunities instantly
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>

        {/* About Us Section */}
        <Box ref={aboutUsRef} sx={{ mt: 6, mb: 4 }}>
          <Card sx={{ boxShadow: 4, borderRadius: 3, background: 'rgba(255, 255, 255, 0.95)' }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <School sx={{ fontSize: 50, color: '#4facfe', mr: 2 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1e3a5f' }}>
                  About Us
                </Typography>
              </Box>
              <Typography variant="body1" color="text.secondary" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
                IES College of Engineering is committed to providing excellent placement opportunities for our students. 
                We have a dedicated placement cell that works tirelessly to connect students with top-tier companies.
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
                Our mission is to bridge the gap between academic excellence and industry requirements, ensuring that 
                every student gets the best possible start to their professional career. With a strong network of 
                industry partners and experienced coordinators, we provide comprehensive support throughout the 
                placement process.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 3 }}>
                <Chip 
                  icon={<TrendingUp />} 
                  label="95% Placement Rate" 
                  sx={{ 
                    bgcolor: 'rgba(76, 175, 80, 0.1)', 
                    color: '#4caf50',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    py: 2.5,
                    px: 1
                  }} 
                />
                <Chip 
                  icon={<People />} 
                  label="500+ Students Placed" 
                  sx={{ 
                    bgcolor: 'rgba(79, 172, 254, 0.1)', 
                    color: '#4facfe',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    py: 2.5,
                    px: 1
                  }} 
                />
                <Chip 
                  icon={<Work />} 
                  label="100+ Companies" 
                  sx={{ 
                    bgcolor: 'rgba(0, 242, 254, 0.1)', 
                    color: '#00f2fe',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    py: 2.5,
                    px: 1
                  }} 
                />
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Contact Section */}
        <Box ref={contactRef} sx={{ mt: 4, mb: 4 }}>
          <Card sx={{ boxShadow: 4, borderRadius: 3, background: 'rgba(255, 255, 255, 0.95)' }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Email sx={{ fontSize: 50, color: '#4facfe', mr: 2 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1e3a5f' }}>
                  Contact Us
                </Typography>
              </Box>
              <Grid container spacing={4}>
                <Grid item xs={12} md={4}>
                  <Box sx={{ display: 'flex', alignItems: 'start', mb: 3 }}>
                    <LocationOn sx={{ fontSize: 30, color: '#4facfe', mr: 2, mt: 0.5 }} />
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1e3a5f', mb: 1 }}>
                        Address
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        IES College of Engineering<br />
                        123 Education Street<br />
                        City, State 12345<br />
                        India
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ display: 'flex', alignItems: 'start', mb: 3 }}>
                    <Phone sx={{ fontSize: 30, color: '#4facfe', mr: 2, mt: 0.5 }} />
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1e3a5f', mb: 1 }}>
                        Phone
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        +91 123 456 7890<br />
                        +91 987 654 3210
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ display: 'flex', alignItems: 'start', mb: 3 }}>
                    <Email sx={{ fontSize: 30, color: '#4facfe', mr: 2, mt: 0.5 }} />
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1e3a5f', mb: 1 }}>
                        Email
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        placement@iescollege.edu<br />
                        info@iescollege.edu
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </Box>
  );
};

export default RegisterPage;

