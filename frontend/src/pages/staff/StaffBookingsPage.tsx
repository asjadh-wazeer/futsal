import { useEffect, useState, useCallback } from 'react';
import { Search, ChevronLeft, ChevronRight, CalendarDays, LayoutList } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { ownerApi } from '../../services/api';
import { Booking } from '../../types';
import { RootState } from '../../store';
import StatusBadge from '../../components/ui/StatusBadge';
import dayjs from 'dayjs';

const STATUS_OPTIONS = ['', 'PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW'];
const NEXT_STATUS: Record<string, { label: string; value: string; color: string }[]> = {
  PENDING: [
    { label: 'Confirm', value: 'CONFIRMED', color: 'bg-green-600 hover:bg-green-700 text-white' },
    { label: 'Cancel', value: 'CANCELLED', color: 'bg-red-100 hover:bg-red-200 text-red-700' },
  ],
  CONFIRMED: [
    { label: 'Complete', value: 'COMPLETED', color: 'bg-blue-600 hover:bg-blue-700 text-white' },
    { label: 'No-show', value: 'NO_SHOW', color: 'bg-gray-100 hover:bg-gray-200 text-gray-700' },
    { label: 'Cancel', value: 'CANCELLED', color: 'bg-red-100 hover:bg-red-200 text-red-700' },
  ],
};

type ViewMode = 'list' | 'daily';

export default function StaffBookingsPage() {
  const admin = useSelector((s: RootState) => s.auth.admin);
  const branchId = admin?.branchId ?? undefined;

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('daily');

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [date, setDate] = useState('');

  const load = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const res = await ownerApi.getBookings({
        search: search || undefined,
        status: status || undefined,
        date: date || undefined,
        branchId,
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
  }, [search, status, date, branchId]);

  useEffect(() => { load(1); }, [load]);

  const handleStatus = async (id: string, newStatus: string) => {
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

  // Group for daily view
  const grouped = bookings.reduce<Record<string, Booking[]>>((acc, b) => {
    const key = dayjs(b.date).format('YYYY-MM-DD');
    if (!acc[key]) acc[key] = [];
    acc[key].push(b);
    return acc;
  }, {});
  const groupedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Bookings</h2>
          <p className="text-sm text-gray-500">{total} bookings at your branch</p>
        </div>
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

      {/* Filters */}
      <div className="card flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search name, ref or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9"
          />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="input-field sm:w-40">
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s || 'All Statuses'}</option>)}
        </select>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input-field sm:w-44" />
        {(search || status || date) && (
          <button onClick={() => { setSearch(''); setStatus(''); setDate(''); }} className="text-sm text-gray-500 hover:text-gray-700 whitespace-nowrap">
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
                <div className={`flex items-center justify-between px-4 py-3 border-b border-gray-100 ${isToday ? 'bg-blue-50' : 'bg-gray-50'}`}>
                  <div className="flex items-center gap-2">
                    <CalendarDays className={`w-4 h-4 ${isToday ? 'text-blue-600' : 'text-gray-400'}`} />
                    <span className={`font-bold text-sm ${isToday ? 'text-blue-700' : 'text-gray-800'}`}>
                      {dayjs(dateKey).format('dddd, D MMMM YYYY')}
                      {isToday && <span className="ml-2 text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded-full font-semibold">TODAY</span>}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="font-semibold text-gray-700">{dayBookings.length} booking{dayBookings.length !== 1 ? 's' : ''}</span>
                    <span className="font-bold text-blue-600">LKR {dayRevenue.toLocaleString()}</span>
                  </div>
                </div>
                <div className="divide-y divide-gray-50">
                  {dayBookings.sort((a, b) => a.startTime.localeCompare(b.startTime)).map((b) => (
                    <div key={b.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50/50 transition-colors">
                      <div className="text-center w-14 shrink-0">
                        <p className="text-sm font-bold text-blue-700">{b.startTime}</p>
                        <p className="text-xs text-gray-400">{b.endTime}</p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{b.customer?.name}</p>
                        <p className="text-xs text-gray-500">
                          {b.court?.name}
                          {b.customer?.phone && ` · ${b.customer.phone}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-sm font-bold text-gray-900">LKR {Number(b.totalAmount).toLocaleString()}</span>
                        <StatusBadge status={b.status} />
                        <div className="flex gap-1">
                          {(NEXT_STATUS[b.status] || []).map(({ label, value, color }) => (
                            <button
                              key={value}
                              disabled={!!updating}
                              onClick={() => handleStatus(b.id, value)}
                              className={`px-2 py-1 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 ${color}`}
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
            <div className="space-y-px">{[1,2,3,4,5].map((i) => <div key={i} className="h-16 bg-gray-50 animate-pulse border-b border-gray-100" />)}</div>
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
                    <th className="px-4 py-3">Court</th>
                    <th className="px-4 py-3">Date & Time</th>
                    <th className="px-4 py-3">Amount</th>
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
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900">{b.court?.name}</p>
                        <p className="text-xs text-gray-400">{b.court?.sports?.[0]?.name}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-900">{dayjs(b.date).format('D MMM YYYY')}</p>
                        <p className="text-xs text-gray-400">{b.startTime} – {b.endTime}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-semibold text-gray-900">LKR {Number(b.totalAmount).toLocaleString()}</span>
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5">
                          {(NEXT_STATUS[b.status] || []).map(({ label, value, color }) => (
                            <button
                              key={value}
                              disabled={!!updating}
                              onClick={() => handleStatus(b.id, value)}
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
    </div>
  );
}
