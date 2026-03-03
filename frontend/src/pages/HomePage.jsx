import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import handshakeIllustration from '../assets/handshake-illustration.svg';
import {
  Box,
  Button,
  Container,
  Typography,
  Menu,
  MenuItem,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Grid,
  Chip,
} from '@mui/material';
import {
  Person,
  Business,
  Lock,
  ArrowDropDown,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';

const HomePage = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogin = (role) => {
    handleMenuClose();
    navigate('/login', { state: { role } });
  };

  const announcements = [
    { icon: '⚠️', text: 'Upcoming workshop on AI and ML!' },
    { icon: '⚠️', text: 'Admission open for 2025 batch!' },
    { icon: '⚠️', text: 'Placement training starts next week!' },
    { icon: '⚠️', text: 'Congrats to all students placed!' },
    { icon: '⚠️', text: 'In top companies!' },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        background:
          'radial-gradient(1200px circle at 10% 18%, rgba(56, 189, 248, 0.28) 0%, rgba(56, 189, 248, 0) 60%), radial-gradient(900px circle at 88% 14%, rgba(99, 102, 241, 0.32) 0%, rgba(99, 102, 241, 0) 58%), linear-gradient(180deg, #020617 0%, #020024 100%)',
        color: '#f9fafb',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          opacity: 0.95,
          background:
            'radial-gradient(900px 420px at 26% 26%, rgba(56, 189, 248, 0.18), rgba(56, 189, 248, 0) 62%), radial-gradient(820px 420px at 18% 8%, rgba(37, 99, 235, 0.24), rgba(37, 99, 235, 0) 64%), radial-gradient(780px 520px at 92% 16%, rgba(147, 51, 234, 0.2), rgba(147, 51, 234, 0) 64%), repeating-radial-gradient(circle at 14% 24%, rgba(129, 140, 248, 0.14) 0px, rgba(129, 140, 248, 0.14) 1px, rgba(15, 23, 42, 0) 20px, rgba(15, 23, 42, 0) 36px)',
        },
      }}
    >
      <Helmet>
        <title>IES Career Connect | Placement Portal</title>
        <meta
          name="description"
          content="IES Career Connect helps students explore placement drives, track applications, and connect with coordinators."
        />
      </Helmet>
      <AppBar
        position="static"
        sx={{
          background: 'rgba(2, 6, 23, 0.55)',
          backdropFilter: 'blur(10px)',
          boxShadow: 'none',
          borderBottom: '1px solid rgba(148, 163, 184, 0.18)',
        }}
      >
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Avatar
              sx={{
                width: 50,
                height: 50,
                bgcolor: 'rgba(250, 204, 21, 0.95)',
                color: '#0b1220',
                mr: 2,
                fontWeight: 800,
              }}
            >
              IES
            </Avatar>
            <Typography variant="h6" sx={{ color: '#f9fafb', fontWeight: 800, letterSpacing: 0.4 }}>
              IES COLLEGE OF ENGINEERING
            </Typography>
          </Box>
          <Button
            color="inherit"
            sx={{
              mr: 2,
              color: 'rgba(229, 231, 235, 0.9)',
              '&:hover': { bgcolor: 'rgba(148, 163, 184, 0.12)' },
            }}
            onClick={() => navigate('/')}
          >
            About Us
          </Button>
          <Button
            color="inherit"
            sx={{
              mr: 2,
              color: 'rgba(229, 231, 235, 0.9)',
              '&:hover': { bgcolor: 'rgba(148, 163, 184, 0.12)' },
            }}
            onClick={() => navigate('/contact')}
          >
            Contact
          </Button>
          {userInfo ? (
            <Button
              color="inherit"
              sx={{
                color: '#0b1220',
                fontWeight: 800,
                borderRadius: 999,
                px: 2.2,
                background:
                  'linear-gradient(135deg, rgba(250, 204, 21, 0.95) 0%, rgba(234, 179, 8, 0.95) 45%, rgba(249, 115, 22, 0.95) 100%)',
                '&:hover': {
                  background:
                    'linear-gradient(135deg, rgba(234, 179, 8, 0.98) 0%, rgba(249, 115, 22, 0.98) 65%, rgba(234, 88, 12, 0.98) 100%)',
                },
              }}
              onClick={() => navigate('/dashboard')}
            >
              Dashboard
            </Button>
          ) : (
            <>
              <Button
                color="inherit"
                endIcon={<ArrowDropDown />}
                onClick={handleMenuOpen}
                sx={{
                  color: '#0b1220',
                  fontWeight: 800,
                  borderRadius: 999,
                  px: 2.2,
                  background:
                    'linear-gradient(135deg, rgba(250, 204, 21, 0.95) 0%, rgba(234, 179, 8, 0.95) 45%, rgba(249, 115, 22, 0.95) 100%)',
                  '&:hover': {
                    background:
                      'linear-gradient(135deg, rgba(234, 179, 8, 0.98) 0%, rgba(249, 115, 22, 0.98) 65%, rgba(234, 88, 12, 0.98) 100%)',
                  },
                }}
              >
                Login
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{
                  sx: {
                    mt: 1,
                    borderRadius: 3,
                    bgcolor: 'rgba(2, 6, 23, 0.92)',
                    border: '1px solid rgba(148, 163, 184, 0.22)',
                    color: '#e5e7eb',
                    backdropFilter: 'blur(10px)',
                  },
                }}
              >
                <MenuItem onClick={() => handleLogin('STUDENT')}>
                  <Person sx={{ mr: 1 }} />
                  Student
                </MenuItem>
                <MenuItem onClick={() => handleLogin('DEPT_COORDINATOR')}>
                  <Business sx={{ mr: 1 }} />
                  Coordinator
                </MenuItem>
                <MenuItem onClick={() => handleLogin('ADMIN')}>
                  <Lock sx={{ mr: 1 }} />
                  Admin
                </MenuItem>
              </Menu>
            </>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 }, position: 'relative', zIndex: 1 }}>
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <Chip
              label="Placement & Career Portal"
              sx={{
                mb: 2,
                px: 1.5,
                bgcolor: 'rgba(37, 99, 235, 0.22)',
                color: 'rgba(229, 231, 235, 0.92)',
                border: '1px solid rgba(129, 140, 248, 0.35)',
                fontWeight: 700,
              }}
            />

            <Typography
              variant="h3"
              sx={{
                fontWeight: 900,
                lineHeight: 1.08,
                letterSpacing: 1.2,
                textTransform: 'uppercase',
                mb: 2,
                fontSize: { xs: '2.2rem', sm: '2.6rem', md: '3.2rem' },
              }}
            >
              <Box component="span" sx={{ display: 'block', color: 'rgba(229, 231, 235, 0.92)' }}>
                Welcome to
              </Box>
              <Box component="span" sx={{ color: '#facc15' }}>
                IES
              </Box>{' '}
              <Box component="span" sx={{ color: 'rgba(229, 231, 235, 0.92)' }}>
                Career Connect!
              </Box>
            </Typography>

            <Typography
              variant="body1"
              sx={{
                mb: 4,
                lineHeight: 1.9,
                color: 'rgba(203, 213, 225, 0.95)',
                maxWidth: 560,
                fontSize: { xs: '1rem', md: '1.1rem' },
              }}
            >
              We Guide students to their dream careers by assisting them in finding the right job offer for their career.
            </Typography>

            <Button
              variant="contained"
              size="large"
              sx={{
                px: 4,
                py: 1.4,
                borderRadius: 999,
                fontWeight: 800,
                letterSpacing: 0.3,
                color: '#0b1220',
                background:
                  'linear-gradient(135deg, rgba(250, 204, 21, 0.95) 0%, rgba(234, 179, 8, 0.95) 45%, rgba(249, 115, 22, 0.95) 100%)',
                boxShadow: '0 18px 46px rgba(234, 179, 8, 0.25)',
                '&:hover': {
                  background:
                    'linear-gradient(135deg, rgba(234, 179, 8, 0.98) 0%, rgba(249, 115, 22, 0.98) 65%, rgba(234, 88, 12, 0.98) 100%)',
                  boxShadow: '0 24px 70px rgba(234, 179, 8, 0.35)',
                },
              }}
              onClick={() => navigate(userInfo ? '/dashboard' : '/register')}
            >
              Explore
            </Button>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box
              sx={{
                position: 'relative',
                borderRadius: 6,
                p: { xs: 3, md: 4 },
                bgcolor: 'rgba(2, 6, 23, 0.55)',
                border: '1px solid rgba(148, 163, 184, 0.22)',
                boxShadow: '0 24px 80px rgba(2, 6, 23, 0.65)',
                overflow: 'hidden',
                minHeight: { xs: 280, md: 360 },
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    'radial-gradient(400px circle at 70% 30%, rgba(168, 85, 247, 0.22), rgba(168, 85, 247, 0) 60%), radial-gradient(420px circle at 30% 70%, rgba(34, 211, 238, 0.18), rgba(34, 211, 238, 0) 60%)',
                  opacity: 1,
                }}
              />
              <Box sx={{ position: 'relative', zIndex: 1, height: '100%', display: 'grid', placeItems: 'center' }}>
                <Box
                  component="img"
                  src={handshakeIllustration}
                  alt="Handshake illustration"
                  sx={{
                    width: { xs: '100%', md: '110%' },
                    maxWidth: 560,
                    height: 'auto',
                    filter: 'drop-shadow(0 22px 60px rgba(2, 6, 23, 0.55))',
                    transform: { xs: 'scale(1.0)', md: 'scale(1.05)' },
                    userSelect: 'none',
                    pointerEvents: 'none',
                  }}
                />
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Announcement Ticker */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          bgcolor: 'rgba(2, 6, 23, 0.78)',
          color: 'rgba(229, 231, 235, 0.92)',
          borderTop: '1px solid rgba(148, 163, 184, 0.18)',
          py: 1,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            animation: 'scroll 30s linear infinite',
            '@keyframes scroll': {
              '0%': { transform: 'translateX(100%)' },
              '100%': { transform: 'translateX(-100%)' },
            },
          }}
        >
          {announcements.map((announcement, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                alignItems: 'center',
                mx: 4,
                whiteSpace: 'nowrap',
              }}
            >
              <Typography sx={{ mr: 1, fontSize: '1.2rem' }}>{announcement.icon}</Typography>
              <Typography>{announcement.text}</Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default HomePage;

