import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { User, Phone, Mail, Calendar, TrendingUp, Edit2, Save, X, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  fetchCustomerProfile,
  customerLogout,
  updateCustomerLocal,
} from '../../store/slices/customerAuthSlice';
import { RootState, AppDispatch } from '../../store';
import { customerApi } from '../../services/api';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Booking } from '../../types';
import dayjs from 'dayjs';

export default function ProfilePage() {
  const dispatch = useDispatch<AppDispatch>();
  const { token, customer, loading } = useSelector((s: RootState) => s.customerAuth);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', phone: '' });
  const [saving, setSaving] = useState(false);

  if (!token) return <Navigate to="/login" state={{ from: '/profile' }} replace />;

  useEffect(() => {
    dispatch(fetchCustomerProfile());
  }, []);

  useEffect(() => {
    if (customer) {
      setEditForm({ name: customer.name || '', phone: customer.phone || '' });
    }
  }, [customer]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await customerApi.updateProfile({ name: editForm.name, phone: editForm.phone || undefined });
      dispatch(updateCustomerLocal(editForm));
      dispatch(fetchCustomerProfile());
      setEditMode(false);
      toast.success('Profile updated');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading && !customer) return <LoadingSpinner size="lg" className="min-h-[60vh]" />;

  const bookings: Booking[] = customer?.bookings || [];
  const upcoming = bookings.filter((b) => b.status !== 'CANCELLED' && b.status !== 'COMPLETED' && dayjs(b.date).isAfter(dayjs().subtract(1, 'day')));
  const past = bookings.filter((b) => b.status === 'COMPLETED' || dayjs(b.date).isBefore(dayjs()));

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-5">
          <div className="w-20 h-20 rounded-2xl bg-brand-600 flex items-center justify-center text-white text-3xl font-bold shrink-0 overflow-hidden">
            {customer?.avatarUrl ? (
              <img src={customer.avatarUrl} alt={customer.name} className="w-full h-full object-cover" />
            ) : (
              customer?.name?.[0]?.toUpperCase() || 'U'
            )}
          </div>

          <div className="flex-1">
            {editMode ? (
              <div className="space-y-3">
                <div>
                  <label className="label">Full Name</label>
                  <input value={editForm.name} onChange={(e) => setEditForm(f => ({ ...f, name: e.target.value }))} className="input-field" />
                </div>
                <div>
                  <label className="label">Phone Number</label>
                  <input value={editForm.phone} onChange={(e) => setEditForm(f => ({ ...f, phone: e.target.value }))} placeholder="+94 77 123 4567" className="input-field" />
                </div>
                <div className="flex gap-2">
                  <button onClick={handleSave} disabled={saving} className="btn-primary text-sm py-2">
                    <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button onClick={() => setEditMode(false)} className="btn-secondary text-sm py-2">
                    <X className="w-4 h-4" /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{customer?.name}</h2>
                    {customer?.googleId && (
                      <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-medium">Google Account</span>
                    )}
                  </div>
                  <button onClick={() => setEditMode(true)} className="btn-ghost text-sm py-1.5 px-3">
                    <Edit2 className="w-4 h-4" /> Edit
                  </button>
                </div>
                <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
                  {customer?.email && (
                    <span className="flex items-center gap-1.5"><Mail className="w-4 h-4 text-brand-500" />{customer.email}</span>
                  )}
                  {customer?.phone && (
                    <span className="flex items-center gap-1.5"><Phone className="w-4 h-4 text-brand-500" />{customer.phone}</span>
                  )}
                  {!customer?.phone && (
                    <button onClick={() => setEditMode(true)} className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-lg font-medium hover:bg-amber-100 transition-colors">
                      + Add phone number for bookings
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-5 border-t border-gray-100">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">Total Bookings</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-brand-600">LKR {Number(customer?.totalSpent || 0).toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-0.5">Total Spent</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{upcoming.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">Upcoming</p>
          </div>
        </div>
      </div>

      {/* Upcoming Bookings */}
      {upcoming.length > 0 && (
        <div className="card mb-6">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-brand-600" /> Upcoming Bookings
          </h3>
          <div className="space-y-3">
            {upcoming.map((b) => (
              <BookingCard key={b.id} booking={b} isUpcoming />
            ))}
          </div>
        </div>
      )}

      {/* Booking History */}
      <div className="card">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-gray-500" /> Booking History
        </h3>
        {bookings.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No bookings yet</p>
            <p className="text-gray-400 text-sm mt-1">Your booking history will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.slice(0, 15).map((b) => (
              <BookingCard key={b.id} booking={b} />
            ))}
          </div>
        )}
      </div>

      {/* Logout */}
      <div className="mt-6 text-center">
        <button
          onClick={() => dispatch(customerLogout())}
          className="flex items-center gap-2 mx-auto text-sm text-gray-500 hover:text-red-500 transition-colors"
        >
          <LogOut className="w-4 h-4" /> Sign out
        </button>
      </div>
    </div>
  );
}

function BookingCard({ booking: b, isUpcoming }: { booking: Booking; isUpcoming?: boolean }) {
  const sportIcon = b.court?.sport?.name?.includes('Football') ? '⚽' : b.court?.sport?.name?.includes('Cricket') ? '🏏' : '🏸';

  return (
    <div className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${isUpcoming ? 'border-brand-200 bg-brand-50' : 'border-gray-100 bg-gray-50'}`}>
      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-xl shadow-sm shrink-0">
        {sportIcon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-mono text-xs font-bold text-brand-600">{b.bookingRef}</span>
          <StatusBadge status={b.status} />
        </div>
        <p className="font-semibold text-gray-900 text-sm truncate">{b.court?.name}</p>
        <p className="text-xs text-gray-500">
          {dayjs(b.date).format('DD MMM YYYY')} · {b.startTime}–{b.endTime} · {b.branch?.name}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="font-bold text-gray-900 text-sm">LKR {Number(b.totalAmount).toLocaleString()}</p>
        <StatusBadge status={b.payment?.status || 'PENDING'} />
      </div>
    </div>
  );
}
