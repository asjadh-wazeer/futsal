import { useEffect, useState, useCallback } from 'react';
import { Search, ChevronLeft, ChevronRight, MapPin, LayoutList, CalendarDays, Plus, X, Phone, User, FileText, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { createPortal } from 'react-dom';
import { ownerApi } from '../../services/api';
import { Booking, Branch, Court } from '../../types';

type EnrichedSlot = { time: string; endTime: string; available: boolean; bookingSource: 'CUSTOMER' | 'MANUAL' | null; isPast: boolean };
import StatusBadge from '../../components/ui/StatusBadge';
import dayjs from 'dayjs';
import clsx from 'clsx';

const STATUS_OPTIONS = ['', 'PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW'];

function getNextActions(b: Booking): { label: string; value: string; color: string }[] {
  if (b.status === 'PENDING') {
    if (b.source === 'CUSTOMER') {
      // Customer booked via website — confirmation comes from PayHere webhook or handled offline
      return [{ label: 'Cancel', value: 'CANCELLED', color: 'bg-red-100 hover:bg-red-200 text-red-700' }];
    }
    // Manual booking — staff confirms cash received
    return [
      { label: 'Confirm', value: 'CONFIRMED', color: 'bg-green-600 hover:bg-green-700 text-white' },
      { label: 'Cancel', value: 'CANCELLED', color: 'bg-red-100 hover:bg-red-200 text-red-700' },
    ];
  }
  if (b.status === 'CONFIRMED') {
    return [
      { label: 'Complete', value: 'COMPLETED', color: 'bg-blue-600 hover:bg-blue-700 text-white' },
      { label: 'No-show', value: 'NO_SHOW', color: 'bg-gray-100 hover:bg-gray-200 text-gray-700' },
      { label: 'Cancel', value: 'CANCELLED', color: 'bg-red-100 hover:bg-red-200 text-red-700' },
    ];
  }
  return [];
}

type PendingAction = { booking: Booking; action: { label: string; value: string } };

function ConfirmActionModal({ booking, action, submitting, onConfirm, onClose }: {
  booking: Booking;
  action: { label: string; value: string };
  submitting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const isCancel = action.value === 'CANCELLED';
  const isOnlineBooking = booking.source === 'CUSTOMER';

  const icon = {
    CONFIRMED: <div className="w-11 h-11 rounded-full bg-green-100 flex items-center justify-center shrink-0"><CheckCircle className="w-5 h-5 text-green-600" /></div>,
    CANCELLED: <div className="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center shrink-0"><XCircle className="w-5 h-5 text-red-500" /></div>,
    COMPLETED: <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center shrink-0"><CheckCircle className="w-5 h-5 text-blue-600" /></div>,
    NO_SHOW: <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center shrink-0"><AlertTriangle className="w-5 h-5 text-gray-500" /></div>,
  }[action.value];

  const confirmBtnClass = {
    CONFIRMED: 'bg-green-600 hover:bg-green-700',
    CANCELLED: 'bg-red-500 hover:bg-red-600',
    COMPLETED: 'bg-blue-600 hover:bg-blue-700',
    NO_SHOW: 'bg-gray-600 hover:bg-gray-700',
  }[action.value] ?? 'bg-gray-600 hover:bg-gray-700';

  const modal = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            {icon}
            <div>
              <h3 className="font-bold text-gray-900 text-base">{action.label} Booking?</h3>
              <p className="text-xs text-gray-400 mt-0.5">This action cannot be undone</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-3 space-y-1 text-sm">
            <p className="font-semibold text-gray-900">{booking.customer?.name}</p>
            <p className="text-xs text-gray-500">{booking.court?.name} · {dayjs(booking.date).format('D MMM YYYY')}</p>
            <p className="text-xs text-gray-500">{booking.startTime} – {booking.endTime}</p>
          </div>

          {isCancel && isOnlineBooking && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 leading-relaxed">This was an <strong>Online Booking</strong>. No automatic refund will be processed — handle it with the customer manually if needed.</p>
            </div>
          )}
        </div>

        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onClose} disabled={submitting} className="flex-1 py-2.5 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors text-sm disabled:opacity-50">
            Go Back
          </button>
          <button onClick={onConfirm} disabled={submitting} className={`flex-1 py-2.5 text-white font-semibold rounded-xl transition-colors text-sm disabled:opacity-50 ${confirmBtnClass}`}>
            {submitting ? 'Processing…' : `Yes, ${action.label}`}
          </button>
        </div>
      </div>
    </div>
  );
  return createPortal(modal, document.body);
}

function SourceBadge({ source }: { source?: string }) {
  return source === 'MANUAL'
    ? <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-orange-100 text-orange-700 whitespace-nowrap">Manual Booking</span>
    : <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-sky-100 text-sky-700 whitespace-nowrap">Online Booking</span>;
}

