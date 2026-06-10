import { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { DollarSign, RefreshCw, CheckCircle, Clock, X, TrendingUp, Building2, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { settlementApi } from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import dayjs from 'dayjs';

type Settlement = {
  id: string;
  businessId: string;
  month: string;
  totalBookings: number;
  grossRevenue: number;
  platformFees: number;
  ownerAmount: number;
  status: 'PENDING' | 'PAID';
  paidAt: string | null;
  notes: string | null;
  business: { id: string; name: string; city: string | null };
};

type Outstanding = {
  count: number;
  totalOwnerAmount: number;
  totalPlatformFees: number;
  items: Settlement[];
};

function Portal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h3 className="font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-6 py-5 overflow-y-auto">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

function buildChartData(settlements: Settlement[]) {
  const byMonth: Record<string, { month: string; myEarnings: number; ownerPaid: number; ownerPending: number }> = {};
  for (const s of settlements) {
    if (!byMonth[s.month]) {
      byMonth[s.month] = {
        month: dayjs(s.month + '-01').format('MMM YY'),
        myEarnings: 0,
        ownerPaid: 0,
        ownerPending: 0,
      };
    }
    byMonth[s.month].myEarnings += Number(s.platformFees);
    if (s.status === 'PAID') byMonth[s.month].ownerPaid += Number(s.ownerAmount);
    else byMonth[s.month].ownerPending += Number(s.ownerAmount);
  }
  return Object.entries(byMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([, v]) => v);
}

export default function SettlementsPage() {
  const [allSettlements, setAllSettlements] = useState<Settlement[]>([]);
  const [outstanding, setOutstanding] = useState<Outstanding | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('');

  const [showGenerate, setShowGenerate] = useState(false);
  const [generateMonth, setGenerateMonth] = useState(dayjs().format('YYYY-MM'));
  const [generating, setGenerating] = useState(false);

  const [confirmPay, setConfirmPay] = useState<Settlement | null>(null);
  const [payNotes, setPayNotes] = useState('');
  const [paying, setPaying] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [sRes, oRes] = await Promise.all([
        settlementApi.getAll({}),
        settlementApi.getOutstanding(),
      ]);
      setAllSettlements(sRes.data);
      setOutstanding(oRes.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filteredSettlements = allSettlements.filter((s) => {
    if (statusFilter && s.status !== statusFilter) return false;
    if (monthFilter && s.month !== monthFilter) return false;
    return true;
  });

  const totalMyEarnings = allSettlements.reduce((s, x) => s + Number(x.platformFees), 0);
  const totalPaidToOwners = allSettlements.filter((s) => s.status === 'PAID').reduce((s, x) => s + Number(x.ownerAmount), 0);
  const totalGross = allSettlements.reduce((s, x) => s + Number(x.grossRevenue), 0);
  const pendingOwnerTotal = outstanding?.totalOwnerAmount ?? 0;
  const pendingFeeTotal = outstanding?.totalPlatformFees ?? 0;
  const pendingItems = outstanding?.items ?? [];
  const chartData = buildChartData(allSettlements);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await settlementApi.generate(generateMonth);
      toast.success(`Generated ${res.data.length} settlement(s) for ${generateMonth}`);
      setShowGenerate(false);
      load();
    } catch {
      toast.error('Failed to generate settlements');
    } finally {
      setGenerating(false);
    }
  };

  const handleMarkPaid = async () => {
    if (!confirmPay) return;
    setPaying(true);
    try {
      await settlementApi.markPaid(confirmPay.id, payNotes || undefined);
      toast.success('Settlement marked as paid');
      setConfirmPay(null);
      setPayNotes('');
      load();
    } catch {
      toast.error('Failed to update settlement');
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Finance & Settlements</h2>
          <p className="text-sm text-gray-500">Weekly payouts to futsal owners · LKR 150 per booking is your platform profit</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="btn-ghost p-2" title="Refresh">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowGenerate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            <Calendar className="w-4 h-4" />
            Generate Settlement
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="card border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center mb-3">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-700">LKR {totalMyEarnings.toLocaleString()}</p>
          <p className="text-sm font-semibold text-gray-700 mt-0.5">My Total Earnings</p>
          <p className="text-xs text-gray-400 mt-0.5">Platform fees — all time</p>
        </div>

        <div className="card border border-amber-100 bg-gradient-to-br from-amber-50 to-white">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center mb-3">
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-amber-700">LKR {pendingOwnerTotal.toLocaleString()}</p>
          <p className="text-sm font-semibold text-gray-700 mt-0.5">Owed to Owners</p>
          <p className="text-xs text-gray-400 mt-0.5">{outstanding?.count ?? 0} pending payout{(outstanding?.count ?? 0) !== 1 ? 's' : ''}</p>
        </div>

        <div className="card border border-blue-100 bg-gradient-to-br from-blue-50 to-white">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center mb-3">
            <CheckCircle className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-700">LKR {totalPaidToOwners.toLocaleString()}</p>
          <p className="text-sm font-semibold text-gray-700 mt-0.5">Paid to Owners</p>
          <p className="text-xs text-gray-400 mt-0.5">All-time settled</p>
        </div>

        <div className="card">
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center mb-3">
            <DollarSign className="w-5 h-5 text-gray-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">LKR {totalGross.toLocaleString()}</p>
          <p className="text-sm font-semibold text-gray-700 mt-0.5">Total Gross Revenue</p>
          <p className="text-xs text-gray-400 mt-0.5">Customer payments — all time</p>
        </div>
      </div>

      {/* Pending Payouts — main action section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-gray-900">Pending Payouts</h3>
            {pendingItems.length > 0 && (
              <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {pendingItems.length} outstanding
              </span>
            )}
          </div>
          {pendingItems.length > 0 && (
            <div className="text-sm text-gray-500">
              Total to pay owners:{' '}
              <span className="font-bold text-amber-700">LKR {pendingOwnerTotal.toLocaleString()}</span>
              <span className="mx-2 text-gray-300">·</span>
              Your profit this cycle:{' '}
              <span className="font-bold text-emerald-600">LKR {pendingFeeTotal.toLocaleString()}</span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1, 2].map((i) => <div key={i} className="card h-56 animate-pulse bg-gray-50" />)}
          </div>
        ) : pendingItems.length === 0 ? (
          <div className="card text-center py-10 border-2 border-dashed border-gray-200">
            <CheckCircle className="w-12 h-12 text-emerald-300 mx-auto mb-3" />
            <p className="font-semibold text-gray-600">All settled up!</p>
            <p className="text-sm text-gray-400 mt-1">No pending payouts. Generate a settlement to calculate this cycle.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {pendingItems.map((s) => {
              const feePercent = Number(s.grossRevenue) > 0
                ? ((Number(s.platformFees) / Number(s.grossRevenue)) * 100).toFixed(0)
                : 0;
              const ownerPercent = Number(s.grossRevenue) > 0
                ? ((Number(s.ownerAmount) / Number(s.grossRevenue)) * 100).toFixed(0)
                : 0;
              return (
                <div key={s.id} className="card border border-amber-200 bg-gradient-to-br from-white to-amber-50/60 flex flex-col">
                  {/* Card header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                        <Building2 className="w-5 h-5 text-amber-700" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 leading-tight">{s.business.name}</p>
                        <p className="text-xs text-gray-500">{s.business.city}</p>
                      </div>
                    </div>
                    <span className="text-[11px] bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full shrink-0">
                      {dayjs(s.month + '-01').format('MMM YYYY')}
                    </span>
                  </div>

                  {/* Finance breakdown */}
                  <div className="space-y-2 mb-4 flex-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">{s.totalBookings} booking{s.totalBookings !== 1 ? 's' : ''}</span>
                      <span className="font-medium text-gray-700">LKR {Number(s.grossRevenue).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-emerald-600 font-medium">My profit (platform fee)</span>
                      <span className="font-bold text-emerald-600">LKR {Number(s.platformFees).toLocaleString()}</span>
                    </div>
                    <div className="border-t border-amber-200 pt-2.5 flex justify-between items-center">
                      <span className="text-sm font-bold text-gray-800">Pay to owner</span>
                      <span className="text-lg font-bold text-amber-700">LKR {Number(s.ownerAmount).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Proportion bar */}
                  <div className="mb-1">
                    <div className="flex h-2.5 rounded-full overflow-hidden bg-gray-100">
                      <div
                        className="bg-emerald-500 transition-all"
                        style={{ width: `${feePercent}%` }}
                        title={`My profit: ${feePercent}%`}
                      />
                      <div
                        className="bg-amber-400 transition-all"
                        style={{ width: `${ownerPercent}%` }}
                        title={`Owner: ${ownerPercent}%`}
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-[10px] text-emerald-600 font-medium">Me: {feePercent}%</span>
                      <span className="text-[10px] text-amber-600 font-medium">Owner: {ownerPercent}%</span>
                    </div>
                  </div>

                  <button
                    onClick={() => { setConfirmPay(s); setPayNotes(''); }}
                    className="mt-3 w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Mark as Paid
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Monthly Finance Chart */}
      {chartData.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-gray-900">Monthly Finance Overview</h3>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" />My Earnings</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-blue-500 inline-block" />Paid to Owners</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-amber-400 inline-block" />Pending Payouts</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} barSize={18} barGap={3}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(v: any, name: string) => [
                  `LKR ${Number(v).toLocaleString()}`,
                  name === 'myEarnings' ? 'My Earnings' : name === 'ownerPaid' ? 'Paid to Owners' : 'Pending Payouts',
                ]}
              />
              <Bar dataKey="myEarnings" fill="#059669" radius={[3, 3, 0, 0]} name="myEarnings" />
              <Bar dataKey="ownerPaid" fill="#2563eb" radius={[3, 3, 0, 0]} name="ownerPaid" />
              <Bar dataKey="ownerPending" fill="#f59e0b" radius={[3, 3, 0, 0]} name="ownerPending" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Settlement History Table */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          <h3 className="font-bold text-gray-900">Settlement History</h3>
          <div className="flex items-center gap-2 ml-auto flex-wrap">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field sm:w-36 py-1.5 text-sm"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="PAID">Paid</option>
            </select>
            <input
              type="month"
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="input-field sm:w-40 py-1.5 text-sm"
            />
            {(statusFilter || monthFilter) && (
              <button
                onClick={() => { setStatusFilter(''); setMonthFilter(''); }}
                className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1.5"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="card p-0 overflow-hidden">
          {loading ? (
            <div className="space-y-px">
              {[1, 2, 3, 4].map((i) => <div key={i} className="h-16 bg-gray-50 animate-pulse border-b border-gray-100" />)}
            </div>
          ) : filteredSettlements.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <DollarSign className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="font-medium">No settlements found</p>
              <p className="text-sm mt-1">Generate a settlement to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50 border-b border-gray-100">
                    <th className="px-5 py-3">Owner / Business</th>
                    <th className="px-5 py-3">Month</th>
                    <th className="px-5 py-3">Bookings</th>
                    <th className="px-5 py-3">Gross Revenue</th>
                    <th className="px-5 py-3 text-emerald-700">My Profit</th>
                    <th className="px-5 py-3 text-amber-700">Pay to Owner</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredSettlements.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                            <Building2 className="w-4 h-4 text-gray-500" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{s.business.name}</p>
                            <p className="text-xs text-gray-400">{s.business.city}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-sm font-medium text-gray-900">{dayjs(s.month + '-01').format('MMMM YYYY')}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
                          {s.totalBookings} bookings
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm font-medium text-gray-900">LKR {Number(s.grossRevenue).toLocaleString()}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm font-bold text-emerald-600">LKR {Number(s.platformFees).toLocaleString()}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm font-bold text-amber-700">LKR {Number(s.ownerAmount).toLocaleString()}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        {s.status === 'PAID' ? (
                          <div>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                              <CheckCircle className="w-3 h-3" /> Paid
                            </span>
                            {s.paidAt && <p className="text-[10px] text-gray-400 mt-0.5">{dayjs(s.paidAt).format('D MMM YYYY')}</p>}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                            <Clock className="w-3 h-3" /> Pending
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        {s.status === 'PENDING' && (
                          <button
                            onClick={() => { setConfirmPay(s); setPayNotes(''); }}
                            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-600 text-white transition-colors"
                          >
                            Mark Paid
                          </button>
                        )}
                        {s.status === 'PAID' && s.notes && (
                          <p className="text-xs text-gray-400 max-w-[120px] truncate" title={s.notes}>{s.notes}</p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Generate Settlement Modal */}
      {showGenerate && (
        <Portal title="Generate Settlement" onClose={() => setShowGenerate(false)}>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Calculates all confirmed bookings for the selected month and creates settlement records for each futsal business.
            </p>
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-sm text-emerald-700">
              <strong>Your platform fee (LKR 150/booking)</strong> will be automatically deducted from each business's gross revenue.
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Month</label>
              <input
                type="month"
                value={generateMonth}
                onChange={(e) => setGenerateMonth(e.target.value)}
                className="input-field"
              />
            </div>
            <div className="flex gap-3 pt-2 pb-4">
              <button
                type="button"
                onClick={() => setShowGenerate(false)}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="flex-1 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                {generating ? 'Generating…' : 'Generate'}
              </button>
            </div>
          </div>
        </Portal>
      )}

      {/* Mark Paid Confirmation Modal */}
      {confirmPay && (
        <Portal title="Confirm Payment" onClose={() => setConfirmPay(null)}>
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2.5">
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="w-4 h-4 text-amber-600" />
                <span className="font-bold text-gray-900">{confirmPay.business.name}</span>
                {confirmPay.business.city && <span className="text-xs text-gray-400">· {confirmPay.business.city}</span>}
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Period</span>
                <span className="font-semibold text-gray-900">{dayjs(confirmPay.month + '-01').format('MMMM YYYY')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Bookings</span>
                <span className="font-semibold text-gray-900">{confirmPay.totalBookings}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Gross Revenue</span>
                <span className="font-medium text-gray-900">LKR {Number(confirmPay.grossRevenue).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-amber-200 pt-2">
                <span className="text-emerald-600 font-semibold">My profit (platform fee)</span>
                <span className="font-bold text-emerald-600">LKR {Number(confirmPay.platformFees).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center bg-white border border-amber-200 rounded-lg px-3 py-2">
                <span className="text-sm font-bold text-gray-900">Amount to pay owner</span>
                <span className="text-lg font-bold text-amber-700">LKR {Number(confirmPay.ownerAmount).toLocaleString()}</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Payment Notes (optional)</label>
              <input
                type="text"
                value={payNotes}
                onChange={(e) => setPayNotes(e.target.value)}
                className="input-field"
                placeholder="e.g. Bank transfer to acc. 1234"
              />
            </div>
            <div className="flex gap-3 pt-2 pb-4">
              <button
                type="button"
                onClick={() => setConfirmPay(null)}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleMarkPaid}
                disabled={paying}
                className="flex-1 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-colors"
              >
                {paying ? 'Saving…' : 'Confirm Payment'}
              </button>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}
