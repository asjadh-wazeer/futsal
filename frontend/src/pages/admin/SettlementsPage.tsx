import { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { DollarSign, RefreshCw, CheckCircle, Clock, X, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { settlementApi } from '../../services/api';
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
};

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
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

export default function SettlementsPage() {
  const [settlements, setSettlements] = useState<Settlement[]>([]);
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
        settlementApi.getAll({ status: statusFilter || undefined, month: monthFilter || undefined }),
        settlementApi.getOutstanding(),
      ]);
      setSettlements(sRes.data);
      setOutstanding(oRes.data);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, monthFilter]);

  useEffect(() => { load(); }, [load]);

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

  const pendingCount = settlements.filter((s) => s.status === 'PENDING').length;
  const paidCount = settlements.filter((s) => s.status === 'PAID').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Settlements</h2>
          <p className="text-sm text-gray-500">Monthly payouts to futsal owners</p>
        </div>
        <button
          onClick={() => setShowGenerate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Generate Settlement
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center mb-3">
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{outstanding?.count ?? 0}</p>
          <p className="text-sm font-medium text-gray-700 mt-0.5">Pending Settlements</p>
          <p className="text-xs text-gray-400 mt-0.5">LKR {(outstanding?.totalOwnerAmount ?? 0).toLocaleString()} owed to owners</p>
        </div>
        <div className="card">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center mb-3">
            <DollarSign className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">LKR {(outstanding?.totalPlatformFees ?? 0).toLocaleString()}</p>
          <p className="text-sm font-medium text-gray-700 mt-0.5">Platform Fees (Pending)</p>
          <p className="text-xs text-gray-400 mt-0.5">Your earnings from outstanding months</p>
        </div>
        <div className="card">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
            <CheckCircle className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{paidCount}</p>
          <p className="text-sm font-medium text-gray-700 mt-0.5">Paid Settlements</p>
          <p className="text-xs text-gray-400 mt-0.5">{pendingCount} pending</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card flex flex-wrap gap-3 py-3">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field sm:w-40">
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="PAID">Paid</option>
        </select>
        <input
          type="month"
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
          className="input-field sm:w-44"
        />
        {(statusFilter || monthFilter) && (
          <button onClick={() => { setStatusFilter(''); setMonthFilter(''); }} className="text-sm text-gray-500 hover:text-gray-700">
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="space-y-px">{[1,2,3,4].map((i) => <div key={i} className="h-16 bg-gray-50 animate-pulse border-b border-gray-100" />)}</div>
        ) : settlements.length === 0 ? (
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
                  <th className="px-5 py-3">Platform Fees</th>
                  <th className="px-5 py-3">Owner Amount</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {settlements.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-semibold text-gray-900">{s.business.name}</p>
                      <p className="text-xs text-gray-400">{s.business.city}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-medium text-gray-900">{dayjs(s.month + '-01').format('MMMM YYYY')}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm text-gray-700">{s.totalBookings}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm font-medium text-gray-900">LKR {Number(s.grossRevenue).toLocaleString()}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm font-semibold text-emerald-700">LKR {Number(s.platformFees).toLocaleString()}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm font-bold text-gray-900">LKR {Number(s.ownerAmount).toLocaleString()}</span>
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
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                        >
                          Mark Paid
                        </button>
                      )}
                      {s.notes && s.status === 'PAID' && (
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

      {/* Generate modal */}
      {showGenerate && (
        <Modal title="Generate Settlement" onClose={() => setShowGenerate(false)}>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              This will calculate all confirmed bookings for the selected month and create/update settlement records for each business.
            </p>
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
              <button type="button" onClick={() => setShowGenerate(false)} className="flex-1 px-4 py-2.5 border border-gray-200 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleGenerate} disabled={generating} className="flex-1 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors">
                {generating ? 'Generating…' : 'Generate'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Mark paid modal */}
      {confirmPay && (
        <Modal title="Mark as Paid" onClose={() => setConfirmPay(null)}>
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Business</span>
                <span className="font-semibold text-gray-900">{confirmPay.business.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Month</span>
                <span className="font-semibold text-gray-900">{dayjs(confirmPay.month + '-01').format('MMMM YYYY')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Amount to Pay</span>
                <span className="font-bold text-gray-900">LKR {Number(confirmPay.ownerAmount).toLocaleString()}</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Notes (optional)</label>
              <input
                type="text"
                value={payNotes}
                onChange={(e) => setPayNotes(e.target.value)}
                className="input-field"
                placeholder="e.g. Paid via bank transfer"
              />
            </div>
            <div className="flex gap-3 pt-2 pb-4">
              <button type="button" onClick={() => setConfirmPay(null)} className="flex-1 px-4 py-2.5 border border-gray-200 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleMarkPaid} disabled={paying} className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors">
                {paying ? 'Saving…' : 'Confirm Payment'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
