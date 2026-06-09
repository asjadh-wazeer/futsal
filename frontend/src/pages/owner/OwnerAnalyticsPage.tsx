import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { TrendingUp, CalendarDays, DollarSign, MapPin } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { ownerApi } from '../../services/api';
import { RootState } from '../../store';
import { Branch } from '../../types';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const PIE_COLORS = ['#059669', '#2563eb', '#d97706', '#7c3aed', '#dc2626', '#6b7280'];
const STATUS_COLORS: Record<string, string> = {
  CONFIRMED: '#059669', PENDING: '#d97706', COMPLETED: '#2563eb',
  CANCELLED: '#dc2626', NO_SHOW: '#6b7280',
};

type Period = 'today' | 'week' | 'month' | 'year' | 'custom';

export default function OwnerAnalyticsPage() {
  const [period, setPeriod] = useState<Period>('month');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [branches, setBranches] = useState<Branch[]>([]);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const admin = useSelector((s: RootState) => s.auth.admin);
  const currency = admin?.business?.currency || 'LKR';

  useEffect(() => {
    ownerApi.getBranches().then((res) => setBranches(res.data));
  }, []);

  const load = async (p: Period, f?: string, t?: string, branchId?: string) => {
    setLoading(true);
    try {
      const res = await ownerApi.getAnalytics({
        period: p,
        ...(p === 'custom' && f && t ? { from: f, to: t } : {}),
        ...(branchId ? { branchId } : {}),
      });
      setData(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(period, undefined, undefined, selectedBranch || undefined); }, []);

  const handlePeriod = (p: Period) => {
    setPeriod(p);
    if (p !== 'custom') load(p, undefined, undefined, selectedBranch || undefined);
  };

  const handleBranchChange = (branchId: string) => {
    setSelectedBranch(branchId);
    if (period !== 'custom') load(period, undefined, undefined, branchId || undefined);
    else if (from && to) load('custom', from, to, branchId || undefined);
  };

  const handleCustomApply = () => {
    if (from && to) load('custom', from, to, selectedBranch || undefined);
  };

  const PERIODS: { label: string; value: Period }[] = [
    { label: 'Today', value: 'today' },
    { label: 'Week', value: 'week' },
    { label: 'Month', value: 'month' },
    { label: 'Year', value: 'year' },
    { label: 'Custom', value: 'custom' },
  ];

  const activeBranchName = branches.find((b) => b.id === selectedBranch)?.name;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Analytics</h2>
        <p className="text-sm text-gray-500">Track revenue and booking performance</p>
      </div>

      {/* Filters bar */}
      <div className="card flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          {/* Period selector */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
            {PERIODS.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => handlePeriod(value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  period === value ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Branch filter */}
          {branches.length > 1 && (
            <div className="relative sm:ml-auto">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <select
                value={selectedBranch}
                onChange={(e) => handleBranchChange(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm font-medium bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer"
              >
                <option value="">All Branches</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {period === 'custom' && (
          <div className="flex items-center gap-2">
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="input-field py-1.5 text-sm" />
            <span className="text-gray-400 text-sm">to</span>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="input-field py-1.5 text-sm" />
            <button onClick={handleCustomApply} disabled={!from || !to} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg">
              Apply
            </button>
          </div>
        )}
      </div>

      {activeBranchName && (
        <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-100 rounded-xl text-sm text-emerald-700 font-medium w-fit">
          <MapPin className="w-4 h-4" />
          Showing: <span className="font-bold">{activeBranchName}</span>
        </div>
      )}

      {loading ? (
        <LoadingSpinner size="lg" className="min-h-[40vh]" />
      ) : !data ? null : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
            {[
              {
                label: 'Total Revenue', value: `${currency} ${(data.summary?.totalRevenue || 0).toLocaleString()}`,
                sub: 'From confirmed bookings', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50',
              },
              {
                label: 'Total Bookings', value: data.summary?.totalBookings || 0,
                sub: 'Non-cancelled bookings', icon: CalendarDays, color: 'text-blue-600', bg: 'bg-blue-50',
              },
              {
                label: 'Avg / Booking', value: `${currency} ${(data.summary?.avgPerBooking || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
                sub: 'Average booking value', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50',
              },
            ].map(({ label, value, sub, icon: Icon, color, bg }) => (
              <div key={label} className="card">
                <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <p className="text-2xl font-bold text-gray-900">{typeof value === 'number' ? value.toLocaleString() : value}</p>
                <p className="text-sm font-medium text-gray-700 mt-0.5">{label}</p>
                <p className="text-xs text-gray-400">{sub}</p>
              </div>
            ))}
          </div>

          {/* Revenue + bookings chart */}
          <div className="card">
            <h3 className="font-bold text-gray-900 mb-5">Revenue Over Time</h3>
            {data.revenueChart?.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={data.revenueChart}>
                  <defs>
                    <linearGradient id="aRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.length > 7 ? v.slice(5) : v} />
                  <YAxis yAxisId="rev" tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <YAxis yAxisId="bk" orientation="right" tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(v: any, name: string) => [
                      name === 'revenue' ? `${currency} ${Number(v).toLocaleString()}` : v,
                      name === 'revenue' ? 'Revenue' : 'Bookings',
                    ]}
                  />
                  <Area yAxisId="rev" type="monotone" dataKey="revenue" stroke="#059669" strokeWidth={2} fill="url(#aRev)" />
                  <Bar yAxisId="bk" dataKey="bookings" fill="#d1fae5" radius={[2, 2, 0, 0]} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[240px] flex items-center justify-center text-gray-400 text-sm">No data for this period</div>
            )}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Top courts */}
            <div className="card">
              <h3 className="font-bold text-gray-900 mb-4">Court Performance</h3>
              {data.topCourts?.length > 0 ? (
                <div className="space-y-3">
                  {data.topCourts.map((court: any, i: number) => {
                    const maxRevenue = data.topCourts[0]?.revenue || 1;
                    return (
                      <div key={i}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-gray-900 truncate max-w-[60%]">{court.name}</span>
                          <div className="text-right">
                            <span className="text-sm font-bold text-emerald-600">{currency} {court.revenue.toLocaleString()}</span>
                            <span className="text-xs text-gray-400 ml-1">({court.count} bookings)</span>
                          </div>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all"
                            style={{ width: `${(court.revenue / maxRevenue) * 100}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-[150px] flex items-center justify-center text-gray-400 text-sm">No data</div>
              )}
            </div>

            {/* Branch revenue breakdown (all-branch view only) */}
            {!selectedBranch && data.byBranch?.length > 1 ? (
              <div className="card">
                <h3 className="font-bold text-gray-900 mb-4">Revenue by Branch</h3>
                <div className="space-y-3">
                  {data.byBranch.map((branch: any, i: number) => {
                    const maxRevenue = data.byBranch[0]?.revenue || 1;
                    return (
                      <div key={i}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-gray-900 truncate max-w-[60%]">{branch.name}</span>
                          <div className="text-right">
                            <span className="text-sm font-bold text-blue-600">{currency} {branch.revenue.toLocaleString()}</span>
                            <span className="text-xs text-gray-400 ml-1">({branch.count} bookings)</span>
                          </div>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full transition-all"
                            style={{ width: `${(branch.revenue / maxRevenue) * 100}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="card">
                <h3 className="font-bold text-gray-900 mb-4">Booking Status</h3>
                {data.byStatus?.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={data.byStatus} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={70}
                        label={({ status, percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={false}>
                        {data.byStatus.map((entry: any, i: number) => (
                          <Cell key={i} fill={STATUS_COLORS[entry.status] || PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend iconType="circle" iconSize={8} formatter={(v) => <span className="text-xs text-gray-600 capitalize">{v.toLowerCase().replace('_', ' ')}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[200px] flex items-center justify-center text-gray-400 text-sm">No data</div>
                )}
              </div>
            )}

            {/* Booking status (only shown alongside branch revenue) */}
            {!selectedBranch && data.byBranch?.length > 1 && (
              <div className="card">
                <h3 className="font-bold text-gray-900 mb-4">Booking Status</h3>
                {data.byStatus?.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={data.byStatus} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={70}
                        label={({ status, percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={false}>
                        {data.byStatus.map((entry: any, i: number) => (
                          <Cell key={i} fill={STATUS_COLORS[entry.status] || PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend iconType="circle" iconSize={8} formatter={(v) => <span className="text-xs text-gray-600 capitalize">{v.toLowerCase().replace('_', ' ')}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[200px] flex items-center justify-center text-gray-400 text-sm">No data</div>
                )}
              </div>
            )}

            {/* Peak hours */}
            <div className="card">
              <h3 className="font-bold text-gray-900 mb-4">Peak Hours</h3>
              {data.peakHours?.length > 0 ? (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={data.peakHours} barSize={20}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip formatter={(v: any) => [v, 'Bookings']} />
                    <Bar dataKey="count" fill="#059669" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[180px] flex items-center justify-center text-gray-400 text-sm">No data</div>
              )}
            </div>

            {/* Sport distribution */}
            <div className="card">
              <h3 className="font-bold text-gray-900 mb-4">By Sport</h3>
              {data.bySport?.length > 0 ? (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={data.bySport} layout="vertical" barSize={16}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={70} />
                    <Tooltip formatter={(v: any) => [v, 'Bookings']} />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                      {data.bySport.map((_: any, i: number) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[180px] flex items-center justify-center text-gray-400 text-sm">No data</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
