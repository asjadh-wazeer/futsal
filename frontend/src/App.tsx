import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from './store';

import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';

import HomePage from './pages/public/HomePage';
import BookingPage from './pages/public/BookingPage';
import BranchSelectPage from './pages/public/BranchSelectPage';
import CourtSelectPage from './pages/public/CourtSelectPage';
import SlotSelectPage from './pages/public/SlotSelectPage';
import CustomerDetailsPage from './pages/public/CustomerDetailsPage';
import ConfirmationPage from './pages/public/ConfirmationPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import GoogleCallbackPage from './pages/public/GoogleCallbackPage';
import ProfilePage from './pages/public/ProfilePage';

import AdminLoginPage from './pages/admin/AdminLoginPage';
import DashboardPage from './pages/admin/DashboardPage';
import BookingsPage from './pages/admin/BookingsPage';
import CourtsPage from './pages/admin/CourtsPage';
import CustomersPage from './pages/admin/CustomersPage';
import AnalyticsPage from './pages/admin/AnalyticsPage';
import BranchesPage from './pages/admin/BranchesPage';
import SettingsPage from './pages/admin/SettingsPage';

function AdminRoute({ children }: { children: React.ReactNode }) {
  const token = useSelector((s: RootState) => s.auth.token);
  return token ? <>{children}</> : <Navigate to="/admin/login" replace />;
}

export default function App() {
  return (
    <Routes>
      {/* Public / Customer routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />

        {/* Booking flow */}
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/booking/branch" element={<BranchSelectPage />} />
        <Route path="/booking/court" element={<CourtSelectPage />} />
        <Route path="/booking/slot" element={<SlotSelectPage />} />
        <Route path="/booking/details" element={<CustomerDetailsPage />} />
        <Route path="/booking/confirm/:ref" element={<ConfirmationPage />} />

        {/* Customer auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      {/* Google OAuth callback — no layout wrapper needed */}
      <Route path="/auth/callback" element={<GoogleCallbackPage />} />

      {/* Admin routes */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="bookings" element={<BookingsPage />} />
        <Route path="courts" element={<CourtsPage />} />
        <Route path="branches" element={<BranchesPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
