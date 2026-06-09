import { useEffect, useState } from 'react';
import { Plus, ToggleLeft, ToggleRight, UserCheck, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { ownerApi } from '../../services/api';
import { Admin } from '../../types';
import Modal from '../../components/ui/Modal';
import dayjs from 'dayjs';

export default function OwnersPage() {
  const [owners, setOwners] = useState<Admin[]>([]);
  const [businesses, setBusinesses] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', businessId: '' });

  useEffect(() => {
    Promise.all([ownerApi.getOwners(), ownerApi.getBusinesses()])
      .then(([o, b]) => { setOwners(o.data); setBusinesses(b.data); })
      .finally(() => setLoading(false));
  }, []);

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Futsal Owners</h2>
          <p className="text-sm text-gray-500">Manage owner portal access</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" /> Create Owner
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="card animate-pulse h-20 bg-gray-50" />)}
        </div>
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
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      owner.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {owner.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => handleToggle(owner.id)}
                      className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                        owner.isActive ? 'text-gray-500 hover:text-red-600' : 'text-gray-500 hover:text-green-600'
                      }`}
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
      )}

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
    </div>
  );
}
