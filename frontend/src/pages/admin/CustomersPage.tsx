import { useEffect, useState } from 'react';
import { Search, Users, Eye, Phone, Mail, TrendingUp, RefreshCw } from 'lucide-react';
import { adminApi } from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Modal from '../../components/ui/Modal';
import StatusBadge from '../../components/ui/StatusBadge';
import { Customer, Booking } from '../../types';
import dayjs from 'dayjs';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Customer | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getCustomers(search || undefined);
      setCustomers(res.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [search]);

  const openCustomer = async (id: string) => {
    const res = await adminApi.getCustomer(id);
    setSelected(res.data);
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h2 className="page-title">Customers</h2>
          <p className="text-sm text-gray-500 mt-0.5">{customers.length} total customers</p>
        </div>
        <button onClick={load} className="btn-ghost p-2" title="Refresh">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="card py-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone or email..."
            className="input-field pl-9 py-2"
          />
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Customer</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600 hidden md:table-cell">Contact</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Bookings</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Total Spent</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="py-16"><LoadingSpinner /></td></tr>
              ) : customers.length === 0 ? (
                <tr><td colSpan={5} className="py-16 text-center text-gray-400">No customers found</td></tr>
              ) : customers.map((c) => (
                <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-sm shrink-0">
                        {c.name[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{c.name}</p>
                        <p className="text-xs text-gray-400">Since {dayjs(c.createdAt).format('MMM YYYY')}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 text-xs text-gray-600"><Phone className="w-3 h-3" />{c.phone}</div>
                      {c.email && <div className="flex items-center gap-1.5 text-xs text-gray-500"><Mail className="w-3 h-3" />{c.email}</div>}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-semibold">{c._count?.bookings || c.visitCount}</span>
                    <span className="text-gray-400 text-xs ml-1">bookings</span>
                  </td>
                  <td className="px-5 py-3.5 font-bold text-brand-600">
                    LKR {Number(c.totalSpent).toLocaleString()}
                  </td>
                  <td className="px-5 py-3.5">
                    <button onClick={() => openCustomer(c.id)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-brand-600 transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail Modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="Customer Profile" size="lg">
        {selected && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-2xl">
                {selected.name[0].toUpperCase()}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selected.name}</h3>
                <div className="flex gap-3 text-sm text-gray-500 mt-1">
                  <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{selected.phone}</span>
                  {selected.email && <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{selected.email}</span>}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-brand-50 rounded-xl">
                <p className="text-2xl font-bold text-brand-600">{selected._count?.bookings || 0}</p>
                <p className="text-xs text-gray-500 mt-1">Total Bookings</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <p className="text-2xl font-bold text-green-600">LKR {Number(selected.totalSpent).toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">Total Spent</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <p className="text-2xl font-bold text-blue-600">{selected.visitCount}</p>
                <p className="text-xs text-gray-500 mt-1">Visits</p>
              </div>
            </div>

            {selected.bookings && selected.bookings.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Booking History</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {selected.bookings.map((b: Booking) => (
                    <div key={b.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl text-sm">
                      <div>
                        <span className="font-mono text-xs text-brand-600 font-bold">{b.bookingRef}</span>
                        <p className="font-medium">{b.court?.name}</p>
                        <p className="text-xs text-gray-500">{dayjs(b.date).format('DD MMM YYYY')} · {b.startTime}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">LKR {Number(b.totalAmount).toLocaleString()}</p>
                        <StatusBadge status={b.status} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
