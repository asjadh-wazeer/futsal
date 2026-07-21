import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { CalendarDays, TrendingUp, Users, Building2, ArrowRight, Clock, RefreshCw } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { adminApi } from '../../services/api';
import { RootState } from '../../store';
import StatCard from '../../components/ui/StatCard';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Booking } from '../../types';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom';

const PIE_COLORS = ['#16a34a', '#2563eb', '#d97706', '#7c3aed', '#dc2626'];

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [statsData, setStatsData] = useState<any>(null);
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [loading, setLoading] = useState(true);
  const admin = useSelector((s: RootState) => s.auth.admin);

  const load = () => {
    setLoading(true);
    Promise.all([
      adminApi.getDashboard(),
      adminApi.getRevenueChart(period),
      adminApi.getBookingStats(),
    ]).then(([dash, rev, stats]) => {
      setData(dash.data);
      setRevenueData(rev.data);
      setStatsData(stats.data);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    adminApi.getRevenueChart(period).then((res) => setRevenueData(res.data));
  }, [period]);

  const currency = admin?.business?.currency || 'LKR';

  if (loading) return <LoadingSpinner size="lg" className="min-h-[60vh]" />;

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Good {dayjs().hour() < 12 ? 'morning' : dayjs().hour() < 17 ? 'afternoon' : 'evening'}, {admin?.name?.split(' ')[0]}!</h2>
          <p className="text-gray-500 text-sm mt-0.5">{dayjs().format('dddd, MMMM D, YYYY')}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="btn-ghost p-2" title="Refresh">
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link to="/admin/bookings" className="btn-primary text-sm">
            View All Bookings <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Today's Bookings"
          value={data?.todayBookings || 0}
          subtitle="Active reservations"
          icon={CalendarDays}
          iconBg="bg-brand-100"
          iconColor="text-brand-600"
        />
        <StatCard
          title="Today's Revenue"
          value={`${currency} ${(data?.todayRevenue || 0).toLocaleString()}`}
          subtitle="Confirmed bookings"
          icon={TrendingUp}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
        />
        <StatCard
          title="Month Revenue"
          value={`${currency} ${(data?.monthRevenue || 0).toLocaleString()}`}
          subtitle={`${data?.monthBookings || 0} bookings`}
          icon={TrendingUp}
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
        />
        <StatCard
          title="Total Customers"
          value={data?.totalCustomers || 0}
          subtitle={`${data?.activeBranches || 0} active branches`}
          icon={Users}
          iconBg="bg-amber-100"
          iconColor="text-amber-600"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="xl:col-span-2 card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="section-title mb-0">Revenue Overview</h3>
            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
              {(['week', 'month', 'year'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all capitalize ${period === p ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16a34a" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: any) => [`${currency} ${Number(v).toLocaleString()}`, 'Revenue']} />
              <Area type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={2} fill="url(#revenueGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Bookings by Sport */}
        <div className="card">
          <h3 className="section-title">Bookings by Sport</h3>
          {statsData?.bySport?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statsData.bySport} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={75} label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {statsData.bySport.map((_: any, i: number) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Legend iconType="circle" iconSize={8} formatter={(v) => <span className="text-xs text-gray-600">{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-gray-400 text-sm">No data available</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title mb-0">Recent Bookings</h3>
            <Link to="/admin/bookings" className="text-xs text-brand-600 font-medium hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {data?.recentBookings?.slice(0, 6).map((booking: Booking) => (
              <div key={booking.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 text-base">
                  {booking.court?.sports?.some((s) => s.name.includes('Football')) ? '⚽' : booking.court?.sports?.some((s) => s.name.includes('Cricket')) ? '🏏' : '🏸'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{booking.customer?.name}</p>
                  <p className="text-xs text-gray-500 truncate">{booking.court?.name} · {dayjs(booking.date).format('D MMM')} {booking.startTime}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-gray-900">LKR {Number(booking.totalAmount).toLocaleString()}</p>
                  <StatusBadge status={booking.status} />
                </div>
              </div>
            ))}
            {(!data?.recentBookings || data.recentBookings.length === 0) && (
              <p className="text-sm text-gray-400 text-center py-6">No bookings yet</p>
            )}
          </div>
        </div>

        {/* Court Utilization */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title mb-0">Court Overview</h3>
            <Link to="/admin/courts" className="text-xs text-brand-600 font-medium hover:underline">Manage</Link>
          </div>
          <div className="space-y-3">
            {data?.courtUtilization?.map((court: any) => (
              <div key={court.id} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                  <Building2 className="w-4 h-4 text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900 truncate">{court.name}</span>
                    <span className="text-xs text-gray-500 shrink-0 ml-2">{court._count?.bookings || 0} bookings</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-500 rounded-full transition-all"
                      style={{ width: `${Math.min((court._count?.bookings || 0) * 5, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
            {(!data?.courtUtilization || data.courtUtilization.length === 0) && (
              <p className="text-sm text-gray-400 text-center py-6">No courts found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
