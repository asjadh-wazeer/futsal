import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, User, Phone, Mail, FileText, CheckCircle, LogIn, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { setCompletedBooking } from '../../store/slices/bookingSlice';
import { RootState } from '../../store';
import { publicApi } from '../../services/api';
import BookingSteps from '../../components/public/BookingSteps';
import dayjs from 'dayjs';

export default function CustomerDetailsPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selectedBranch, selectedCourt, selectedDate, selectedSlot, selectedSport } = useSelector((s: RootState) => s.booking);
  const { token: customerToken, customer } = useSelector((s: RootState) => s.customerAuth);

  const isLoggedIn = !!customerToken && !!customer;

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-fill from logged-in customer
  useEffect(() => {
    if (isLoggedIn && customer) {
      setForm((f) => ({
        ...f,
        name: customer.name || '',
        phone: customer.phone || '',
        email: customer.email || '',
      }));
    }
  }, [isLoggedIn, customer]);

  if (!selectedCourt || !selectedSlot) {
    navigate('/booking/slot');
    return null;
  }

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.phone.trim() || form.phone.length < 9) e.phone = 'Valid phone number required';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const res = await publicApi.createBooking({
        courtId: selectedCourt.id,
        date: dateToSend,
        startTime: selectedSlot.time,
        endTime: selectedSlot.endTime,
        customerName: form.name,
        customerPhone: form.phone,
        customerEmail: form.email || undefined,
        notes: form.notes || undefined,
        paymentMethod: 'CASH',
        sportId: selectedSport?.id || selectedCourt.sports?.[0]?.id,
      });
      dispatch(setCompletedBooking(res.data));
      navigate(`/booking/confirm/${res.data.bookingRef}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const dateToSend = selectedDate || dayjs().format('YYYY-MM-DD');
  const displayDate = dayjs(dateToSend).format('dddd, MMMM D, YYYY');

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <BookingSteps current={4} />

      <button onClick={() => navigate('/booking/slot')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-brand-600 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Slots
      </button>

      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Your Details</h2>
        <p className="text-gray-500">Almost there! Confirm your contact information</p>
      </div>

      {/* Logged-in banner or guest prompt */}
      {isLoggedIn ? (
        <div className="mb-5 flex items-center gap-3 p-3.5 bg-green-50 border border-green-200 rounded-xl">
          <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-sm font-bold shrink-0 overflow-hidden">
            {customer?.avatarUrl
              ? <img src={customer.avatarUrl} alt="" className="w-full h-full object-cover" />
              : customer?.name?.[0]?.toUpperCase()
            }
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-green-800">Booked as {customer?.name}</p>
            <p className="text-xs text-green-600">Details auto-filled from your profile. This booking will appear in your history.</p>
          </div>
          <Sparkles className="w-4 h-4 text-green-500 shrink-0" />
        </div>
      ) : (
        <div className="mb-5 flex items-center gap-3 p-3.5 bg-blue-50 border border-blue-200 rounded-xl">
          <LogIn className="w-5 h-5 text-blue-500 shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-blue-800">
              <Link to="/login" state={{ from: '/booking/details' }} className="font-semibold hover:underline">Sign in</Link> or{' '}
              <Link to="/register" state={{ from: '/booking/details' }} className="font-semibold hover:underline">create an account</Link> to save your booking history
            </p>
            <p className="text-xs text-blue-600 mt-0.5">Or continue below as a guest — no account needed</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <form onSubmit={handleSubmit} className="md:col-span-3 space-y-4">

          {/* Name */}
          <div>
            <label className="label">Full Name *</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={form.name}
                onChange={(e) => { setForm(f => ({ ...f, name: e.target.value })); setErrors(er => ({ ...er, name: '' })); }}
                placeholder="Enter your full name"
                className={`input-field pl-10 ${errors.name ? 'border-red-400' : ''}`}
              />
            </div>
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="label">Phone Number *</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => { setForm(f => ({ ...f, phone: e.target.value })); setErrors(er => ({ ...er, phone: '' })); }}
                placeholder="+94 77 123 4567"
                className={`input-field pl-10 ${errors.phone ? 'border-red-400' : ''}`}
              />
            </div>
            {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="label">Email Address <span className="text-gray-400 font-normal">(optional)</span></label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                value={form.email}
                onChange={(e) => { setForm(f => ({ ...f, email: e.target.value })); setErrors(er => ({ ...er, email: '' })); }}
                placeholder="your@email.com"
                className={`input-field pl-10 ${errors.email ? 'border-red-400' : ''}`}
              />
            </div>
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>

          {/* Notes */}
          <div>
            <label className="label">Special Notes <span className="text-gray-400 font-normal">(optional)</span></label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <textarea
                value={form.notes}
                onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
                rows={3}
                placeholder="Any special requests..."
                className="input-field pl-10 resize-none"
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
            {loading ? 'Confirming...' : 'Confirm Booking'}
            {!loading && <CheckCircle className="w-5 h-5" />}
          </button>

          <p className="text-xs text-gray-400 text-center">
            By booking you agree to our terms. Payment collected at venue.
          </p>
        </form>

        {/* Booking Summary */}
        <div className="md:col-span-2">
          <div className="card bg-gray-50 border-0 sticky top-20">
            <h3 className="font-bold text-gray-900 mb-4">Booking Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex gap-3">
                <span className="text-2xl">🏟️</span>
                <div>
                  <p className="font-semibold text-gray-900">{selectedCourt.name}</p>
                  <p className="text-gray-500">
                    {selectedSport?.name || selectedCourt.sports?.[0]?.name || 'Multi-sport'}
                  </p>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-3 space-y-2 text-gray-600">
                <div className="flex justify-between">
                  <span>Branch</span>
                  <span className="font-medium text-gray-900 text-right max-w-[60%] leading-tight">{selectedBranch?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date</span>
                  <span className="font-medium text-gray-900">{displayDate}</span>
                </div>
                <div className="flex justify-between">
                  <span>Time</span>
                  <span className="font-medium text-gray-900">{selectedSlot.time} – {selectedSlot.endTime}</span>
                </div>
                <div className="flex justify-between">
                  <span>Duration</span>
                  <span className="font-medium text-gray-900">60 minutes</span>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="text-xl font-bold text-brand-600">LKR {Number(selectedCourt.pricePerHour).toLocaleString()}</span>
              </div>
              <p className="text-xs text-gray-400">Pay at venue (cash / card)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
