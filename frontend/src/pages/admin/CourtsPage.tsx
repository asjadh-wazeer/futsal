import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Building2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi } from '../../services/api';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Court, Branch, Sport } from '../../types';

export default function CourtsPage() {
  const [courts, setCourts] = useState<Court[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Court | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ branchId: '', sportId: '', name: '', description: '', pricePerHour: '', minDuration: '60', maxDuration: '120' });

  const load = async () => {
    setLoading(true);
    try {
      const [c, b, s] = await Promise.all([adminApi.getCourts(), adminApi.getBranches(), adminApi.getSports()]);
      setCourts(c.data);
      setBranches(b.data);
      setSports(s.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({ branchId: branches[0]?.id || '', sportId: sports[0]?.id || '', name: '', description: '', pricePerHour: '', minDuration: '60', maxDuration: '120' });
    setModalOpen(true);
  };

  const openEdit = (court: Court) => {
    setEditing(court);
    setForm({ branchId: court.branchId, sportId: court.sportId, name: court.name, description: court.description || '', pricePerHour: String(court.pricePerHour), minDuration: String(court.minDuration), maxDuration: String(court.maxDuration) });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, pricePerHour: parseFloat(form.pricePerHour), minDuration: parseInt(form.minDuration), maxDuration: parseInt(form.maxDuration) };
      if (editing) {
        await adminApi.updateCourt(editing.id, payload);
        toast.success('Court updated');
      } else {
        await adminApi.createCourt(payload);
        toast.success('Court created');
      }
      setModalOpen(false);
      load();
    } catch { toast.error('Failed to save court'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deactivate this court?')) return;
    await adminApi.deleteCourt(id);
    toast.success('Court deactivated');
    load();
  };

  const f = (key: keyof typeof form, label: string, type = 'text', required = true) => (
    <div>
      <label className="label">{label}</label>
      <input type={type} value={form[key]} onChange={(e) => setForm(x => ({ ...x, [key]: e.target.value }))} required={required} className="input-field" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h2 className="page-title">Courts</h2>
          <p className="text-sm text-gray-500 mt-0.5">{courts.length} courts total</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="btn-ghost p-2" title="Refresh">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={openAdd} className="btn-primary text-sm">
            <Plus className="w-4 h-4" /> Add Court
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner size="lg" className="py-16" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courts.map((court) => (
            <div key={court.id} className="card hover:shadow-card-hover transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center text-xl shrink-0">
                    {court.sport?.name?.includes('Football') ? '⚽' : court.sport?.name?.includes('Cricket') ? '🏏' : '🏸'}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{court.name}</h3>
                    <span className="text-xs text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">{court.sport?.name}</span>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${court.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                  {court.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              {court.description && <p className="text-sm text-gray-500 mb-3">{court.description}</p>}
              <div className="flex justify-between items-center pt-3 border-t border-gray-100 text-sm">
                <div>
                  <p className="text-xs text-gray-400">Branch</p>
                  <p className="font-medium text-gray-700">{court.branch?.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Rate</p>
                  <p className="font-bold text-brand-600">LKR {Number(court.pricePerHour).toLocaleString()}/hr</p>
                </div>
              </div>
              <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                <button onClick={() => openEdit(court)} className="flex-1 btn-ghost text-xs py-1.5 justify-center">
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
                <button onClick={() => handleDelete(court.id)} className="flex-1 btn-ghost text-xs py-1.5 justify-center text-red-500 hover:bg-red-50">
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          ))}
          {courts.length === 0 && (
            <div className="col-span-3 text-center py-16 text-gray-400">
              <Building2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No courts yet. Add your first court.</p>
            </div>
          )}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Court' : 'Add Court'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label">Branch</label>
            <select value={form.branchId} onChange={(e) => setForm(x => ({ ...x, branchId: e.target.value }))} className="input-field" required>
              {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Sport</label>
            <select value={form.sportId} onChange={(e) => setForm(x => ({ ...x, sportId: e.target.value }))} className="input-field" required>
              {sports.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          {f('name', 'Court Name')}
          {f('description', 'Description', 'text', false)}
          {f('pricePerHour', 'Price per Hour (LKR)', 'number')}
          <div className="grid grid-cols-2 gap-3">
            {f('minDuration', 'Min Duration (min)', 'number')}
            {f('maxDuration', 'Max Duration (min)', 'number')}
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Saving...' : 'Save Court'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
