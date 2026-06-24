import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { TrendingUp, Users, CalendarDays, Clock, RefreshCw } from 'lucide-react';
import { adminApi } from '../../services/api';
import { RootState } from '../../store';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const COLORS = ['#16a34a', '#2563eb', '#d97706', '#7c3aed', '#dc2626'];

export default function AnalyticsPage() {
  const [revenue, setRevenue] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [topCustomers, setTopCustomers] = useState<any[]>([]);
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [loading, setLoading] = useState(true);
  const admin = useSelector((s: RootState) => s.auth.admin);
  const currency = admin?.business?.currency || 'LKR';

  const load = () => {
    setLoading(true);
    Promise.all([
      adminApi.getRevenueChart(period),
      adminApi.getBookingStats(),
      adminApi.getTopCustomers(),
    ]).then(([r, s, c]) => {
      setRevenue(r.data);
      setStats(s.data);
      setTopCustomers(c.data);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    adminApi.getRevenueChart(period).then((r) => setRevenue(r.data));
  }, [period]);

  if (loading) return <LoadingSpinner size="lg" className="min-h-[60vh]" />;

  const totalRevenue = revenue.reduce((s, r) => s + r.revenue, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="page-title">Analytics</h2>
          <p className="text-sm text-gray-500 mt-0.5">Business performance insights</p>
        </div>
        <button onClick={load} className="btn-ghost p-2" title="Refresh">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Revenue Chart */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="section-title mb-0">Revenue Trend</h3>
            <p className="text-sm text-gray-500 mt-0.5">Total: <span className="font-bold text-gray-900">{currency} {totalRevenue.toLocaleString()}</span></p>
          </div>
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg self-start">
            {(['week', 'month', 'year'] as const).map((p) => (
              <button key={p} onClick={() => setPeriod(p)} className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all capitalize ${period === p ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>{p}</button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={revenue}>
            <defs>
              <linearGradient id="grad2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#16a34a" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v: any) => [`${currency} ${Number(v).toLocaleString()}`, 'Revenue']} />
            <Area type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={2.5} fill="url(#grad2)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Peak Hours */}
        <div className="card">
          <h3 className="section-title">Peak Booking Hours</h3>
          {stats?.peakHours?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.peakHours}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#16a34a" radius={[4, 4, 0, 0]} name="Bookings" />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="h-[220px] flex items-center justify-center text-gray-400 text-sm">No data</div>}
        </div>

        {/* Bookings by Sport */}
        <div className="card">
          <h3 className="section-title">Bookings by Sport</h3>
          {stats?.bySport?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={stats.bySport} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={85} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {stats.bySport.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="h-[220px] flex items-center justify-center text-gray-400 text-sm">No data</div>}
        </div>
      </div>

      {/* Branch Revenue */}
      {stats?.byBranch?.length > 0 && (
        <div className="card">
          <h3 className="section-title">Revenue by Branch</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats.byBranch} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={120} />
              <Tooltip formatter={(v: any) => [`${currency} ${Number(v).toLocaleString()}`, 'Revenue']} />
              <Bar dataKey="revenue" fill="#16a34a" radius={[0, 4, 4, 0]} name="Revenue" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Top Customers */}
      <div className="card">
        <h3 className="section-title">Top Customers</h3>
        <div className="space-y-3">
          {topCustomers.map((c, i) => (
            <div key={c.id} className="flex items-center gap-4 py-2 border-b border-gray-50 last:border-0">
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-gray-200 text-gray-600' : i === 2 ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'}`}>
                {i + 1}
              </span>
              <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-sm shrink-0">
                {c.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm">{c.name}</p>
                <p className="text-xs text-gray-500">{c.phone}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-brand-600 text-sm">{currency} {Number(c.totalSpent).toLocaleString()}</p>
                <p className="text-xs text-gray-500">{c._count?.bookings || 0} bookings</p>
              </div>
            </div>
          ))}
          {topCustomers.length === 0 && <p className="text-sm text-gray-400 text-center py-6">No customer data yet</p>}
        </div>
      </div>
    </div>
  );
}
