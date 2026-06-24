import { useEffect, useState } from 'react';
import { Search, Filter, Eye, RefreshCw } from 'lucide-react';
import { adminApi } from '../../services/api';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Modal from '../../components/ui/Modal';
import { Booking } from '../../types';
import dayjs from 'dayjs';

const statusOptions = ['', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'];

function SourceBadge({ source }: { source?: string }) {
  return source === 'MANUAL'
    ? <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-orange-100 text-orange-700 whitespace-nowrap">Manual Booking</span>
    : <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-sky-100 text-sky-700 whitespace-nowrap">Online Booking</span>;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Booking | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getBookings({ search: search || undefined, status: status || undefined, page, limit: 15 });
      setBookings(res.data.data);
      setTotal(res.data.total);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [search, status, page]);

  const pages = Math.ceil(total / 15);

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h2 className="page-title">Bookings</h2>
          <p className="text-sm text-gray-500 mt-0.5">{total} total bookings</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card py-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by ref, customer name or phone..."
              className="input-field pl-9 py-2"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="input-field pl-9 pr-4 py-2 appearance-none"
            >
              <option value="">All Status</option>
              {statusOptions.slice(1).map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <button onClick={load} className="btn-ghost py-2 px-3">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Ref</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Customer</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600 hidden md:table-cell">Court</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600 hidden lg:table-cell">Date & Time</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Amount</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Source</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Status</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Details</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="py-16"><LoadingSpinner /></td></tr>
              ) : bookings.length === 0 ? (
                <tr><td colSpan={8} className="py-16 text-center text-gray-400">No bookings found</td></tr>
              ) : bookings.map((b) => (
                <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-xs font-bold text-brand-600">{b.bookingRef}</td>
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-gray-900">{b.customer?.name}</p>
                    <p className="text-xs text-gray-500">{b.customer?.phone}</p>
                    {b.createdByName && <p className="text-[11px] text-orange-600 mt-0.5">Booked by {b.createdByName}</p>}
                    {b.cancelledByName && <p className="text-[11px] text-red-500 mt-0.5">Cancelled by {b.cancelledByName}</p>}
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell">
                    <p className="font-medium text-gray-900">{b.court?.name}</p>
                    <p className="text-xs text-gray-500">{b.branch?.name}</p>
                  </td>
                  <td className="px-5 py-3.5 hidden lg:table-cell">
                    <p className="font-medium">{dayjs(b.date).format('DD MMM YYYY')}</p>
                    <p className="text-xs text-gray-500">{b.startTime} – {b.endTime}</p>
                  </td>
                  <td className="px-5 py-3.5 font-semibold">LKR {Number(b.totalAmount).toLocaleString()}</td>
                  <td className="px-5 py-3.5"><SourceBadge source={b.source} /></td>
                  <td className="px-5 py-3.5"><StatusBadge status={b.status} /></td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => setSelected(b)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                      title="View details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">Showing {bookings.length} of {total}</p>
            <div className="flex gap-1">
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-3 py-1 rounded-lg text-xs font-medium border border-gray-200 disabled:opacity-50 hover:bg-gray-50">Prev</button>
              {Array.from({ length: Math.min(pages, 5) }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)} className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${p === page ? 'bg-brand-600 text-white' : 'hover:bg-gray-50 border border-gray-200'}`}>{p}</button>
              ))}
              <button onClick={() => setPage(Math.min(pages, page + 1))} disabled={page === pages} className="px-3 py-1 rounded-lg text-xs font-medium border border-gray-200 disabled:opacity-50 hover:bg-gray-50">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* View Details Modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="Booking Details" size="lg">
        {selected && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-gray-500 mb-0.5">Booking Ref</p><p className="font-bold font-mono text-brand-600 text-base">{selected.bookingRef}</p></div>
              <div className="space-y-1.5">
                <p className="text-gray-500">Status</p>
                <div className="flex items-center gap-2">
                  <StatusBadge status={selected.status} />
                  <SourceBadge source={selected.source} />
                </div>
              </div>
              <div><p className="text-gray-500 mb-0.5">Customer</p><p className="font-semibold">{selected.customer?.name}</p><p className="text-gray-500">{selected.customer?.phone}</p></div>
              <div><p className="text-gray-500 mb-0.5">Court</p><p className="font-semibold">{selected.court?.name}</p></div>
              <div><p className="text-gray-500 mb-0.5">Branch</p><p className="font-semibold">{selected.branch?.name}</p></div>
              <div><p className="text-gray-500 mb-0.5">Date</p><p className="font-semibold">{dayjs(selected.date).format('DD MMM YYYY')}</p></div>
              <div><p className="text-gray-500 mb-0.5">Time</p><p className="font-semibold">{selected.startTime} – {selected.endTime}</p></div>
              <div><p className="text-gray-500 mb-0.5">Amount</p><p className="font-bold text-brand-600 text-base">LKR {Number(selected.totalAmount).toLocaleString()}</p></div>
              <div><p className="text-gray-500 mb-0.5">Payment</p><StatusBadge status={selected.payment?.status || 'PENDING'} /></div>
              {selected.createdByName && <div><p className="text-gray-500 mb-0.5">Booked by</p><p className="font-semibold text-orange-600">{selected.createdByName}</p></div>}
              {selected.cancelledByName && <div><p className="text-gray-500 mb-0.5">Cancelled by</p><p className="font-semibold text-red-500">{selected.cancelledByName}</p></div>}
            </div>
            {selected.notes && <div className="p-3 bg-gray-50 rounded-xl"><p className="text-gray-500 text-xs mb-1">Notes</p><p>{selected.notes}</p></div>}
          </div>
        )}
      </Modal>
    </div>
  );
}
