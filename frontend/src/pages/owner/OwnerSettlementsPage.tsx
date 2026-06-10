import { useEffect, useState } from 'react';
import { CheckCircle, Clock, DollarSign, TrendingUp } from 'lucide-react';
import { ownerApi } from '../../services/api';
import dayjs from 'dayjs';

type Settlement = {
  id: string;
  month: string;
  totalBookings: number;
  grossRevenue: number;
  platformFees: number;
  ownerAmount: number;
  status: 'PENDING' | 'PAID';
  paidAt: string | null;
  notes: string | null;
};

export default function OwnerSettlementsPage() {
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [totalPaid, setTotalPaid] = useState(0);
  const [totalPending, setTotalPending] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ownerApi.getSettlements()
      .then((res) => {
        const data = res.data;
        if (Array.isArray(data)) {
          setSettlements(data);
        } else {
          setSettlements(data.settlements || []);
          setTotalPaid(data.totalPaid || 0);
          setTotalPending(data.totalPending || 0);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const paid = settlements.filter((s) => s.status === 'PAID');
  const pending = settlements.filter((s) => s.status === 'PENDING');
  const calcTotal = (arr: Settlement[]) => arr.reduce((s, x) => s + Number(x.ownerAmount), 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Settlements</h2>
        <p className="text-sm text-gray-500">Your monthly revenue payouts</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center mb-3">
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">LKR {calcTotal(pending).toLocaleString()}</p>
          <p className="text-sm font-medium text-gray-700 mt-0.5">Pending Payout</p>
          <p className="text-xs text-gray-400 mt-0.5">{pending.length} month{pending.length !== 1 ? 's' : ''} awaiting payment</p>
        </div>
        <div className="card">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center mb-3">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">LKR {calcTotal(paid).toLocaleString()}</p>
          <p className="text-sm font-medium text-gray-700 mt-0.5">Total Received</p>
          <p className="text-xs text-gray-400 mt-0.5">{paid.length} settlement{paid.length !== 1 ? 's' : ''} paid</p>
        </div>
        <div className="card">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">LKR {calcTotal(settlements).toLocaleString()}</p>
          <p className="text-sm font-medium text-gray-700 mt-0.5">All Time Revenue</p>
          <p className="text-xs text-gray-400 mt-0.5">{settlements.length} total settlement{settlements.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="space-y-px">{[1,2,3].map((i) => <div key={i} className="h-16 bg-gray-50 animate-pulse border-b border-gray-100" />)}</div>
        ) : settlements.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <DollarSign className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="font-medium">No settlements yet</p>
            <p className="text-sm mt-1">Settlements are generated monthly by the platform admin</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50 border-b border-gray-100">
                  <th className="px-5 py-3">Month</th>
                  <th className="px-5 py-3">Bookings</th>
                  <th className="px-5 py-3">Gross Revenue</th>
                  <th className="px-5 py-3">Platform Fee</th>
                  <th className="px-5 py-3">Your Amount</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {settlements.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-semibold text-gray-900">{dayjs(s.month + '-01').format('MMMM YYYY')}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm text-gray-700">{s.totalBookings}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm text-gray-700">LKR {Number(s.grossRevenue).toLocaleString()}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm text-gray-500">LKR {Number(s.platformFees).toLocaleString()}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm font-bold text-emerald-700">LKR {Number(s.ownerAmount).toLocaleString()}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      {s.status === 'PAID' ? (
                        <div>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                            <CheckCircle className="w-3 h-3" /> Paid
                          </span>
                          {s.paidAt && <p className="text-[10px] text-gray-400 mt-0.5">{dayjs(s.paidAt).format('D MMM YYYY')}</p>}
                          {s.notes && <p className="text-[10px] text-gray-400">{s.notes}</p>}
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                          <Clock className="w-3 h-3" /> Pending
                        </span>
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
  );
}
