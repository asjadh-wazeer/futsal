import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Save, Palette, Building2, Globe } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi } from '../../services/api';
import { RootState } from '../../store';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function SettingsPage() {
  const admin = useSelector((s: RootState) => s.auth.admin);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', description: '', phone: '', email: '', website: '',
    address: '', city: '', primaryColor: '#16a34a', accentColor: '#15803d', currency: 'LKR',
  });

  useEffect(() => {
    adminApi.getBusiness().then((res) => {
      const b = res.data;
      setForm({
        name: b.name || '', description: b.description || '', phone: b.phone || '',
        email: b.email || '', website: b.website || '', address: b.address || '',
        city: b.city || '', primaryColor: b.primaryColor || '#16a34a',
        accentColor: b.accentColor || '#15803d', currency: b.currency || 'LKR',
      });
    }).finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminApi.updateBusiness(form);
      toast.success('Settings saved successfully');
    } catch { toast.error('Failed to save settings'); }
    finally { setSaving(false); }
  };

  const f = (k: keyof typeof form, label: string, type = 'text', req = false) => (
    <div>
      <label className="label">{label}</label>
      <input type={type} value={form[k]} onChange={(e) => setForm(x => ({ ...x, [k]: e.target.value }))} required={req} className="input-field" />
    </div>
  );

  if (loading) return <LoadingSpinner size="lg" className="py-16" />;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="page-title">Business Settings</h2>
        <p className="text-sm text-gray-500 mt-0.5">Customize your business profile and branding</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Business Info */}
        <div className="card">
          <div className="flex items-center gap-2 mb-5">
            <Building2 className="w-5 h-5 text-brand-600" />
            <h3 className="font-bold text-gray-900">Business Information</h3>
          </div>
          <div className="space-y-4">
            {f('name', 'Business Name', 'text', true)}
            <div>
              <label className="label">Description</label>
              <textarea value={form.description} onChange={(e) => setForm(x => ({ ...x, description: e.target.value }))} rows={3} className="input-field resize-none" placeholder="Describe your business..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {f('city', 'City')}
              {f('currency', 'Currency')}
            </div>
            {f('address', 'Address')}
          </div>
        </div>

        {/* Contact Info */}
        <div className="card">
          <div className="flex items-center gap-2 mb-5">
            <Globe className="w-5 h-5 text-brand-600" />
            <h3 className="font-bold text-gray-900">Contact & Online Presence</h3>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {f('phone', 'Phone Number', 'tel')}
              {f('email', 'Email Address', 'email')}
            </div>
            {f('website', 'Website URL', 'url')}
          </div>
        </div>

        {/* Branding */}
        <div className="card">
          <div className="flex items-center gap-2 mb-5">
            <Palette className="w-5 h-5 text-brand-600" />
            <h3 className="font-bold text-gray-900">Brand Colors</h3>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="label">Primary Color</label>
              <div className="flex items-center gap-3">
                <input type="color" value={form.primaryColor} onChange={(e) => setForm(x => ({ ...x, primaryColor: e.target.value }))} className="w-12 h-10 rounded-lg border border-gray-200 cursor-pointer p-1" />
                <input type="text" value={form.primaryColor} onChange={(e) => setForm(x => ({ ...x, primaryColor: e.target.value }))} className="input-field flex-1 py-2 font-mono text-sm" />
              </div>
            </div>
            <div>
              <label className="label">Accent Color</label>
              <div className="flex items-center gap-3">
                <input type="color" value={form.accentColor} onChange={(e) => setForm(x => ({ ...x, accentColor: e.target.value }))} className="w-12 h-10 rounded-lg border border-gray-200 cursor-pointer p-1" />
                <input type="text" value={form.accentColor} onChange={(e) => setForm(x => ({ ...x, accentColor: e.target.value }))} className="input-field flex-1 py-2 font-mono text-sm" />
              </div>
            </div>
          </div>
          <div className="mt-4 p-4 rounded-xl border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm" style={{ backgroundColor: form.primaryColor }}>F</div>
            <div>
              <p className="text-sm font-medium text-gray-900">Color Preview</p>
              <p className="text-xs text-gray-500">This is how your brand color will appear</p>
            </div>
            <div className="ml-auto">
              <button type="button" className="px-4 py-2 rounded-lg text-white text-sm font-semibold transition-all" style={{ backgroundColor: form.primaryColor }}>
                Book Now
              </button>
            </div>
          </div>
        </div>

        {/* Admin Info */}
        <div className="card">
          <h3 className="font-bold text-gray-900 mb-4">Account Information</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><p className="text-gray-500 mb-0.5">Admin Name</p><p className="font-semibold">{admin?.name}</p></div>
            <div><p className="text-gray-500 mb-0.5">Email</p><p className="font-semibold">{admin?.email}</p></div>
            <div><p className="text-gray-500 mb-0.5">Role</p><p className="font-semibold">{admin?.role?.replace('_', ' ')}</p></div>
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary px-8 py-3">
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}
