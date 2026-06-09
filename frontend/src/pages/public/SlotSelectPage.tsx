import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import { setDate, setSlot } from '../../store/slices/bookingSlice';
import { RootState } from '../../store';
import { publicApi } from '../../services/api';
import BookingSteps from '../../components/public/BookingSteps';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { TimeSlot } from '../../types';
import clsx from 'clsx';
import dayjs from 'dayjs';

export default function SlotSelectPage() {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selectedCourt, selectedBranch, selectedDate } = useSelector((s: RootState) => s.booking);

  const today = dayjs().format('YYYY-MM-DD');
  const dates = Array.from({ length: 14 }, (_, i) => dayjs().add(i, 'day').format('YYYY-MM-DD'));

  const currentDate = selectedDate || today;

  useEffect(() => {
    if (!selectedCourt) { navigate('/booking/court'); return; }
    if (!selectedDate) dispatch(setDate(today));
    loadSlots(currentDate);
  }, [selectedCourt, currentDate]);

  const loadSlots = async (date: string) => {
    setLoading(true);
    try {
      const res = await publicApi.getAvailability(selectedCourt!.id, date);
      const now = dayjs();
      const filtered = res.data.slots.map((slot: TimeSlot) => ({
        ...slot,
        available: slot.available && (date !== today || dayjs(`${date} ${slot.time}`).isAfter(now)),
      }));
      setSlots(filtered);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (date: string) => {
    dispatch(setDate(date));
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    if (!slot.available) return;
    dispatch(setSlot({ time: slot.time, endTime: slot.endTime }));
    navigate('/booking/details');
  };

  const formatDate = (d: string) => {
    const dj = dayjs(d);
    return { day: dj.format('ddd'), date: dj.format('D'), month: dj.format('MMM') };
  };

  const formatTime = (t: string) => {
    const [h] = t.split(':').map(Number);
    return h < 12 ? `${h === 0 ? 12 : h}:00 AM` : `${h === 12 ? 12 : h - 12}:00 PM`;
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <BookingSteps current={3} />

      <button onClick={() => navigate('/booking/court')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-brand-600 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Courts
      </button>

      <div className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Select Date & Time</h2>
        <p className="text-gray-500">{selectedCourt?.name} — {selectedBranch?.name}</p>
      </div>

      {/* Date Picker */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-4 h-4 text-brand-600" />
          <span className="text-sm font-semibold text-gray-700">Select Date</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 snap-x">
          {dates.map((d) => {
            const { day, date, month } = formatDate(d);
            const isSelected = d === currentDate;
            const isToday = d === today;
            return (
              <button
                key={d}
                onClick={() => handleDateChange(d)}
                className={clsx(
                  'flex flex-col items-center px-3.5 py-2.5 rounded-xl border-2 transition-all min-w-[56px] snap-start shrink-0',
                  isSelected
                    ? 'bg-brand-600 border-brand-600 text-white shadow-md'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-brand-300'
                )}
              >
                <span className={clsx('text-[10px] font-semibold uppercase', isSelected ? 'text-brand-200' : 'text-gray-400')}>{day}</span>
                <span className="text-xl font-bold leading-tight">{date}</span>
                <span className={clsx('text-[10px] font-medium', isSelected ? 'text-brand-200' : 'text-gray-400')}>{month}</span>
                {isToday && !isSelected && <span className="text-[8px] font-bold text-brand-600 mt-0.5">TODAY</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Time Slots */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-brand-600" />
          <span className="text-sm font-semibold text-gray-700">Available Time Slots</span>
          <div className="flex items-center gap-3 ml-auto text-xs text-gray-500">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-white border-2 border-gray-200 inline-block" />Taken</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-brand-100 border-2 border-brand-400 inline-block" />Available</span>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner className="py-12" />
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
            {slots.map((slot) => (
              <button
                key={slot.time}
                disabled={!slot.available}
                onClick={() => handleSlotSelect(slot)}
                className={clsx(
                  'py-3 px-2 rounded-xl text-sm font-semibold border-2 transition-all text-center',
                  slot.available
                    ? 'bg-brand-50 border-brand-300 text-brand-700 hover:bg-brand-600 hover:text-white hover:border-brand-600 cursor-pointer'
                    : 'bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed'
                )}
              >
                {formatTime(slot.time)}
              </button>
            ))}
          </div>
        )}

        {!loading && slots.every((s) => !s.available) && (
          <div className="text-center py-8 text-gray-500">
            <p>All slots are booked for this date. Please try another date.</p>
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-brand-50 rounded-xl border border-brand-100">
        <p className="text-sm text-brand-700 font-medium">
          Price: <span className="font-bold">LKR {selectedCourt?.pricePerHour.toLocaleString()}/hour</span>
          <span className="text-brand-500 font-normal ml-2">· Minimum {selectedCourt?.minDuration} minutes</span>
        </p>
      </div>
    </div>
  );
}
