import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { CheckCircle, Calendar, Clock, MapPin, ArrowRight, Loader2, RefreshCw, CreditCard, AlertCircle } from 'lucide-react';
import { resetBooking } from '../../store/slices/bookingSlice';
import { publicApi } from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import StatusBadge from '../../components/ui/StatusBadge';
import { Booking } from '../../types';
import dayjs from 'dayjs';

export default function ConfirmationPage() {
  const { ref } = useParams<{ ref: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchBooking = useCallback(async (quiet = false) => {
    if (!ref) return null;
    if (quiet) setRefreshing(true); else setLoading(true);
    try {
      const res = await publicApi.getBookingByRef(ref);
      setBooking(res.data);
      return res.data as Booking;
    } catch {
      return null;
    } finally {
      if (quiet) setRefreshing(false); else { setLoading(false); dispatch(resetBooking()); }
    }
  }, [ref, dispatch]);

  useEffect(() => { fetchBooking(); }, [fetchBooking]);

  // Auto-poll every 5s while online payment is pending
  useEffect(() => {
    if (!booking) return;
    const isOnlinePending = booking.payment?.method === 'ONLINE' && booking.payment?.status === 'PENDING';
    if (!isOnlinePending) return;

    pollRef.current = setInterval(async () => {
      const updated = await fetchBooking(true);
      if (updated?.payment?.status !== 'PENDING') {
        clearInterval(pollRef.current!);
        pollRef.current = null;
      }
    }, 5000);

    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [booking?.id, booking?.payment?.status, fetchBooking]);

  if (loading) return <LoadingSpinner size="lg" className="min-h-[60vh]" />;

  if (!booking) return (
    <div className="text-center py-20">
      <p className="text-gray-500">Booking not found.</p>
    </div>
  );

  const isOnlinePending = booking.payment?.method === 'ONLINE' && booking.payment?.status === 'PENDING';
  const isOnlinePaid = booking.payment?.method === 'ONLINE' && booking.payment?.status === 'PAID';
  const isCash = booking.payment?.method !== 'ONLINE';

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-8">
        {isOnlinePending ? (
          <>
            <div className="w-20 h-20 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-10 h-10 text-yellow-600 animate-spin" />
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Payment Processing</h1>
            <p className="text-gray-500 text-lg">Waiting for payment confirmation from PayHere…</p>
          </>
        ) : (
          <>
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
              {isOnlinePaid ? 'Payment Successful!' : 'Booking Confirmed!'}
            </h1>
            <p className="text-gray-500 text-lg">
              {isOnlinePaid
                ? 'Your payment was received and court is reserved.'
                : 'Your court has been successfully reserved.'}
            </p>
          </>
        )}
      </div>

      {/* Booking Ref */}
      <div className={`rounded-2xl p-6 text-white text-center mb-6 ${isOnlinePending ? 'bg-yellow-500' : 'bg-brand-600'}`}>
        <p className={`text-sm font-medium mb-1 ${isOnlinePending ? 'text-yellow-100' : 'text-brand-200'}`}>Booking Reference</p>
        <p className="text-3xl font-black tracking-widest">{booking.bookingRef}</p>
        <p className={`text-xs mt-2 ${isOnlinePending ? 'text-yellow-100' : 'text-brand-200'}`}>Save this reference number for your records</p>
      </div>

      {/* Details */}
      <div className="card mb-6">
        <h3 className="font-bold text-gray-900 mb-5">Booking Details</h3>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
              <span className="text-lg">🏟️</span>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Court</p>
              <p className="font-semibold text-gray-900">{booking.court.name}</p>
              <p className="text-sm text-gray-500">{booking.sport?.name || booking.court.sports?.[0]?.name || 'Multi-sport'}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4 text-brand-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Branch</p>
              <p className="font-semibold text-gray-900">{booking.branch.name}</p>
              <p className="text-sm text-gray-500">{booking.branch.address}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4 text-brand-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Date</p>
                <p className="font-semibold text-gray-900">{dayjs(booking.date).format('DD MMM YYYY')}</p>
                <p className="text-sm text-gray-500">{dayjs(booking.date).format('dddd')}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4 text-brand-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Time</p>
                <p className="font-semibold text-gray-900">{booking.startTime} – {booking.endTime}</p>
                <p className="text-sm text-gray-500">{booking.duration} minutes</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs text-gray-500 mb-1">Customer</p>
                <p className="font-semibold text-gray-900">{booking.customer.name}</p>
                <p className="text-sm text-gray-500">{booking.customer.phone}</p>
              </div>
              <StatusBadge status={booking.payment?.status || 'PENDING'} />
            </div>
            <div className="bg-gray-50 rounded-xl p-3 space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Court fee</span>
                <span className="text-gray-900">LKR {Number(booking.courtAmount || 0).toLocaleString()}</span>
              </div>
              {Number(booking.platformFee) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Platform fee</span>
                  <span className="text-gray-900">LKR {Number(booking.platformFee).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base border-t border-gray-200 pt-1.5 mt-1.5">
                <span className="text-gray-900">Total</span>
                <span className="text-brand-600">LKR {Number(booking.totalAmount).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment status banner */}
      {isOnlinePending && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-yellow-800 mb-1">Waiting for Payment Confirmation</p>
              <p className="text-sm text-yellow-700">
                Your slot is reserved while we wait for PayHere to confirm your payment. This page checks automatically every 5 seconds. If you completed payment, it should confirm within a minute.
              </p>
            </div>
          </div>
          <button
            onClick={() => fetchBooking(true)}
            disabled={refreshing}
            className="mt-3 flex items-center gap-2 text-sm font-medium text-yellow-700 hover:text-yellow-900 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Checking…' : 'Check payment status'}
          </button>
        </div>
      )}

      {isOnlinePaid && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <CreditCard className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-green-800 mb-1">Payment Received</p>
              <p className="text-sm text-green-700">
                LKR {Number(booking.totalAmount).toLocaleString()} paid online via PayHere. Show your booking reference <strong>{booking.bookingRef}</strong> at the venue.
              </p>
            </div>
          </div>
        </div>
      )}

      {isCash && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
          <p className="text-sm font-semibold text-yellow-800 mb-1">Payment Instructions</p>
          <p className="text-sm text-yellow-700">
            Please pay LKR {Number(booking.totalAmount).toLocaleString()} at the venue (cash or card) before your session. Show your booking reference: <strong>{booking.bookingRef}</strong>
          </p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <button onClick={() => navigate('/')} className="btn-secondary flex-1">
          Back to Home
        </button>
        <button onClick={() => navigate('/booking/branch')} className="btn-primary flex-1">
          Book Another Court <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