type ViewMode = 'list' | 'daily';

const EMPTY_FORM = { name: '', phone: '', email: '', notes: '' };

function ManualBookingModal({ courts, onClose, onCreated }: {
  courts: Court[];
  onClose: () => void;
  onCreated: (b: Booking) => void;
}) {
  const [courtId, setCourtId] = useState('');
  const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [slots, setSlots] = useState<EnrichedSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<EnrichedSlot | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const selectedCourt = courts.find((c) => c.id === courtId);

  const loadSlots = useCallback(async () => {
    if (!courtId || !date) return;
    setSlotsLoading(true);
    setSelectedSlot(null);
    try {
      const res = await ownerApi.getCourtAvailability(courtId, date);
      const now = dayjs();
      const today = dayjs().format('YYYY-MM-DD');
      const enriched: EnrichedSlot[] = (res.data.slots || []).map((slot: any) => {
        const isPast = date === today && !dayjs(`${date} ${slot.time}`).isAfter(now);
        return { ...slot, available: slot.available && !isPast, isPast };
      });
      setSlots(enriched);
    } catch {
      toast.error('Failed to load slots');
    } finally {
      setSlotsLoading(false);
    }
  }, [courtId, date]);

  useEffect(() => { loadSlots(); }, [loadSlots]);

  const formatTime = (t: string) => {
    const [h] = t.split(':').map(Number);
    return h < 12 ? `${h === 0 ? 12 : h}:00 AM` : `${h === 12 ? 12 : h - 12}:00 PM`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) { toast.error('Please select a time slot'); return; }
    if (!form.name.trim() || !form.phone.trim()) { toast.error('Name and phone are required'); return; }
    setSubmitting(true);
    try {
      const res = await ownerApi.createManualBooking({
        courtId,
        date,
        startTime: selectedSlot.time,
        endTime: selectedSlot.endTime,
        customerName: form.name,
        customerPhone: form.phone,
        customerEmail: form.email || undefined,
        notes: form.notes || undefined,
        paymentMethod: 'CASH',
        sportId: selectedCourt?.sports?.[0]?.id,
      });
      toast.success('Booking created');
      onCreated(res.data);
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  const modal = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 text-lg">New Manual Booking</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Court + Date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Court *</label>
              <select
                value={courtId}
                onChange={(e) => setCourtId(e.target.value)}
                className="input-field"
                required
              >
                <option value="">Select a court</option>
                {courts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} — {(c as any).branch?.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Date *</label>
              <input
                type="date"
                value={date}
                min={dayjs().format('YYYY-MM-DD')}
                onChange={(e) => setDate(e.target.value)}
                className="input-field"
                required
              />
            </div>
          </div>

          {/* Slot picker */}
          {!courtId ? (
            <div className="bg-gray-50 rounded-xl p-4 text-center text-sm text-gray-400 border border-dashed border-gray-200">
              <Clock className="w-6 h-6 mx-auto mb-1.5 text-gray-300" />
              Select a court above to see available time slots
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-gray-600">
                  Select Time Slot *
                  {selectedSlot && <span className="ml-2 text-emerald-600 font-bold">{formatTime(selectedSlot.time)} – {formatTime(selectedSlot.endTime)}</span>}
                </label>
                <div className="flex items-center gap-2 text-[10px] text-gray-400">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-100 border border-emerald-300 inline-block" />Free</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-orange-100 border border-orange-300 inline-block" />Manual</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-red-100 border border-red-300 inline-block" />Online</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-gray-100 border border-gray-300 inline-block" />Past</span>
                </div>
              </div>
              {slotsLoading ? (
                <div className="flex gap-1.5 flex-wrap">
                  {[...Array(8)].map((_, i) => <div key={i} className="h-9 w-20 bg-gray-100 animate-pulse rounded-lg" />)}
                </div>
              ) : slots.length === 0 ? (
                <p className="text-sm text-gray-400">No slots available for this date.</p>
              ) : (
                <div className="grid grid-cols-4 gap-1.5">
                  {slots.map((slot) => (
                    <button
                      key={slot.time}
                      type="button"
                      disabled={!slot.available}
                      onClick={() => setSelectedSlot(slot)}
                      className={clsx(
                        'py-2 px-1 rounded-lg text-xs font-semibold border-2 transition-all text-center',
                        slot.available
                          ? selectedSlot?.time === slot.time
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 cursor-pointer'
                          : slot.isPast
                            ? 'bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed'
                            : slot.bookingSource === 'MANUAL'
                              ? 'bg-orange-50 border-orange-200 text-orange-300 cursor-not-allowed'
                              : 'bg-red-50 border-red-200 text-red-300 cursor-not-allowed'
                      )}
                    >
                      {formatTime(slot.time)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="border-t border-gray-100" />

          {/* Customer details */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Customer Details</p>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Full Name *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Customer full name"
                  className="input-field pl-9"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Phone Number *</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="+94 77 123 4567"
                  className="input-field pl-9"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Notes <span className="font-normal text-gray-400">(optional)</span></label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  rows={2}
                  placeholder="Any notes for this booking..."
                  className="input-field pl-9 resize-none"
                />
              </div>
            </div>
          </div>

          {selectedCourt && selectedSlot && (
            <div className="bg-emerald-50 rounded-xl p-3 text-sm text-emerald-700 space-y-0.5">
              <p className="font-semibold">{selectedCourt.name} · {dayjs(date).format('D MMM YYYY')}</p>
              <p>{formatTime(selectedSlot.time)} – {formatTime(selectedSlot.endTime)} · LKR {Number(selectedCourt.pricePerHour).toLocaleString()}/hr</p>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 px-4 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors text-sm">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !selectedSlot}
              className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors text-sm"
            >
              {submitting ? 'Creating…' : 'Create Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

export default function OwnerBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [branches, setBranches] = useState<Branch[]>([]);
  const [courts, setCourts] = useState<Court[]>([]);
  const [showNewBooking, setShowNewBooking] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [date, setDate] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');

  useEffect(() => {
    ownerApi.getBranches().then((res) => setBranches(res.data));
    ownerApi.getCourts().then((res) => setCourts(res.data));
  }, []);

  const load = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const res = await ownerApi.getBookings({
        search: search || undefined,
        status: status || undefined,
        date: date || undefined,
        branchId: selectedBranch || undefined,
        page: p,
        limit: 20,
      });
      setBookings(res.data.data);
      setTotal(res.data.total);
      setPage(res.data.page);
      setPages(res.data.pages);
    } finally {
      setLoading(false);
    }
  }, [search, status, date, selectedBranch]);

  useEffect(() => { load(1); }, [load]);

  const handleStatus = async (id: string, newStatus: string) => {
    setPendingAction(null);
    setUpdating(id);
    try {
      await ownerApi.updateBookingStatus(id, newStatus);
      setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status: newStatus as any } : b));
      toast.success(`Booking ${newStatus.toLowerCase()}`);
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdating(null);
    }
  };

  // Group bookings by date for daily view
  const grouped = bookings.reduce<Record<string, Booking[]>>((acc, b) => {
    const key = dayjs(b.date).format('YYYY-MM-DD');
    if (!acc[key]) acc[key] = [];
    acc[key].push(b);
    return acc;
  }, {});
  const groupedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  const activeBranchName = branches.find((b) => b.id === selectedBranch)?.name;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Bookings</h2>
          <p className="text-sm text-gray-500">{total} total bookings{activeBranchName ? ` · ${activeBranchName}` : ''}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowNewBooking(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" /> New Booking
          </button>
          {/* View mode toggle */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <LayoutList className="w-4 h-4" /> List
            </button>
            <button
              onClick={() => setViewMode('daily')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${viewMode === 'daily' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <CalendarDays className="w-4 h-4" /> Daily
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card flex flex-col sm:flex-row gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search name, ref or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9"
          />
        </div>
        {branches.length > 1 && (
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="input-field pl-9 sm:w-44"
            >
              <option value="">All Branches</option>
              {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
        )}
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="input-field sm:w-40">
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s || 'All Statuses'}</option>)}
        </select>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input-field sm:w-44" />
        {(search || status || date || selectedBranch) && (
          <button onClick={() => { setSearch(''); setStatus(''); setDate(''); setSelectedBranch(''); }} className="text-sm text-gray-500 hover:text-gray-700 whitespace-nowrap">
            Clear
          </button>
        )}
      </div>

      {/* Daily View */}
      {viewMode === 'daily' && (
        <div className="space-y-4">
          {loading ? (
            <div className="space-y-2">{[1,2,3].map((i) => <div key={i} className="h-32 bg-gray-50 animate-pulse rounded-2xl" />)}</div>
          ) : groupedDates.length === 0 ? (
            <div className="card py-16 text-center text-gray-400">
              <p className="font-medium">No bookings found</p>
              <p className="text-sm mt-1">Try adjusting your filters</p>
            </div>
          ) : groupedDates.map((dateKey) => {
            const dayBookings = grouped[dateKey];
            const dayRevenue = dayBookings.reduce((s, b) => s + Number(b.totalAmount), 0);
            const isToday = dateKey === dayjs().format('YYYY-MM-DD');
            return (
              <div key={dateKey} className="card p-0 overflow-hidden">
                <div className={`flex items-center justify-between px-4 py-3 border-b border-gray-100 ${isToday ? 'bg-emerald-50' : 'bg-gray-50'}`}>
                  <div className="flex items-center gap-2">
                    <CalendarDays className={`w-4 h-4 ${isToday ? 'text-emerald-600' : 'text-gray-400'}`} />
                    <span className={`font-bold text-sm ${isToday ? 'text-emerald-700' : 'text-gray-800'}`}>
                      {dayjs(dateKey).format('dddd, D MMMM YYYY')}
                      {isToday && <span className="ml-2 text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded-full font-semibold">TODAY</span>}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="font-semibold text-gray-700">{dayBookings.length} booking{dayBookings.length !== 1 ? 's' : ''}</span>
                    <span className="font-bold text-emerald-600">LKR {dayRevenue.toLocaleString()}</span>
                  </div>
                </div>
                <div className="divide-y divide-gray-50">
                  {dayBookings.sort((a, b) => a.startTime.localeCompare(b.startTime)).map((b) => (
                    <div key={b.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50/50 transition-colors">
                      <div className="text-center w-14 shrink-0">
                        <p className="text-sm font-bold text-emerald-700">{b.startTime}</p>
                        <p className="text-xs text-gray-400">{b.endTime}</p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-gray-900">{b.customer?.name}</p>
                          <SourceBadge source={b.source} />
                          <StatusBadge status={b.status} />
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {b.court?.name}
                          {!selectedBranch && (b as any).branch?.name && ` · ${(b as any).branch.name}`}
                          {b.customer?.phone && ` · ${b.customer.phone}`}
                        </p>
                        {b.createdByName && <p className="text-[11px] text-orange-600 mt-0.5">Booked by {b.createdByName}</p>}
                        {b.cancelledByName && <p className="text-[11px] text-red-500 mt-0.5">Cancelled by {b.cancelledByName}</p>}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-sm font-bold text-gray-900">LKR {Number(b.totalAmount).toLocaleString()}</span>
                        <div className="flex gap-1">
                          {getNextActions(b).map(({ label, value, color }) => (
                            <button
                              key={value}
                              disabled={!!updating}
                              onClick={() => setPendingAction({ booking: b, action: { label, value } })}
                              className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 ${color}`}
                            >
                              {updating === b.id ? '…' : label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="card p-0 overflow-hidden">
          {loading ? (
            <div className="space-y-px">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-gray-50 animate-pulse border-b border-gray-100" />
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <p className="font-medium">No bookings found</p>
              <p className="text-sm mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50 border-b border-gray-100">
                    <th className="px-4 py-3">Ref</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Court{!selectedBranch && branches.length > 1 ? ' / Branch' : ''}</th>
                    <th className="px-4 py-3">Date & Time</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Source</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs font-semibold text-gray-700">{b.bookingRef}</span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900">{b.customer?.name}</p>
                        <p className="text-xs text-gray-400">{b.customer?.phone}</p>
                        {b.createdByName && <p className="text-[11px] text-orange-600 mt-0.5">Booked by {b.createdByName}</p>}
                        {b.cancelledByName && <p className="text-[11px] text-red-500 mt-0.5">Cancelled by {b.cancelledByName}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900">{b.court?.name}</p>
                        <p className="text-xs text-gray-400">
                          {!selectedBranch && (b as any).branch?.name ? (b as any).branch.name : b.court?.sports?.[0]?.name}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-900">{dayjs(b.date).format('D MMM YYYY')}</p>
                        <p className="text-xs text-gray-400">{b.startTime} – {b.endTime}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-semibold text-gray-900">LKR {Number(b.totalAmount).toLocaleString()}</span>
                      </td>
                      <td className="px-4 py-3">
                        <SourceBadge source={b.source} />
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={b.status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5">
                          {getNextActions(b).map(({ label, value, color }) => (
                            <button
                              key={value}
                              disabled={!!updating}
                              onClick={() => setPendingAction({ booking: b, action: { label, value } })}
                              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 ${color}`}
                            >
                              {updating === b.id ? '…' : label}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">Page {page} of {pages} · {total} results</p>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => load(page - 1)} className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button disabled={page >= pages} onClick={() => load(page + 1)} className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {pendingAction && (
        <ConfirmActionModal
          booking={pendingAction.booking}
          action={pendingAction.action}
          submitting={updating === pendingAction.booking.id}
          onConfirm={() => handleStatus(pendingAction.booking.id, pendingAction.action.value)}
          onClose={() => setPendingAction(null)}
        />
      )}

      {showNewBooking && (
        <ManualBookingModal
          courts={courts}
          onClose={() => setShowNewBooking(false)}
          onCreated={(b) => { setBookings((prev) => [b, ...prev]); setTotal((t) => t + 1); }}
        />
      )}
    </div>
  );
}
