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
import FutsalDiscoveryPage from './pages/public/FutsalDiscoveryPage';
import AboutPage from './pages/public/AboutPage';
import PrivacyPolicyPage from './pages/public/PrivacyPolicyPage';

import AdminLoginPage from './pages/admin/AdminLoginPage';
import DashboardPage from './pages/admin/DashboardPage';
import BookingsPage from './pages/admin/BookingsPage';
import CourtsPage from './pages/admin/CourtsPage';
import CustomersPage from './pages/admin/CustomersPage';
import AnalyticsPage from './pages/admin/AnalyticsPage';
import BranchesPage from './pages/admin/BranchesPage';
import SettingsPage from './pages/admin/SettingsPage';
import OwnersPage from './pages/admin/OwnersPage';
import SettlementsPage from './pages/admin/SettlementsPage';

import OwnerLayout from './layouts/OwnerLayout';
import OwnerLoginPage from './pages/owner/OwnerLoginPage';
import OwnerRegisterPage from './pages/public/OwnerRegisterPage';
import OwnerDashboardPage from './pages/owner/OwnerDashboardPage';
import OwnerFutsalsPage from './pages/owner/OwnerFutsalsPage';
import OwnerCourtsPage from './pages/owner/OwnerCourtsPage';
import OwnerBookingsPage from './pages/owner/OwnerBookingsPage';
import OwnerAnalyticsPage from './pages/owner/OwnerAnalyticsPage';
import OwnerStaffPage from './pages/owner/OwnerStaffPage';
import OwnerSettlementsPage from './pages/owner/OwnerSettlementsPage';

import StaffLayout from './layouts/StaffLayout';
import StaffLoginPage from './pages/staff/StaffLoginPage';
import StaffDashboardPage from './pages/staff/StaffDashboardPage';
import StaffBookingsPage from './pages/staff/StaffBookingsPage';

function AdminRoute({ children }: { children: React.ReactNode }) {
  const token = useSelector((s: RootState) => s.auth.token);
  const admin = useSelector((s: RootState) => s.auth.admin);
  if (!token) return <Navigate to="/admin/login" replace />;
  if (admin?.role === 'OWNER') return <Navigate to="/owner" replace />;
  if (admin?.role === 'STAFF') return <Navigate to="/staff" replace />;
  return <>{children}</>;
}

function OwnerRoute({ children }: { children: React.ReactNode }) {
  const token = useSelector((s: RootState) => s.auth.token);
  const admin = useSelector((s: RootState) => s.auth.admin);
  if (!token) return <Navigate to="/owner/login" replace />;
  if (admin?.role === 'STAFF') return <Navigate to="/staff" replace />;
  return <>{children}</>;
}

function StaffRoute({ children }: { children: React.ReactNode }) {
  const token = useSelector((s: RootState) => s.auth.token);
  const admin = useSelector((s: RootState) => s.auth.admin);
  if (!token) return <Navigate to="/staff/login" replace />;
  if (admin?.role === 'OWNER') return <Navigate to="/owner" replace />;
  return <>{children}</>;
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
        <Route path="/futsals" element={<FutsalDiscoveryPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
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
        <Route path="owners" element={<OwnersPage />} />
        <Route path="settlements" element={<SettlementsPage />} />
      </Route>

      {/* Owner portal */}
      <Route path="/owner/login" element={<OwnerLoginPage />} />
      <Route path="/owner/register" element={<OwnerRegisterPage />} />
      <Route
        path="/owner"
        element={
          <OwnerRoute>
            <OwnerLayout />
          </OwnerRoute>
        }
      >
        <Route index element={<OwnerDashboardPage />} />
        <Route path="futsals" element={<OwnerFutsalsPage />} />
        <Route path="courts" element={<OwnerCourtsPage />} />
        <Route path="bookings" element={<OwnerBookingsPage />} />
        <Route path="analytics" element={<OwnerAnalyticsPage />} />
        <Route path="staff" element={<OwnerStaffPage />} />
        <Route path="settlements" element={<OwnerSettlementsPage />} />
      </Route>

      {/* Staff portal */}
      <Route path="/staff/login" element={<StaffLoginPage />} />
      <Route
        path="/staff"
        element={
          <StaffRoute>
            <StaffLayout />
          </StaffRoute>
        }
      >
        <Route index element={<StaffDashboardPage />} />
        <Route path="bookings" element={<StaffBookingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
