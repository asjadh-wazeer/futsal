import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { UserPlus, MapPin, KeyRound, Power, X, Eye, EyeOff, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { ownerApi } from '../../services/api';
import { Branch, StaffMember } from '../../types';
import dayjs from 'dayjs';

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h3 className="font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-6 py-5 overflow-y-auto">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

export default function OwnerStaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterBranch, setFilterBranch] = useState('');

  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState<StaffMember | null>(null);
  const [showReset, setShowReset] = useState<StaffMember | null>(null);
  const [confirmToggle, setConfirmToggle] = useState<StaffMember | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({ name: '', email: '', password: '', branchId: '' });
  const [editForm, setEditForm] = useState({ name: '', branchId: '' });
  const [newPassword, setNewPassword] = useState('');

  const loadAll = () => {
    setLoading(true);
    Promise.all([ownerApi.getBranches(), ownerApi.getStaff(filterBranch ? { branchId: filterBranch } : {})])
      .then(([b, s]) => {
        setBranches(b.data);
        setStaff(s.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadAll(); }, []);

  const loadStaff = async (branchId?: string) => {
    const res = await ownerApi.getStaff(branchId ? { branchId } : {});
    setStaff(res.data);
  };

  const handleFilterChange = (branchId: string) => {
    setFilterBranch(branchId);
    loadStaff(branchId || undefined);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.branchId) {
      toast.error('All fields are required');
      return;
    }
    setSubmitting(true);
    try {
      const res = await ownerApi.createStaff(form);
      setStaff((prev) => [res.data, ...prev]);
      setShowCreate(false);
      setForm({ name: '', email: '', password: '', branchId: '' });
      toast.success('Staff member created');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create staff');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEdit) return;
    setSubmitting(true);
    try {
      const res = await ownerApi.updateStaff(showEdit.id, editForm);
      setStaff((prev) => prev.map((s) => s.id === showEdit.id ? res.data : s));
      setShowEdit(null);
      toast.success('Staff member updated');
    } catch {
      toast.error('Failed to update staff');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async () => {
    if (!confirmToggle) return;
    setSubmitting(true);
    try {
      const res = await ownerApi.updateStaff(confirmToggle.id, { isActive: !confirmToggle.isActive });
      setStaff((prev) => prev.map((s) => s.id === confirmToggle.id ? res.data : s));
      toast.success(confirmToggle.isActive ? 'Staff deactivated' : 'Staff activated');
      setConfirmToggle(null);
    } catch {
      toast.error('Failed to update status');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showReset || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setSubmitting(true);
    try {
      await ownerApi.resetStaffPassword(showReset.id, newPassword);
      setShowReset(null);
      setNewPassword('');
      toast.success('Password reset successfully');
    } catch {
      toast.error('Failed to reset password');
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (member: StaffMember) => {
    setEditForm({ name: member.name, branchId: member.branchId || '' });
    setShowEdit(member);
  };

  const activeBranchName = branches.find((b) => b.id === filterBranch)?.name;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Staff</h2>
          <p className="text-sm text-gray-500">
            {staff.length} staff member{staff.length !== 1 ? 's' : ''}
            {activeBranchName ? ` · ${activeBranchName}` : ' across all branches'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadAll} className="btn-ghost p-2" title="Refresh">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Add Staff
          </button>
        </div>
      </div>

      {/* Branch filter */}
      {branches.length > 1 && (
        <div className="card flex items-center gap-3 py-3">
          <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
          <span className="text-sm text-gray-600 font-medium">Filter by branch:</span>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => handleFilterChange('')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${!filterBranch ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              All Branches
            </button>
            {branches.map((b) => (
              <button
                key={b.id}
                onClick={() => handleFilterChange(b.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${filterBranch === b.id ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {b.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Staff list */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="space-y-px">{[1,2,3].map((i) => <div key={i} className="h-16 bg-gray-50 animate-pulse border-b border-gray-100" />)}</div>
        ) : staff.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <UserPlus className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="font-medium">No staff members yet</p>
            <p className="text-sm mt-1">Add your first employee to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50 border-b border-gray-100">
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Branch</th>
                  <th className="px-5 py-3">Joined</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {staff.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm shrink-0">
                          {member.name[0]?.toUpperCase()}
                        </div>
                        <p className="text-sm font-semibold text-gray-900">{member.name}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm text-gray-600">{member.email}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      {member.branch ? (
                        <div>
                          <p className="text-sm font-medium text-gray-900">{member.branch.name}</p>
                          <p className="text-xs text-gray-400">{member.branch.city}</p>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm text-gray-500">{dayjs(member.createdAt).format('D MMM YYYY')}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${member.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                        {member.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openEdit(member)}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setShowReset(member)}
                          className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
                          title="Reset password"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setConfirmToggle(member)}
                          className={`p-1.5 rounded-lg transition-colors ${member.isActive ? 'bg-red-50 hover:bg-red-100 text-red-500' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600'}`}
                          title={member.isActive ? 'Deactivate' : 'Activate'}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <Modal title="Add Staff Member" onClose={() => setShowCreate(false)}>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Full Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="input-field"
                placeholder="e.g. Mohamed Aslam"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email Address</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="input-field"
                placeholder="employee@example.com"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  className="input-field pr-10"
                  placeholder="Min. 6 characters"
                />
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Assign to Branch</label>
              <select
                value={form.branchId}
                onChange={(e) => setForm((f) => ({ ...f, branchId: e.target.value }))}
                className="input-field"
              >
                <option value="">Select a branch</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>{b.name} — {b.city}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3 pt-2 pb-4">
              <button type="button" onClick={() => setShowCreate(false)} className="flex-1 px-4 py-2.5 border border-gray-200 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors">
                {submitting ? 'Creating…' : 'Create Staff'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Modal */}
      {showEdit && (
        <Modal title={`Edit — ${showEdit.name}`} onClose={() => setShowEdit(null)}>
          <form onSubmit={handleEdit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Full Name</label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Assigned Branch</label>
              <select
                value={editForm.branchId}
                onChange={(e) => setEditForm((f) => ({ ...f, branchId: e.target.value }))}
                className="input-field"
              >
                <option value="">Unassigned</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>{b.name} — {b.city}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3 pt-2 pb-4">
              <button type="button" onClick={() => setShowEdit(null)} className="flex-1 px-4 py-2.5 border border-gray-200 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors">
                {submitting ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Reset Password Modal */}
      {showReset && (
        <Modal title={`Reset Password — ${showReset.name}`} onClose={() => { setShowReset(null); setNewPassword(''); }}>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <p className="text-sm text-gray-500">Set a new password for this staff member. They will need to use it on their next login.</p>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input-field pr-10"
                  placeholder="Min. 6 characters"
                />
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="flex gap-3 pt-2 pb-4">
              <button type="button" onClick={() => { setShowReset(null); setNewPassword(''); }} className="flex-1 px-4 py-2.5 border border-gray-200 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={submitting || newPassword.length < 6} className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors">
                {submitting ? 'Resetting…' : 'Reset Password'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Confirm Toggle Modal */}
      {confirmToggle && (
        <Modal
          title={confirmToggle.isActive ? 'Deactivate Staff' : 'Activate Staff'}
          onClose={() => setConfirmToggle(null)}
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to {confirmToggle.isActive ? 'deactivate' : 'activate'}{' '}
              <span className="font-semibold text-gray-900">{confirmToggle.name}</span>?
              {confirmToggle.isActive && ' They will no longer be able to log in.'}
            </p>
            <div className="flex gap-3 pt-2 pb-4">
              <button
                type="button"
                onClick={() => setConfirmToggle(null)}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleToggle}
                disabled={submitting}
                className={`flex-1 px-4 py-2.5 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 ${
                  confirmToggle.isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {submitting ? 'Updating…' : confirmToggle.isActive ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
