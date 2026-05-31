import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi } from '../../services/api';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Branch } from '../../types';

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Branch | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', address: '', city: '', phone: '', email: '', openTime: '06:00', closeTime: '22:00', slotDuration: '60' });

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getBranches();
      setBranches(res.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', address: '', city: '', phone: '', email: '', openTime: '06:00', closeTime: '22:00', slotDuration: '60' });
    setModalOpen(true);
  };

  const openEdit = (b: Branch) => {
    setEditing(b);
    setForm({ name: b.name, address: b.address, city: b.city, phone: b.phone || '', email: b.email || '', openTime: b.openTime, closeTime: b.closeTime, slotDuration: String(b.slotDuration) });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, slotDuration: parseInt(form.slotDuration) };
      if (editing) { await adminApi.updateBranch(editing.id, payload); toast.success('Branch updated'); }
      else { await adminApi.createBranch(payload); toast.success('Branch created'); }
      setModalOpen(false);
      load();
    } catch { toast.error('Failed to save branch'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deactivate this branch?')) return;
    await adminApi.deleteBranch(id);
    toast.success('Branch deactivated');
    load();
  };

  const f = (k: keyof typeof form, label: string, type = 'text', req = true) => (
    <div>
      <label className="label">{label}</label>
      <input type={type} value={form[k]} onChange={(e) => setForm(x => ({ ...x, [k]: e.target.value }))} required={req} className="input-field" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h2 className="page-title">Branches</h2>
          <p className="text-sm text-gray-500 mt-0.5">{branches.length} branches</p>
        </div>
        <button onClick={openAdd} className="btn-primary text-sm"><Plus className="w-4 h-4" /> Add Branch</button>
      </div>

      {loading ? <LoadingSpinner size="lg" className="py-16" /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {branches.map((b) => (
            <div key={b.id} className="card hover:shadow-card-hover transition-all">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center shrink-0">
                  <MapPin className="w-6 h-6 text-brand-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900">{b.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${b.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>{b.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                  <p className="text-sm text-gray-500">{b.address}</p>
                  <p className="text-xs text-brand-600 font-medium">{b.city}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 text-xs text-center border-t border-gray-100 pt-4 mb-4">
                <div><p className="text-gray-400">Hours</p><p className="font-semibold text-gray-700">{b.openTime}–{b.closeTime}</p></div>
                <div><p className="text-gray-400">Courts</p><p className="font-semibold text-gray-700">{b._count?.courts || 0}</p></div>
                <div><p className="text-gray-400">Slot</p><p className="font-semibold text-gray-700">{b.slotDuration}min</p></div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(b)} className="flex-1 btn-ghost text-xs py-1.5 justify-center"><Pencil className="w-3.5 h-3.5" /> Edit</button>
                <button onClick={() => handleDelete(b.id)} className="flex-1 btn-ghost text-xs py-1.5 justify-center text-red-500 hover:bg-red-50"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
              </div>
            </div>
          ))}
          {branches.length === 0 && (
            <div className="col-span-2 text-center py-16 text-gray-400">
              <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No branches yet. Add your first branch.</p>
            </div>
          )}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Branch' : 'Add Branch'}>
        <form onSubmit={handleSave} className="space-y-4">
          {f('name', 'Branch Name')}
          {f('city', 'City')}
          {f('address', 'Full Address')}
          <div className="grid grid-cols-2 gap-3">
            {f('phone', 'Phone', 'tel', false)}
            {f('email', 'Email', 'email', false)}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {f('openTime', 'Opening Time', 'time')}
            {f('closeTime', 'Closing Time', 'time')}
          </div>
          {f('slotDuration', 'Slot Duration (minutes)', 'number')}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Saving...' : 'Save Branch'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
