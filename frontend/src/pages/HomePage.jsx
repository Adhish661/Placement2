import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from '@mui/material';
import {
  Person,
  Business,
  Lock,
  ArrowDropDown,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';

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
    { icon: '💡', text: 'Upcoming workshop on AI and ML!' },
    { icon: '🎓', text: 'Admission open for 2025 batch!' },
    { icon: '🚀', text: 'Placement training starts next week!' },
    { icon: '🏆', text: 'Congrats to all students placed!' },
    { icon: '🌟', text: 'In top companies!' },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <AppBar position="static" sx={{ background: 'transparent', boxShadow: 'none' }}>
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Avatar
              sx={{
                width: 50,
                height: 50,
                bgcolor: 'white',
                color: 'primary.main',
                mr: 2,
              }}
            >
              IES
            </Avatar>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
              IES COLLEGE OF ENGINEERING
            </Typography>
          </Box>
          <Button
            color="inherit"
            sx={{ mr: 2 }}
            onClick={() => navigate('/')}
          >
            About Us
          </Button>
          <Button
            color="inherit"
            sx={{ mr: 2 }}
            onClick={() => navigate('/contact')}
          >
            Contact
          </Button>
          {userInfo ? (
            <Button
              color="inherit"
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
              >
                Login
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
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

      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'center',
            justifyContent: 'space-between',
            color: 'white',
          }}
        >
          <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' }, mb: { xs: 4, md: 0 } }}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 'bold',
                mb: 3,
                fontSize: { xs: '2.5rem', md: '3.5rem' },
              }}
            >
              WELCOME TO IES CAREER CONNECT!
            </Typography>
            <Typography
              variant="h6"
              sx={{
                mb: 4,
                lineHeight: 1.8,
                opacity: 0.9,
                fontSize: { xs: '1rem', md: '1.25rem' },
              }}
            >
              This platform is designed to streamline the placement process for students and
              placement cell at IES. For students it offers an easy way to explore job
              opportunities, track applications and stay updated on campus placements. Join us in
              shaping your career journey!
            </Typography>
            <Button
              variant="contained"
              size="large"
              sx={{
                bgcolor: 'white',
                color: 'primary.main',
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.9)',
                },
              }}
              onClick={() => navigate(userInfo ? '/dashboard' : '/register')}
            >
              Explore Opportunities
            </Button>
          </Box>
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Box
              sx={{
                width: 300,
                height: 300,
                borderRadius: '50%',
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '8rem',
              }}
            >
              🤝
            </Box>
          </Box>
        </Box>
      </Container>

      {/* Announcement Ticker */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          bgcolor: '#dc2626',
          color: 'white',
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

