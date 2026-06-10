import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, User, Phone, Mail, FileText, CheckCircle, LogIn, Sparkles, CreditCard, Banknote, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { setCompletedBooking } from '../../store/slices/bookingSlice';
import { RootState } from '../../store';
import { publicApi } from '../../services/api';
import BookingSteps from '../../components/public/BookingSteps';
import dayjs from 'dayjs';

const PLATFORM_FEE_PER_HOUR = 150;

export default function CustomerDetailsPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selectedBranch, selectedCourt, selectedDate, selectedSlot, selectedSport } = useSelector((s: RootState) => s.booking);
  const { token: customerToken, customer } = useSelector((s: RootState) => s.customerAuth);
  const payHereFormRef = useRef<HTMLFormElement>(null);

  const isLoggedIn = !!customerToken && !!customer;

  const [form, setForm] = useState({ name: '', phone: '', email: '', notes: '' });
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'ONLINE'>('CASH');
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [payHereParams, setPayHereParams] = useState<any>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isLoggedIn && customer) {
      setForm((f) => ({ ...f, name: customer.name || '', phone: customer.phone || '', email: customer.email || '' }));
    }
  }, [isLoggedIn, customer]);

  // Auto-submit the hidden PayHere form once params arrive
  useEffect(() => {
    if (payHereParams && payHereFormRef.current) {
      payHereFormRef.current.submit();
    }
  }, [payHereParams]);

  if (!selectedCourt || !selectedSlot) {
    navigate('/booking/slot');
    return null;
  }

  const dateToSend = selectedDate || dayjs().format('YYYY-MM-DD');
  const displayDate = dayjs(dateToSend).format('dddd, MMMM D, YYYY');

  // Fee breakdown (mirrors backend calculation)
  const [startH, startM] = selectedSlot.time.split(':').map(Number);
  const [endH, endM] = selectedSlot.endTime.split(':').map(Number);
  const durationMinutes = (endH * 60 + endM) - (startH * 60 + startM);
  const durationHours = durationMinutes / 60;
  const courtFee = Math.round(selectedCourt.pricePerHour * durationHours);
  const platformFee = Math.round(PLATFORM_FEE_PER_HOUR * durationHours);
  const totalAmount = courtFee + platformFee;

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
        paymentMethod,
        sportId: selectedSport?.id || selectedCourt.sports?.[0]?.id,
      });

      const booking = res.data;
      dispatch(setCompletedBooking(booking));

      if (paymentMethod === 'ONLINE') {
        setLoading(false);
        setRedirecting(true);
        try {
          const initRes = await publicApi.initiatePayment(booking.id);
          setPayHereParams(initRes.data);
        } catch {
          toast.error('Payment gateway error. Please try again or choose Pay at Venue.');
          setRedirecting(false);
        }
      } else {
        navigate(`/booking/confirm/${booking.bookingRef}`);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Booking failed. Please try again.');
      setLoading(false);
    }
  };

  if (redirecting) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 p-8">
        <Loader2 className="w-12 h-12 text-brand-600 animate-spin" />
        <h2 className="text-xl font-bold text-gray-900">Redirecting to PayHere…</h2>
        <p className="text-gray-500 text-sm text-center max-w-sm">
          You are being redirected to PayHere's secure payment page. Please do not close this tab.
        </p>
        {payHereParams && (
          <form ref={payHereFormRef} method="post" action={payHereParams.checkoutUrl} className="hidden">
            <input type="hidden" name="merchant_id" value={payHereParams.merchantId} />
            <input type="hidden" name="return_url" value={payHereParams.returnUrl} />
            <input type="hidden" name="cancel_url" value={payHereParams.cancelUrl} />
            <input type="hidden" name="notify_url" value={payHereParams.notifyUrl} />
            <input type="hidden" name="order_id" value={payHereParams.orderId} />
            <input type="hidden" name="items" value={payHereParams.itemName} />
            <input type="hidden" name="currency" value={payHereParams.currency} />
            <input type="hidden" name="amount" value={payHereParams.amount} />
            <input type="hidden" name="first_name" value={payHereParams.firstName} />
            <input type="hidden" name="last_name" value={payHereParams.lastName} />
            <input type="hidden" name="email" value={payHereParams.email} />
            <input type="hidden" name="phone" value={payHereParams.phone} />
            <input type="hidden" name="hash" value={payHereParams.hash} />
          </form>
        )}
      </div>
    );
  }

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
            {(customer as any)?.avatarUrl
              ? <img src={(customer as any).avatarUrl} alt="" className="w-full h-full object-cover" />
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

          {/* Payment Method */}
          <div>
            <label className="label">Payment Method</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('CASH')}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  paymentMethod === 'CASH'
                    ? 'border-brand-600 bg-brand-50 text-brand-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                <Banknote className="w-6 h-6" />
                <div className="text-center">
                  <p className="text-sm font-semibold">Pay at Venue</p>
                  <p className="text-xs opacity-70">Cash or card</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('ONLINE')}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  paymentMethod === 'ONLINE'
                    ? 'border-brand-600 bg-brand-50 text-brand-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                <CreditCard className="w-6 h-6" />
                <div className="text-center">
                  <p className="text-sm font-semibold">Pay Online</p>
                  <p className="text-xs opacity-70">Secure via PayHere</p>
                </div>
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
            {loading ? 'Processing…' : paymentMethod === 'ONLINE' ? 'Proceed to Payment' : 'Confirm Booking'}
            {!loading && <CheckCircle className="w-5 h-5" />}
          </button>

          <p className="text-xs text-gray-400 text-center">
            {paymentMethod === 'ONLINE'
              ? "You will be redirected to PayHere's secure payment gateway."
              : 'By booking you agree to our terms. Payment collected at venue.'}
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
                  <span className="font-medium text-gray-900">{durationMinutes} minutes</span>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-3 space-y-1.5">
                <div className="flex justify-between text-gray-600">
                  <span>Court fee</span>
                  <span className="font-medium text-gray-900">LKR {courtFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Platform fee</span>
                  <span className="font-medium text-gray-900">LKR {platformFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center border-t border-gray-200 pt-1.5">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="text-xl font-bold text-brand-600">LKR {totalAmount.toLocaleString()}</span>
                </div>
              </div>
              <p className="text-xs text-gray-400">
                {paymentMethod === 'ONLINE' ? 'Secure online payment via PayHere' : 'Pay at venue (cash / card)'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
