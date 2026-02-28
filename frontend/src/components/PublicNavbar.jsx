import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
} from '@mui/material';
import { School } from '@mui/icons-material';

const PublicNavbar = ({ aboutUsRef, contactRef }) => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <AppBar 
      position="sticky" 
      sx={{ 
        background: 'rgba(255, 255, 255, 0.95)', 
        backdropFilter: 'blur(10px)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}
    >
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <School sx={{ fontSize: 40, color: '#4facfe', mr: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1e3a5f' }}>
            IES Career Connect
          </Typography>
        </Box>
        <Button
          onClick={() => scrollToSection(aboutUsRef)}
          sx={{ 
            color: '#1e3a5f', 
            fontWeight: 600,
            mr: 2,
            '&:hover': { 
              color: '#4facfe',
              backgroundColor: 'rgba(79, 172, 254, 0.1)',
            }
          }}
        >
          About Us
        </Button>
        <Button
          onClick={() => scrollToSection(contactRef)}
          sx={{ 
            color: '#1e3a5f', 
            fontWeight: 600,
            mr: 2,
            '&:hover': { 
              color: '#4facfe',
              backgroundColor: 'rgba(79, 172, 254, 0.1)',
            }
          }}
        >
          Contact
        </Button>
        {userInfo ? (
          <Button
            variant="contained"
            onClick={() => navigate('/dashboard')}
            sx={{
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #3d8bfe 0%, #00d4fe 100%)',
              }
            }}
          >
            Dashboard
          </Button>
        ) : (
          <>
            <Button
              variant="outlined"
              onClick={() => navigate('/login')}
              sx={{
                borderColor: '#4facfe',
                color: '#4facfe',
                mr: 2,
                '&:hover': {
                  borderColor: '#3d8bfe',
                  backgroundColor: 'rgba(79, 172, 254, 0.1)',
                }
              }}
            >
              Login
            </Button>
            <Button
              variant="contained"
              onClick={() => navigate('/register')}
              sx={{
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #3d8bfe 0%, #00d4fe 100%)',
                }
              }}
            >
              Register
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default PublicNavbar;

