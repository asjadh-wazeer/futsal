import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { CheckCircle, Calendar, Clock, MapPin, ArrowRight, Download } from 'lucide-react';
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

  useEffect(() => {
    if (!ref) return;
    publicApi.getBookingByRef(ref)
      .then((res) => setBooking(res.data))
      .finally(() => { setLoading(false); dispatch(resetBooking()); });
  }, [ref]);

  if (loading) return <LoadingSpinner size="lg" className="min-h-[60vh]" />;

  if (!booking) return (
    <div className="text-center py-20">
      <p className="text-gray-500">Booking not found.</p>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4 animate-bounce">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Booking Confirmed!</h1>
        <p className="text-gray-500 text-lg">Your court has been successfully reserved.</p>
      </div>

      {/* Booking Ref */}
      <div className="bg-brand-600 rounded-2xl p-6 text-white text-center mb-6">
        <p className="text-brand-200 text-sm font-medium mb-1">Booking Reference</p>
        <p className="text-3xl font-black tracking-widest">{booking.bookingRef}</p>
        <p className="text-brand-200 text-xs mt-2">Save this reference number for your records</p>
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

          <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">Customer</p>
              <p className="font-semibold text-gray-900">{booking.customer.name}</p>
              <p className="text-sm text-gray-500">{booking.customer.phone}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 mb-1">Total Amount</p>
              <p className="text-2xl font-bold text-brand-600">LKR {Number(booking.totalAmount).toLocaleString()}</p>
              <StatusBadge status={booking.payment?.status || 'PENDING'} />
            </div>
          </div>
        </div>
      </div>

      {/* Payment Info */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
        <p className="text-sm font-semibold text-yellow-800 mb-1">Payment Instructions</p>
        <p className="text-sm text-yellow-700">Please pay LKR {Number(booking.totalAmount).toLocaleString()} at the venue (cash or card) before your session. Show your booking reference: <strong>{booking.bookingRef}</strong></p>
      </div>

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
