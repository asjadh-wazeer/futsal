import { useEffect, useState } from 'react';
import { Plus, Edit2, MapPin, Phone, Mail, Clock, Building2, CalendarDays, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { ownerApi } from '../../services/api';
import { Branch } from '../../types';
import Modal from '../../components/ui/Modal';

const HOURS = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);

const emptyForm = {
  name: '', address: '', city: '', phone: '', email: '',
  mapUrl: '', openTime: '06:00', closeTime: '22:00', slotDuration: 60,
};

export default function OwnerFutsalsPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Branch | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    ownerApi.getBranches()
      .then((res) => setBranches(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (b: Branch) => {
    setEditing(b);
    setForm({
      name: b.name, address: b.address, city: b.city,
      phone: b.phone || '', email: b.email || '', mapUrl: (b as any).mapUrl || '',
      openTime: b.openTime, closeTime: b.closeTime, slotDuration: b.slotDuration,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.address.trim() || !form.city.trim()) {
      toast.error('Name, address and city are required');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        const res = await ownerApi.updateBranch(editing.id, form);
        setBranches((prev) => prev.map((b) => b.id === editing.id ? res.data : b));
        toast.success('Futsal updated');
      } else {
        const res = await ownerApi.createBranch(form);
        setBranches((prev) => [...prev, res.data]);
        toast.success('Futsal location added!');
      }
      setShowModal(false);
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const f = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => <div key={i} className="card animate-pulse h-36 bg-gray-50" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">My Futsal Locations</h2>
          <p className="text-sm text-gray-500">
            {branches.length === 0
              ? 'Add your futsal grounds so customers can find and book them'
              : `${branches.length} location${branches.length !== 1 ? 's' : ''} · Each location can have multiple courts`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="btn-ghost p-2" title="Refresh">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Location
          </button>
        </div>
      </div>

      {branches.length === 0 ? (
        <div className="card text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-emerald-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">No futsal locations yet</h3>
          <p className="text-sm text-gray-400 mb-2">Add your first futsal ground to start accepting bookings.</p>
          <p className="text-xs text-gray-400 mb-6">
            Each location can have multiple courts. For example:<br />
            <span className="font-medium text-gray-600">"Colombo Ground"</span> → Court A, Court B
          </p>
          <button onClick={openCreate} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors">
            Add First Location
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {branches.map((branch) => (
            <div key={branch.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{branch.name}</h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" /> {branch.city}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${branch.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {branch.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <button
                    onClick={() => openEdit(branch)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <span>{branch.address}</span>
                </div>
                {branch.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                    <span>{branch.phone}</span>
                  </div>
                )}
                {branch.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                    <span>{branch.email}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400 shrink-0" />
                  <span>{branch.openTime} – {branch.closeTime} · {branch.slotDuration} min slots</span>
                </div>
              </div>

              <div className="flex gap-3 pt-3 border-t border-gray-50">
                <div className="flex-1 text-center p-2 bg-gray-50 rounded-xl">
                  <p className="text-xl font-bold text-gray-900">{branch._count?.courts ?? 0}</p>
                  <p className="text-xs text-gray-500">Courts</p>
                </div>
                <div className="flex-1 text-center p-2 bg-gray-50 rounded-xl">
                  <p className="text-xl font-bold text-emerald-600">{branch._count?.bookings ?? 0}</p>
                  <p className="text-xs text-gray-500">Bookings</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? `Edit — ${editing.name}` : 'Add Futsal Location'}
        size="lg"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="label">Location Name *</label>
            <input
              type="text" value={form.name} onChange={f('name')}
              placeholder="e.g. Colombo Main Ground, Kandy Branch"
              className="input-field"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="label">Address *</label>
            <input
              type="text" value={form.address} onChange={f('address')}
              placeholder="123 Galle Road, Colombo 3"
              className="input-field"
            />
          </div>

          <div>
            <label className="label">City *</label>
            <input
              type="text" value={form.city} onChange={f('city')}
              placeholder="Colombo"
              className="input-field"
            />
          </div>

          <div>
            <label className="label">Phone</label>
            <input
              type="tel" value={form.phone} onChange={f('phone')}
              placeholder="+94 77 123 4567"
              className="input-field"
            />
          </div>

          <div>
            <label className="label">Email</label>
            <input
              type="email" value={form.email} onChange={f('email')}
              placeholder="info@myfutsal.lk"
              className="input-field"
            />
          </div>

          <div>
            <label className="label">Google Maps URL</label>
            <input
              type="url" value={form.mapUrl} onChange={f('mapUrl')}
              placeholder="https://maps.google.com/..."
              className="input-field"
            />
          </div>

          <div>
            <label className="label">Opening Time</label>
            <select value={form.openTime} onChange={f('openTime')} className="input-field">
              {HOURS.map((h) => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>

          <div>
            <label className="label">Closing Time</label>
            <select value={form.closeTime} onChange={f('closeTime')} className="input-field">
              {HOURS.map((h) => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>

          {editing && (
            <div>
              <label className="label">Status</label>
              <select
                value={(form as any).isActive === false ? 'inactive' : 'active'}
                onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.value === 'active' } as any))}
                className="input-field"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => setShowModal(false)}
            className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Location'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
