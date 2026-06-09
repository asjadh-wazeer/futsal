import { useEffect, useState, useCallback } from 'react';
import { Search, Filter, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { ownerApi } from '../../services/api';
import { Booking } from '../../types';
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

export default function OwnerBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [date, setDate] = useState('');

  const load = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const res = await ownerApi.getBookings({ search: search || undefined, status: status || undefined, date: date || undefined, page: p, limit: 20 });
      setBookings(res.data.data);
      setTotal(res.data.total);
      setPage(res.data.page);
      setPages(res.data.pages);
    } finally {
      setLoading(false);
    }
  }, [search, status, date]);

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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Bookings</h2>
        <p className="text-sm text-gray-500">{total} total bookings</p>
      </div>

      {/* Filters */}
      <div className="card flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, ref or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9"
          />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="input-field sm:w-44">
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s || 'All Statuses'}</option>)}
        </select>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input-field sm:w-44" />
        {(search || status || date) && (
          <button onClick={() => { setSearch(''); setStatus(''); setDate(''); }} className="text-sm text-gray-500 hover:text-gray-700 whitespace-nowrap">
            Clear
          </button>
        )}
      </div>

      {/* Table */}
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
                      <p className="text-xs text-gray-400">{b.court?.sport?.name}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-900">{dayjs(b.date).format('D MMM YYYY')}</p>
                      <p className="text-xs text-gray-400">{b.startTime} – {b.endTime}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-semibold text-gray-900">LKR {Number(b.totalAmount).toLocaleString()}</span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={b.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        {(NEXT_STATUS[b.status] || []).map(({ label, value, color }) => (
                          <button
                            key={value}
                            disabled={!!updating}
                            onClick={() => handleStatus(b.id, value)}
                            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 ${color}`}
                          >
                            {updating === b.id ? '...' : label}
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
    </div>
  );
}
