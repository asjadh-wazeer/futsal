import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { CalendarDays, TrendingUp, Users, Clock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';
import { ownerApi } from '../../services/api';
import { RootState } from '../../store';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import dayjs from 'dayjs';

export default function StaffDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const admin = useSelector((s: RootState) => s.auth.admin);
  const currency = admin?.business?.currency || 'LKR';
  const branchId = admin?.branchId ?? undefined;

  useEffect(() => {
    Promise.all([
      ownerApi.getDashboard(branchId ? { branchId } : {}),
      ownerApi.getAnalytics({ period: 'month', ...(branchId ? { branchId } : {}) }),
    ])
      .then(([dash, analytics]) => {
        setData(dash.data);
        setRevenueData(analytics.data.revenueChart || []);
      })
      .finally(() => setLoading(false));
  }, [branchId]);

  if (loading) return <LoadingSpinner size="lg" className="min-h-[60vh]" />;

  const greeting = dayjs().hour() < 12 ? 'morning' : dayjs().hour() < 17 ? 'afternoon' : 'evening';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Good {greeting}, {admin?.name?.split(' ')[0]}!</h2>
          <p className="text-gray-500 text-sm mt-0.5">{dayjs().format('dddd, MMMM D, YYYY')}</p>
        </div>
        <Link to="/staff/bookings" className="hidden sm:flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors">
          Manage Bookings
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "Today's Bookings", value: data?.today?.bookings ?? 0, sub: `${currency} ${(data?.today?.revenue || 0).toLocaleString()} revenue`, icon: CalendarDays, bg: 'bg-blue-50', color: 'text-blue-600' },
          { label: 'This Week', value: data?.week?.bookings ?? 0, sub: `${currency} ${(data?.week?.revenue || 0).toLocaleString()}`, icon: TrendingUp, bg: 'bg-emerald-50', color: 'text-emerald-600' },
          { label: 'This Month', value: data?.month?.bookings ?? 0, sub: `${currency} ${(data?.month?.revenue || 0).toLocaleString()}`, icon: TrendingUp, bg: 'bg-purple-50', color: 'text-purple-600' },
          { label: 'Total Customers', value: data?.totalCustomers ?? 0, sub: 'Unique customers', icon: Users, bg: 'bg-amber-50', color: 'text-amber-600' },
        ].map(({ label, value, sub, icon: Icon, bg, color }) => (
          <div key={label} className="card">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
            <p className="text-sm font-medium text-gray-700 mt-0.5">{label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Revenue chart */}
        <div className="xl:col-span-2 card">
          <h3 className="font-bold text-gray-900 mb-5">Monthly Revenue</h3>
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="staffRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: any) => [`${currency} ${Number(v).toLocaleString()}`, 'Revenue']} />
                <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} fill="url(#staffRev)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-gray-400 text-sm">No bookings this month yet</div>
          )}
        </div>

        {/* Today's schedule */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" /> Today's Schedule
            </h3>
            <span className="text-xs bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-full">
              {data?.todaySchedule?.length ?? 0} bookings
            </span>
          </div>
          <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
            {data?.todaySchedule?.length > 0 ? data.todaySchedule.map((b: any) => (
              <div key={b.id} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-xl">
                <div className="text-center w-12 shrink-0">
                  <p className="text-xs font-bold text-blue-700">{b.startTime}</p>
                  <p className="text-[10px] text-gray-400">{b.endTime}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{b.customer?.name}</p>
                  <p className="text-xs text-gray-500 truncate">{b.court?.name}</p>
                </div>
                <StatusBadge status={b.status} />
              </div>
            )) : (
              <div className="h-[160px] flex flex-col items-center justify-center text-gray-400">
                <CalendarDays className="w-8 h-8 mb-2 opacity-30" />
                <p className="text-sm">No bookings today</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent bookings */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">Recent Bookings</h3>
          <Link to="/staff/bookings" className="text-xs text-blue-600 font-medium hover:underline">View all</Link>
        </div>
        <div className="space-y-3">
          {data?.recentBookings?.slice(0, 8).map((b: any) => (
            <div key={b.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-base shrink-0">
                🏟️
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{b.customer?.name}</p>
                <p className="text-xs text-gray-500">{b.court?.name} · {dayjs(b.date).format('D MMM')} {b.startTime}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold text-gray-900">{currency} {Number(b.totalAmount).toLocaleString()}</p>
                <StatusBadge status={b.status} />
              </div>
            </div>
          ))}
          {(!data?.recentBookings || data.recentBookings.length === 0) && (
            <p className="text-sm text-gray-400 text-center py-6">No bookings yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
