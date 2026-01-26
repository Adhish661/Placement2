import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = '/api';

// Load user from localStorage
const userInfoFromStorage = localStorage.getItem('userInfo')
  ? JSON.parse(localStorage.getItem('userInfo'))
  : null;

const initialState = {
  userInfo: userInfoFromStorage,
  loading: false,
  error: null,
};

// Login
export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await axios.post(`${API_URL}/auth/login`, credentials);
    localStorage.setItem('userInfo', JSON.stringify(data));
    return data;
  } catch (error) {
    return rejectWithValue(
      error.response?.data?.message || error.message || 'Login failed'
    );
  }
});

// Register
export const register = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const { data } = await axios.post(`${API_URL}/auth/register`, userData);
    localStorage.setItem('userInfo', JSON.stringify(data));
    return data;
  } catch (error) {
    return rejectWithValue(
      error.response?.data?.message || error.message || 'Registration failed'
    );
  }
});

// Get current user
export const getMe = createAsyncThunk('auth/getMe', async (_, { rejectWithValue, getState }) => {
  try {
    const {
      auth: { userInfo },
    } = getState();
    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };
    const { data } = await axios.get(`${API_URL}/auth/me`, config);
    return data;
  } catch (error) {
    return rejectWithValue(
      error.response?.data?.message || error.message || 'Failed to get user'
    );
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.userInfo = null;
      localStorage.removeItem('userInfo');
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = action.payload;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;

