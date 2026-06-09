import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Admin auth token injector
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_data');
      if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  },
);

// Separate axios instance for customer auth (uses customer token)
export const customerApiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

customerApiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('customer_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

customerApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('customer_token');
      localStorage.removeItem('customer_data');
    }
    return Promise.reject(error);
  },
);

export const publicApi = {
  getBranches: (params?: { businessId?: string; search?: string; sportId?: string }) =>
    api.get('/branches', { params }),
  getBranch: (id: string) => api.get(`/branches/${id}`),
  getBranchSports: (branchId: string) => api.get(`/branches/${branchId}/sports`),
  getCourts: (params: { branchId?: string; sportId?: string }) => api.get('/courts', { params }),
  getCourt: (id: string) => api.get(`/courts/${id}`),
  getAvailability: (courtId: string, date: string) => api.get(`/courts/${courtId}/availability`, { params: { date } }),
  createBooking: (data: any) => api.post('/bookings', data),
  getBookingByRef: (ref: string) => api.get(`/bookings/ref/${ref}`),
  getPublicSettings: (slug: string) => api.get(`/business/public/${slug}`),
  getSports: () => api.get('/sports'),
};

export const customerApi = {
  register: (data: any) => api.post('/customer-auth/register', data),
  login: (data: any) => api.post('/customer-auth/login', data),
  getProfile: () => customerApiClient.get('/customer-auth/me'),
  updateProfile: (data: any) => customerApiClient.patch('/customer-auth/profile', data),
  googleLoginUrl: `${BASE_URL}/customer-auth/google`,
};

export const adminApi = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getRevenueChart: (period: string) => api.get('/analytics/revenue', { params: { period } }),
  getBookingStats: () => api.get('/analytics/bookings'),
  getTopCustomers: () => api.get('/analytics/top-customers'),

  getBookings: (params?: any) => api.get('/bookings', { params }),
  getTodayBookings: (branchId?: string) => api.get('/bookings/today', { params: { branchId } }),
  updateBookingStatus: (id: string, status: string) => api.patch(`/bookings/${id}/status`, { status }),
  createManualBooking: (data: any) => api.post('/bookings/manual', data),

  getBranches: () => api.get('/branches'),
  createBranch: (data: any) => api.post('/branches', data),
  updateBranch: (id: string, data: any) => api.patch(`/branches/${id}`, data),
  deleteBranch: (id: string) => api.delete(`/branches/${id}`),

  getSports: () => api.get('/sports'),
  createSport: (data: any) => api.post('/sports', data),
  updateSport: (id: string, data: any) => api.patch(`/sports/${id}`, data),

  getCourts: (params?: any) => api.get('/courts', { params }),
  createCourt: (data: any) => api.post('/courts', data),
  updateCourt: (id: string, data: any) => api.patch(`/courts/${id}`, data),
  deleteCourt: (id: string) => api.delete(`/courts/${id}`),

  getCustomers: (search?: string) => api.get('/customers', { params: { search } }),
  getCustomer: (id: string) => api.get(`/customers/${id}`),

  getBusiness: () => api.get('/business'),
  updateBusiness: (data: any) => api.patch('/business', data),

  confirmCashPayment: (bookingId: string) => api.post(`/payment/confirm-cash/${bookingId}`),
};

export const ownerApi = {
  getDashboard: () => api.get('/owner/dashboard'),
  getAnalytics: (params?: any) => api.get('/owner/analytics', { params }),

  getCourts: () => api.get('/owner/courts'),
  getCourt: (id: string) => api.get(`/owner/courts/${id}`),
  createCourt: (data: any) => api.post('/owner/courts', data),
  updateCourt: (id: string, data: any) => api.patch(`/owner/courts/${id}`, data),

  getPricingRules: (courtId: string) => api.get(`/owner/courts/${courtId}/pricing`),
  createPricingRule: (courtId: string, data: any) => api.post(`/owner/courts/${courtId}/pricing`, data),
  updatePricingRule: (courtId: string, ruleId: string, data: any) =>
    api.patch(`/owner/courts/${courtId}/pricing/${ruleId}`, data),
  deletePricingRule: (courtId: string, ruleId: string) =>
    api.delete(`/owner/courts/${courtId}/pricing/${ruleId}`),

  getSchedule: (courtId: string) => api.get(`/owner/courts/${courtId}/schedule`),
  upsertSchedule: (courtId: string, schedules: any[]) =>
    api.put(`/owner/courts/${courtId}/schedule`, { schedules }),

  getBookings: (params?: any) => api.get('/owner/bookings', { params }),
  updateBookingStatus: (id: string, status: string) =>
    api.patch(`/owner/bookings/${id}/status`, { status }),

  getBranches: () => api.get('/owner/branches'),
  createBranch: (data: any) => api.post('/owner/branches', data),
  updateBranch: (id: string, data: any) => api.patch(`/owner/branches/${id}`, data),
  getSports: () => api.get('/owner/sports'),

  createOwner: (data: any) => api.post('/owner/manage/owners', data),
  getOwners: () => api.get('/owner/manage/owners'),
  toggleOwnerStatus: (id: string) => api.patch(`/owner/manage/owners/${id}/toggle`),
  getBusinesses: () => api.get('/owner/manage/businesses'),
};
