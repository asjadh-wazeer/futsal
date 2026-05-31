import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { customerApi } from '../../services/api';

interface CustomerAuthState {
  token: string | null;
  customer: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: CustomerAuthState = {
  token: localStorage.getItem('customer_token'),
  customer: JSON.parse(localStorage.getItem('customer_data') || 'null'),
  loading: false,
  error: null,
};

export const customerRegister = createAsyncThunk(
  'customerAuth/register',
  async (data: { name: string; email?: string; phone?: string; password: string }, { rejectWithValue }) => {
    try {
      const res = await customerApi.register(data);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Registration failed');
    }
  },
);

export const customerLogin = createAsyncThunk(
  'customerAuth/login',
  async (data: { identifier: string; password: string }, { rejectWithValue }) => {
    try {
      const res = await customerApi.login(data);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Login failed');
    }
  },
);

export const fetchCustomerProfile = createAsyncThunk(
  'customerAuth/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const res = await customerApi.getProfile();
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch profile');
    }
  },
);

const customerAuthSlice = createSlice({
  name: 'customerAuth',
  initialState,
  reducers: {
    customerLogout(state) {
      state.token = null;
      state.customer = null;
      localStorage.removeItem('customer_token');
      localStorage.removeItem('customer_data');
    },
    setGoogleAuth(state, action) {
      state.token = action.payload.token;
      state.customer = action.payload.customer;
      localStorage.setItem('customer_token', action.payload.token);
      localStorage.setItem('customer_data', JSON.stringify(action.payload.customer));
    },
    clearCustomerError(state) {
      state.error = null;
    },
    updateCustomerLocal(state, action) {
      state.customer = { ...state.customer, ...action.payload };
      localStorage.setItem('customer_data', JSON.stringify(state.customer));
    },
  },
  extraReducers: (builder) => {
    const handlePending = (state: CustomerAuthState) => { state.loading = true; state.error = null; };
    const handleFulfilled = (state: CustomerAuthState, action: any) => {
      state.loading = false;
      state.token = action.payload.access_token;
      state.customer = action.payload.customer;
      localStorage.setItem('customer_token', action.payload.access_token);
      localStorage.setItem('customer_data', JSON.stringify(action.payload.customer));
    };
    const handleRejected = (state: CustomerAuthState, action: any) => {
      state.loading = false;
      state.error = action.payload as string;
    };

    builder
      .addCase(customerRegister.pending, handlePending)
      .addCase(customerRegister.fulfilled, handleFulfilled)
      .addCase(customerRegister.rejected, handleRejected)
      .addCase(customerLogin.pending, handlePending)
      .addCase(customerLogin.fulfilled, handleFulfilled)
      .addCase(customerLogin.rejected, handleRejected)
      .addCase(fetchCustomerProfile.fulfilled, (state, action) => {
        state.customer = action.payload;
        localStorage.setItem('customer_data', JSON.stringify(action.payload));
      });
  },
});

export const { customerLogout, setGoogleAuth, clearCustomerError, updateCustomerLocal } = customerAuthSlice.actions;
export default customerAuthSlice.reducer;
