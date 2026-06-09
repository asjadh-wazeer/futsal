import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { CalendarDays, TrendingUp, Users, Building2, Clock, ArrowRight, MapPin } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';
import { ownerApi } from '../../services/api';
import { RootState } from '../../store';
import { Branch } from '../../types';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import dayjs from 'dayjs';

export default function OwnerDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [branches, setBranches] = useState<Branch[]>([]);
  const admin = useSelector((s: RootState) => s.auth.admin);
  const currency = admin?.business?.currency || 'LKR';

  const load = async (branchId?: string) => {
    setLoading(true);
    try {
      const [dash, analytics] = await Promise.all([
        ownerApi.getDashboard(branchId ? { branchId } : {}),
        ownerApi.getAnalytics({ period: 'month', ...(branchId ? { branchId } : {}) }),
      ]);
      setData(dash.data);
      setRevenueData(analytics.data.revenueChart || []);
      if (dash.data.branches) setBranches(dash.data.branches);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleBranchChange = (branchId: string) => {
    setSelectedBranch(branchId);
    load(branchId || undefined);
  };

  if (loading && !data) return <LoadingSpinner size="lg" className="min-h-[60vh]" />;

  const greeting = dayjs().hour() < 12 ? 'morning' : dayjs().hour() < 17 ? 'afternoon' : 'evening';
  const activeBranchName = branches.find((b) => b.id === selectedBranch)?.name;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Good {greeting}, {admin?.name?.split(' ')[0]}!</h2>
          <p className="text-gray-500 text-sm mt-0.5">{dayjs().format('dddd, MMMM D, YYYY')}</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Branch filter */}
          {branches.length > 1 && (
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <select
                value={selectedBranch}
                onChange={(e) => handleBranchChange(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm font-medium bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer"
              >
                <option value="">All Branches</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          )}
          <Link to="/owner/bookings" className="hidden sm:flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors">
            All Bookings <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {activeBranchName && (
        <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-100 rounded-xl text-sm text-emerald-700 font-medium w-fit">
          <MapPin className="w-4 h-4" />
          Showing data for: <span className="font-bold">{activeBranchName}</span>
        </div>
      )}

      {loading ? (
        <LoadingSpinner size="lg" className="min-h-[40vh]" />
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            {[
              { label: "Today's Bookings", value: data?.today?.bookings ?? 0, sub: `${currency} ${(data?.today?.revenue || 0).toLocaleString()} revenue`, icon: CalendarDays, bg: 'bg-emerald-50', color: 'text-emerald-600' },
              { label: 'This Week', value: data?.week?.bookings ?? 0, sub: `${currency} ${(data?.week?.revenue || 0).toLocaleString()}`, icon: TrendingUp, bg: 'bg-blue-50', color: 'text-blue-600' },
              { label: 'This Month', value: data?.month?.bookings ?? 0, sub: `${currency} ${(data?.month?.revenue || 0).toLocaleString()}`, icon: TrendingUp, bg: 'bg-purple-50', color: 'text-purple-600' },
              { label: 'Your Customers', value: data?.totalCustomers ?? 0, sub: 'Total unique customers', icon: Users, bg: 'bg-amber-50', color: 'text-amber-600' },
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
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-gray-900">Monthly Revenue</h3>
                <Link to="/owner/analytics" className="text-xs text-emerald-600 font-medium hover:underline">Full analytics →</Link>
              </div>
              {revenueData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="ownerRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#059669" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v: any) => [`${currency} ${Number(v).toLocaleString()}`, 'Revenue']} />
                    <Area type="monotone" dataKey="revenue" stroke="#059669" strokeWidth={2} fill="url(#ownerRev)" />
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
                  <Clock className="w-4 h-4 text-emerald-600" /> Today's Schedule
                </h3>
                <span className="text-xs bg-emerald-100 text-emerald-700 font-semibold px-2 py-0.5 rounded-full">
                  {data?.todaySchedule?.length ?? 0} bookings
                </span>
              </div>
              <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                {data?.todaySchedule?.length > 0 ? data.todaySchedule.map((b: any) => (
                  <div key={b.id} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-xl">
                    <div className="text-center w-12 shrink-0">
                      <p className="text-xs font-bold text-emerald-700">{b.startTime}</p>
                      <p className="text-[10px] text-gray-400">{b.endTime}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{b.customer?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{b.court?.name}
                        {!selectedBranch && b.branch?.name && <span className="text-gray-400"> · {b.branch.name}</span>}
                      </p>
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

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Recent bookings */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">Recent Bookings</h3>
                <Link to="/owner/bookings" className="text-xs text-emerald-600 font-medium hover:underline">View all</Link>
              </div>
              <div className="space-y-3">
                {data?.recentBookings?.slice(0, 6).map((b: any) => (
                  <div key={b.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                    <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center text-base shrink-0">
                      {b.court?.sport?.icon || '🏟️'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{b.customer?.name}</p>
                      <p className="text-xs text-gray-500">{b.court?.name}
                        {!selectedBranch && b.branch?.name && ` · ${b.branch.name}`}
                        {` · `}{dayjs(b.date).format('D MMM')} {b.startTime}
                      </p>
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

            {/* Court overview */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">Courts</h3>
                <Link to="/owner/courts" className="text-xs text-emerald-600 font-medium hover:underline">Manage</Link>
              </div>
              <div className="space-y-3">
                {data?.courtStats?.map((court: any) => (
                  <div key={court.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-9 h-9 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0">
                      <Building2 className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{court.name}</p>
                      <p className="text-xs text-gray-500">
                        {court.sports?.[0]?.name || 'General'}{court.size ? ` · ${court.size}` : ''}
                        {!selectedBranch && court.branch?.name && ` · ${court.branch.name}`}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-emerald-600">
                        {currency} {Number(court.pricePerHour).toLocaleString()}
                        <span className="text-xs text-gray-400 font-normal">/hr</span>
                      </p>
                      <p className="text-xs text-gray-400">{court._count?.bookings ?? 0} bookings</p>
                    </div>
                  </div>
                ))}
                {(!data?.courtStats || data.courtStats.length === 0) && (
                  <div className="text-center py-6">
                    <p className="text-sm text-gray-400 mb-2">No courts set up yet</p>
                    <Link to="/owner/courts" className="text-xs text-emerald-600 font-medium hover:underline">Add your first court →</Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Branch overview cards (all-branch view only) */}
          {!selectedBranch && branches.length > 1 && (
            <div className="card">
              <h3 className="font-bold text-gray-900 mb-4">Branch Overview</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {branches.map((branch) => (
                  <button
                    key={branch.id}
                    onClick={() => handleBranchChange(branch.id)}
                    className="flex items-start gap-3 p-4 bg-gray-50 hover:bg-emerald-50 rounded-xl text-left transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 group-hover:bg-emerald-200 flex items-center justify-center shrink-0 transition-colors">
                      <MapPin className="w-5 h-5 text-emerald-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{branch.name}</p>
                      <p className="text-xs text-gray-500">{branch.city}</p>
                      <div className="flex gap-3 mt-1">
                        <span className="text-xs text-gray-400">{(branch as any)._count?.courts ?? 0} courts</span>
                        <span className="text-xs text-gray-400">{(branch as any)._count?.bookings ?? 0} bookings</span>
                        <span className="text-xs text-gray-400">{(branch as any)._count?.staff ?? 0} staff</span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${branch.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                      {branch.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
