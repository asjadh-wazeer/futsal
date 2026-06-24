import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../services/api';

interface AuthState {
  token: string | null;
  admin: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  token: localStorage.getItem('admin_token'),
  admin: JSON.parse(localStorage.getItem('admin_data') || 'null'),
  loading: false,
  error: null,
};

export const login = createAsyncThunk('auth/login', async (credentials: { email: string; password: string }, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/login', credentials);
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Login failed');
  }
});

export const fetchProfile = createAsyncThunk('auth/fetchProfile', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/auth/me');
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch profile');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.token = null;
      state.admin = null;
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_data');
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.access_token;
        state.admin = action.payload.admin;
        localStorage.setItem('admin_token', action.payload.access_token);
        localStorage.setItem('admin_data', JSON.stringify(action.payload.admin));
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.admin = action.payload;
        localStorage.setItem('admin_data', JSON.stringify(action.payload));
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
