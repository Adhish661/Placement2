import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App';
import { store } from './store/store';
import './index.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#4facfe',
      light: '#00f2fe',
      dark: '#3d8bfe',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#1e3a5f',
      light: '#2d4a6b',
      dark: '#152a47',
      contrastText: '#ffffff',
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
    text: {
      primary: '#1e3a5f',
      secondary: '#666666',
    },
    success: {
      main: '#4caf50',
      light: '#81c784',
      dark: '#388e3c',
    },
    error: {
      main: '#f44336',
      light: '#e57373',
      dark: '#d32f2f',
    },
    info: {
      main: '#4facfe',
      light: '#00f2fe',
      dark: '#3d8bfe',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      color: '#1e3a5f',
    },
    h2: {
      fontWeight: 700,
      color: '#1e3a5f',
    },
    h3: {
      fontWeight: 600,
      color: '#1e3a5f',
    },
    h4: {
      fontWeight: 600,
      color: '#1e3a5f',
    },
    h5: {
      fontWeight: 600,
      color: '#1e3a5f',
    },
    h6: {
      fontWeight: 600,
      color: '#1e3a5f',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [
    'none',
    '0 2px 8px rgba(0,0,0,0.1)',
    '0 4px 12px rgba(79, 172, 254, 0.2)',
    '0 6px 16px rgba(79, 172, 254, 0.3)',
    '0 8px 24px rgba(0,0,0,0.12)',
    '0 8px 32px rgba(0, 0, 0, 0.1)',
    '0 10px 40px rgba(0,0,0,0.15)',
    '0 12px 48px rgba(0,0,0,0.18)',
    '0 14px 56px rgba(0,0,0,0.2)',
    '0 16px 64px rgba(0,0,0,0.22)',
    '0 18px 72px rgba(0,0,0,0.24)',
    '0 20px 80px rgba(0,0,0,0.26)',
    '0 22px 88px rgba(0,0,0,0.28)',
    '0 24px 96px rgba(0,0,0,0.3)',
    '0 26px 104px rgba(0,0,0,0.32)',
    '0 28px 112px rgba(0,0,0,0.34)',
    '0 30px 120px rgba(0,0,0,0.36)',
    '0 32px 128px rgba(0,0,0,0.38)',
    '0 34px 136px rgba(0,0,0,0.4)',
    '0 36px 144px rgba(0,0,0,0.42)',
    '0 38px 152px rgba(0,0,0,0.44)',
    '0 40px 160px rgba(0,0,0,0.46)',
    '0 42px 168px rgba(0,0,0,0.48)',
    '0 44px 176px rgba(0,0,0,0.5)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 24px',
          fontWeight: 600,
          textTransform: 'none',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(79, 172, 254, 0.3)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          color: '#ffffff',
          '&:hover': {
            background: 'linear-gradient(135deg, #3d8bfe 0%, #00d4fe 100%)',
            boxShadow: '0 6px 16px rgba(79, 172, 254, 0.4)',
          },
        },
        outlined: {
          borderColor: '#4facfe',
          color: '#4facfe',
          '&:hover': {
            borderColor: '#3d8bfe',
            backgroundColor: 'rgba(79, 172, 254, 0.1)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '1px solid rgba(224, 224, 224, 0.5)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
        elevation2: {
          boxShadow: '0 4px 12px rgba(79, 172, 254, 0.2)',
        },
        elevation4: {
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#4facfe',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#4facfe',
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  </React.StrictMode>
);

