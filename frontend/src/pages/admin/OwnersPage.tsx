import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Plus, ToggleLeft, ToggleRight, UserCheck, Building2, Clock, CheckCircle, XCircle, X, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { ownerApi, ownerRegistrationApi } from '../../services/api';
import { Admin } from '../../types';
import Modal from '../../components/ui/Modal';
import dayjs from 'dayjs';

type Tab = 'owners' | 'registrations';

type Registration = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  businessName: string;
  businessCity: string;
  businessAddress: string;
  businessPhone?: string;
  businessEmail?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  reviewedAt?: string;
  createdAt: string;
};

function ConfirmModal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

const STATUS_STYLES: Record<Registration['status'], string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  APPROVED: 'bg-emerald-100 text-emerald-700',
  REJECTED: 'bg-red-100 text-red-600',
};

export default function OwnersPage() {
  const [tab, setTab] = useState<Tab>('owners');

  // Owners tab state
  const [owners, setOwners] = useState<Admin[]>([]);
  const [businesses, setBusinesses] = useState<{ id: string; name: string }[]>([]);
  const [loadingOwners, setLoadingOwners] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', businessId: '' });

  // Registrations tab state
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loadingRegs, setLoadingRegs] = useState(true);
  const [rejectTarget, setRejectTarget] = useState<Registration | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [approveTarget, setApproveTarget] = useState<Registration | null>(null);
  const [actioning, setActioning] = useState(false);

  const loadAll = () => {
    setLoadingOwners(true);
    setLoadingRegs(true);
    Promise.all([ownerApi.getOwners(), ownerApi.getBusinesses()])
      .then(([o, b]) => { setOwners(o.data); setBusinesses(b.data); })
      .finally(() => setLoadingOwners(false));
    ownerRegistrationApi.getAll()
      .then((res) => setRegistrations(res.data))
      .finally(() => setLoadingRegs(false));
  };

  useEffect(() => { loadAll(); }, []);

  const pendingCount = registrations.filter((r) => r.status === 'PENDING').length;

  const handleCreate = async () => {
    if (!form.name || !form.email || !form.password || !form.businessId) {
      toast.error('All fields are required'); return;
    }
    setSaving(true);
    try {
      const res = await ownerApi.createOwner(form);
      setOwners((prev) => [res.data, ...prev]);
      setForm({ name: '', email: '', password: '', businessId: '' });
      setShowCreate(false);
      toast.success('Owner account created');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to create owner');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      const res = await ownerApi.toggleOwnerStatus(id);
      setOwners((prev) => prev.map((o) => o.id === id ? { ...o, isActive: res.data.isActive } : o));
      toast.success(res.data.isActive ? 'Owner activated' : 'Owner deactivated');
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleApprove = async () => {
    if (!approveTarget) return;
    setActioning(true);
    try {
      await ownerRegistrationApi.approve(approveTarget.id);
      setRegistrations((prev) => prev.map((r) => r.id === approveTarget.id ? { ...r, status: 'APPROVED' as const } : r));
      toast.success(`${approveTarget.businessName} approved — owner account created`);
      setApproveTarget(null);
      // Refresh owners list
      ownerApi.getOwners().then((res) => setOwners(res.data));
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to approve');
    } finally {
      setActioning(false);
    }
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    setActioning(true);
    try {
      await ownerRegistrationApi.reject(rejectTarget.id, rejectReason || undefined);
      setRegistrations((prev) => prev.map((r) => r.id === rejectTarget.id ? { ...r, status: 'REJECTED' as const, rejectionReason: rejectReason } : r));
      toast.success('Registration rejected');
      setRejectTarget(null);
      setRejectReason('');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to reject');
    } finally {
      setActioning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Futsal Owners</h2>
          <p className="text-sm text-gray-500">Manage owner accounts and registrations</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadAll} className="btn-ghost p-2" title="Refresh">
            <RefreshCw className="w-4 h-4" />
          </button>
          {tab === 'owners' && (
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              <Plus className="w-4 h-4" /> Create Owner
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setTab('owners')}
          className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${tab === 'owners' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Owners
        </button>
        <button
          onClick={() => setTab('registrations')}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${tab === 'registrations' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Registrations
          {pendingCount > 0 && (
            <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
              {pendingCount}
            </span>
          )}
        </button>
      </div>

      {/* Owners tab */}
      {tab === 'owners' && (
        loadingOwners ? (
          <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="card animate-pulse h-20 bg-gray-50" />)}</div>
        ) : owners.length === 0 ? (
          <div className="card text-center py-16">
            <UserCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="font-medium text-gray-500">No owner accounts yet</p>
            <p className="text-sm text-gray-400 mb-4">Create credentials for futsal center owners</p>
            <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700">
              Create First Owner
            </button>
          </div>
        ) : (
          <div className="card p-0 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50 border-b border-gray-100">
                  <th className="px-5 py-3">Owner</th>
                  <th className="px-5 py-3">Business</th>
                  <th className="px-5 py-3">Created</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {owners.map((owner) => (
                  <tr key={owner.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-sm">
                          {owner.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{owner.name}</p>
                          <p className="text-xs text-gray-400">{owner.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700">{(owner as any).business?.name || '—'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-gray-500">{dayjs(owner.createdAt).format('D MMM YYYY')}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${owner.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {owner.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleToggle(owner.id)}
                        className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${owner.isActive ? 'text-gray-500 hover:text-red-600' : 'text-gray-500 hover:text-green-600'}`}
                      >
                        {owner.isActive ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                        {owner.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Registrations tab */}
      {tab === 'registrations' && (
        loadingRegs ? (
          <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="card animate-pulse h-24 bg-gray-50" />)}</div>
        ) : registrations.length === 0 ? (
          <div className="card text-center py-16">
            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="font-medium text-gray-500">No registrations yet</p>
            <p className="text-sm text-gray-400">Futsal owners can register at <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">/owner/register</span></p>
          </div>
        ) : (
          <div className="space-y-3">
            {registrations.map((reg) => (
              <div key={reg.id} className="card">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-sm shrink-0">
                      {reg.name[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-gray-900">{reg.name}</p>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_STYLES[reg.status]}`}>
                          {reg.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{reg.email}{reg.phone && ` · ${reg.phone}`}</p>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                        <span className="flex items-center gap-1 text-xs text-gray-600">
                          <Building2 className="w-3.5 h-3.5 text-gray-400" />
                          <strong>{reg.businessName}</strong>
                        </span>
                        <span className="text-xs text-gray-500">{reg.businessCity}</span>
                        <span className="text-xs text-gray-400 truncate max-w-xs">{reg.businessAddress}</span>
                      </div>
                      {reg.rejectionReason && (
                        <p className="text-xs text-red-500 mt-1">Reason: {reg.rejectionReason}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">Submitted {dayjs(reg.createdAt).format('D MMM YYYY, h:mm A')}</p>
                    </div>
                  </div>

                  {reg.status === 'PENDING' && (
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => setApproveTarget(reg)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button
                        onClick={() => { setRejectTarget(reg); setRejectReason(''); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-lg transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  )}

                  {reg.status !== 'PENDING' && (
                    <div className="text-xs text-gray-400 shrink-0">
                      {reg.reviewedAt && dayjs(reg.reviewedAt).format('D MMM YYYY')}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Create Owner modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Owner Account" size="md">
        <div className="space-y-4">
          <div>
            <label className="label">Full Name *</label>
            <input type="text" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} placeholder="John Silva" className="input-field" />
          </div>
          <div>
            <label className="label">Email Address *</label>
            <input type="email" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} placeholder="owner@futsalcenter.lk" className="input-field" />
          </div>
          <div>
            <label className="label">Temporary Password *</label>
            <input type="text" value={form.password} onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Min. 8 characters" className="input-field" />
            <p className="text-xs text-gray-400 mt-1">The owner can change this after first login</p>
          </div>
          <div>
            <label className="label">Assign to Business *</label>
            <select value={form.businessId} onChange={(e) => setForm(f => ({ ...f, businessId: e.target.value }))} className="input-field">
              <option value="">Select business</option>
              {businesses.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowCreate(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
            <button onClick={handleCreate} disabled={saving} className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl">
              {saving ? 'Creating...' : 'Create Owner'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Approve confirmation */}
      {approveTarget && (
        <ConfirmModal title="Approve Registration" onClose={() => setApproveTarget(null)}>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              This will create an owner account and business profile for:
            </p>
            <div className="bg-gray-50 rounded-xl p-4 space-y-1">
              <p className="font-semibold text-gray-900">{approveTarget.name}</p>
              <p className="text-sm text-gray-500">{approveTarget.email}</p>
              <p className="text-sm font-medium text-gray-700 mt-1">{approveTarget.businessName} · {approveTarget.businessCity}</p>
            </div>
            <p className="text-xs text-gray-400">The owner will be able to log in at <span className="font-mono bg-gray-100 px-1 py-0.5 rounded">/owner/login</span> using their registered email and password.</p>
            <div className="flex gap-3 pt-1">
              <button onClick={() => setApproveTarget(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleApprove} disabled={actioning} className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors">
                {actioning ? 'Approving…' : 'Approve & Create Account'}
              </button>
            </div>
          </div>
        </ConfirmModal>
      )}

      {/* Reject modal */}
      {rejectTarget && (
        <ConfirmModal title="Reject Registration" onClose={() => setRejectTarget(null)}>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Rejecting registration from <strong>{rejectTarget.name}</strong> for <strong>{rejectTarget.businessName}</strong>.
            </p>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Reason (optional)</label>
              <input
                type="text"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="input-field"
                placeholder="e.g. Incomplete information, duplicate application…"
              />
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={() => setRejectTarget(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleReject} disabled={actioning} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors">
                {actioning ? 'Rejecting…' : 'Reject'}
              </button>
            </div>
          </div>
        </ConfirmModal>
      )}
    </div>
  );
}
