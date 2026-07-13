import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Plus,
  ToggleLeft,
  ToggleRight,
  UserCheck,
  Building2,
  Clock,
  CheckCircle,
  XCircle,
  X,
  RefreshCw,
  Pencil,
  Trash2,
} from 'lucide-react';
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

function ConfirmModal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">{title}</h3>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
          >
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

  // =========================
  // Owners state
  // =========================

  const [owners, setOwners] = useState<Admin[]>([]);

  const [businesses, setBusinesses] = useState<
    { id: string; name: string }[]
  >([]);

  const [loadingOwners, setLoadingOwners] = useState(true);

  const [showCreate, setShowCreate] = useState(false);

  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    businessId: '',
  });

  const [editingOwner, setEditingOwner] = useState<Admin | null>(null);

  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    password: '',
    businessId: '',
  });

  const [deletingOwnerId, setDeletingOwnerId] = useState<string | null>(null);

  // =========================
  // Registration state
  // =========================

  const [registrations, setRegistrations] = useState<Registration[]>([]);

  const [loadingRegs, setLoadingRegs] = useState(true);

  const [rejectTarget, setRejectTarget] =
    useState<Registration | null>(null);

  const [rejectReason, setRejectReason] = useState('');

  const [approveTarget, setApproveTarget] =
    useState<Registration | null>(null);

  const [actioning, setActioning] = useState(false);

  // =========================
  // Load data
  // =========================

  const loadAll = () => {
    setLoadingOwners(true);
    setLoadingRegs(true);

    Promise.all([
      ownerApi.getOwners(),
      ownerApi.getBusinesses(),
    ])
      .then(([ownersResponse, businessesResponse]) => {
        setOwners(ownersResponse.data);
        setBusinesses(businessesResponse.data);
      })
      .catch(() => {
        toast.error('Failed to load owners');
      })
      .finally(() => {
        setLoadingOwners(false);
      });

    ownerRegistrationApi
      .getAll()
      .then((res) => {
        setRegistrations(res.data);
      })
      .catch(() => {
        toast.error('Failed to load registrations');
      })
      .finally(() => {
        setLoadingRegs(false);
      });
  };

  useEffect(() => {
    loadAll();
  }, []);

  const pendingCount = registrations.filter(
    (registration) => registration.status === 'PENDING',
  ).length;

  // =========================
  // Create owner
  // =========================

  const handleCreate = async () => {
    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.password.trim() ||
      !form.businessId
    ) {
      toast.error('All fields are required');
      return;
    }

    setSaving(true);

    try {
      const res = await ownerApi.createOwner({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        businessId: form.businessId,
      });

      setOwners((prev) => [res.data, ...prev]);

      setForm({
        name: '',
        email: '',
        password: '',
        businessId: '',
      });

      setShowCreate(false);

      toast.success('Owner account created');
    } catch (e: any) {
      toast.error(
        e.response?.data?.message || 'Failed to create owner',
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // Edit owner
  // =========================

  const openEditOwner = (owner: Admin) => {
    setEditingOwner(owner);

    setEditForm({
      name: owner.name,
      email: owner.email,
      password: '',
      businessId: (owner as any).business?.id || '',
    });
  };

  const handleUpdateOwner = async () => {
    if (!editingOwner) return;

    if (!editForm.name.trim() || !editForm.email.trim()) {
      toast.error('Name and email are required');
      return;
    }

    setSaving(true);

    try {
      const payload: {
        name: string;
        email: string;
        businessId: string;
        password?: string;
      } = {
        name: editForm.name.trim(),
        email: editForm.email.trim(),
        businessId: editForm.businessId,
      };

      if (editForm.password.trim()) {
        payload.password = editForm.password;
      }

      const res = await ownerApi.updateOwner(
        editingOwner.id,
        payload,
      );

      setOwners((prev) =>
        prev.map((owner) =>
          owner.id === editingOwner.id
            ? {
                ...owner,
                ...res.data,
              }
            : owner,
        ),
      );

      toast.success('Owner updated');

      setEditingOwner(null);

      setEditForm({
        name: '',
        email: '',
        password: '',
        businessId: '',
      });
    } catch (e: any) {
      toast.error(
        e.response?.data?.message || 'Failed to update owner',
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // Delete owner
  // =========================

  const handleDeleteOwner = async (owner: Admin) => {
    const confirmed = window.confirm(
      `Delete owner "${owner.name}" (${owner.email})? This cannot be undone.`,
    );

    if (!confirmed) return;

    setDeletingOwnerId(owner.id);

    try {
      await ownerApi.deleteOwner(owner.id);

      setOwners((prev) =>
        prev.filter((item) => item.id !== owner.id),
      );

      toast.success('Owner deleted');
    } catch (e: any) {
      toast.error(
        e.response?.data?.message || 'Failed to delete owner',
      );
    } finally {
      setDeletingOwnerId(null);
    }
  };

  // =========================
  // Toggle owner status
  // =========================

  const handleToggle = async (id: string) => {
    try {
      const res = await ownerApi.toggleOwnerStatus(id);

      setOwners((prev) =>
        prev.map((owner) =>
          owner.id === id
            ? {
                ...owner,
                isActive: res.data.isActive,
              }
            : owner,
        ),
      );

      toast.success(
        res.data.isActive
          ? 'Owner activated'
          : 'Owner deactivated',
      );
    } catch {
      toast.error('Failed to update status');
    }
  };

  // =========================
  // Approve registration
  // =========================

  const handleApprove = async () => {
    if (!approveTarget) return;

    setActioning(true);

    try {
      await ownerRegistrationApi.approve(approveTarget.id);

      setRegistrations((prev) =>
        prev.map((registration) =>
          registration.id === approveTarget.id
            ? {
                ...registration,
                status: 'APPROVED' as const,
              }
            : registration,
        ),
      );

      toast.success(
        `${approveTarget.businessName} approved — owner account created`,
      );

      setApproveTarget(null);

      // Refresh owners list
      const res = await ownerApi.getOwners();
      setOwners(res.data);
    } catch (e: any) {
      toast.error(
        e.response?.data?.message || 'Failed to approve',
      );
    } finally {
      setActioning(false);
    }
  };

  // =========================
  // Reject registration
  // =========================

  const handleReject = async () => {
    if (!rejectTarget) return;

    setActioning(true);

    try {
      await ownerRegistrationApi.reject(
        rejectTarget.id,
        rejectReason || undefined,
      );

      setRegistrations((prev) =>
        prev.map((registration) =>
          registration.id === rejectTarget.id
            ? {
                ...registration,
                status: 'REJECTED' as const,
                rejectionReason: rejectReason,
              }
            : registration,
        ),
      );

      toast.success('Registration rejected');

      setRejectTarget(null);
      setRejectReason('');
    } catch (e: any) {
      toast.error(
        e.response?.data?.message || 'Failed to reject',
      );
    } finally {
      setActioning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* =========================
          Header
      ========================== */}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Futsal Owners
          </h2>

          <p className="text-sm text-gray-500">
            Manage owner accounts and registrations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadAll}
            className="btn-ghost p-2"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {tab === 'owners' && (
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Owner
            </button>
          )}
        </div>
      </div>

      {/* =========================
          Tabs
      ========================== */}

      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setTab('owners')}
          className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
            tab === 'owners'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Owners
        </button>

        <button
          onClick={() => setTab('registrations')}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
            tab === 'registrations'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Registrations

          {pendingCount > 0 && (
            <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
              {pendingCount}
            </span>
          )}
        </button>
      </div>

      {/* =========================
          Owners tab
      ========================== */}

      {tab === 'owners' &&
        (loadingOwners ? (
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="card animate-pulse h-20 bg-gray-50"
              />
            ))}
          </div>
        ) : owners.length === 0 ? (
          <div className="card text-center py-16">
            <UserCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />

            <p className="font-medium text-gray-500">
              No owner accounts yet
            </p>

            <p className="text-sm text-gray-400 mb-4">
              Create credentials for futsal center owners
            </p>

            <button
              onClick={() => setShowCreate(true)}
              className="px-4 py-2 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700"
            >
              Create First Owner
            </button>
          </div>
        ) : (
          <div className="card p-0 overflow-hidden">
            <div className="overflow-x-auto">
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
                    <tr
                      key={owner.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-sm">
                            {owner.name?.[0]?.toUpperCase()}
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {owner.name}
                            </p>

                            <p className="text-xs text-gray-400">
                              {owner.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-gray-400" />

                          <span className="text-sm text-gray-700">
                            {(owner as any).business?.name || '—'}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-sm text-gray-500">
                          {owner.createdAt
                            ? dayjs(owner.createdAt).format(
                                'D MMM YYYY',
                              )
                            : '—'}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            owner.isActive
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {owner.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleToggle(owner.id)}
                            className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                              owner.isActive
                                ? 'text-gray-500 hover:text-red-600'
                                : 'text-gray-500 hover:text-green-600'
                            }`}
                            title={
                              owner.isActive
                                ? 'Deactivate owner'
                                : 'Activate owner'
                            }
                          >
                            {owner.isActive ? (
                              <ToggleRight className="w-5 h-5" />
                            ) : (
                              <ToggleLeft className="w-5 h-5" />
                            )}
                          </button>

                          <button
                            onClick={() => openEditOwner(owner)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                            title="Edit owner"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteOwner(owner)}
                            disabled={deletingOwnerId === owner.id}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                            title="Delete owner"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}

      {/* =========================
          Registrations tab
      ========================== */}

      {tab === 'registrations' &&
        (loadingRegs ? (
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="card animate-pulse h-24 bg-gray-50"
              />
            ))}
          </div>
        ) : registrations.length === 0 ? (
          <div className="card text-center py-16">
            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />

            <p className="font-medium text-gray-500">
              No registrations yet
            </p>

            <p className="text-sm text-gray-400">
              Futsal owners can register at{' '}
              <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                /owner/register
              </span>
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {registrations.map((registration) => (
              <div key={registration.id} className="card">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-sm shrink-0">
                      {registration.name[0]?.toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-gray-900">
                          {registration.name}
                        </p>

                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            STATUS_STYLES[registration.status]
                          }`}
                        >
                          {registration.status}
                        </span>
                      </div>

                      <p className="text-xs text-gray-500 mt-0.5">
                        {registration.email}

                        {registration.phone &&
                          ` · ${registration.phone}`}
                      </p>

                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                        <span className="flex items-center gap-1 text-xs text-gray-600">
                          <Building2 className="w-3.5 h-3.5 text-gray-400" />

                          <strong>
                            {registration.businessName}
                          </strong>
                        </span>

                        <span className="text-xs text-gray-500">
                          {registration.businessCity}
                        </span>

                        <span className="text-xs text-gray-400 truncate max-w-xs">
                          {registration.businessAddress}
                        </span>
                      </div>

                      {registration.rejectionReason && (
                        <p className="text-xs text-red-500 mt-1">
                          Reason: {registration.rejectionReason}
                        </p>
                      )}

                      <p className="text-xs text-gray-400 mt-1">
                        Submitted{' '}
                        {dayjs(registration.createdAt).format(
                          'D MMM YYYY, h:mm A',
                        )}
                      </p>
                    </div>
                  </div>

                  {registration.status === 'PENDING' && (
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() =>
                          setApproveTarget(registration)
                        }
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Approve
                      </button>

                      <button
                        onClick={() => {
                          setRejectTarget(registration);
                          setRejectReason('');
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-lg transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Reject
                      </button>
                    </div>
                  )}

                  {registration.status !== 'PENDING' && (
                    <div className="text-xs text-gray-400 shrink-0">
                      {registration.reviewedAt &&
                        dayjs(registration.reviewedAt).format(
                          'D MMM YYYY',
                        )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}

      {/* =========================
          Create Owner Modal
      ========================== */}

      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="Create Owner Account"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="label">Full Name *</label>

            <input
              type="text"
              value={form.name}
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  name: e.target.value,
                }))
              }
              placeholder="John Silva"
              className="input-field"
            />
          </div>

          <div>
            <label className="label">Email Address *</label>

            <input
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  email: e.target.value,
                }))
              }
              placeholder="owner@futsalcenter.lk"
              className="input-field"
            />
          </div>

          <div>
            <label className="label">
              Temporary Password *
            </label>

            <input
              type="text"
              value={form.password}
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  password: e.target.value,
                }))
              }
              placeholder="Min. 8 characters"
              className="input-field"
            />

            <p className="text-xs text-gray-400 mt-1">
              The owner can change this after first login
            </p>
          </div>

          <div>
            <label className="label">
              Assign to Business *
            </label>

            <select
              value={form.businessId}
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  businessId: e.target.value,
                }))
              }
              className="input-field"
            >
              <option value="">Select business</option>

              {businesses.map((business) => (
                <option
                  key={business.id}
                  value={business.id}
                >
                  {business.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setShowCreate(false)}
              className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              onClick={handleCreate}
              disabled={saving}
              className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl"
            >
              {saving ? 'Creating...' : 'Create Owner'}
            </button>
          </div>
        </div>
      </Modal>

      {/* =========================
          Edit Owner Modal
      ========================== */}

      <Modal
        open={!!editingOwner}
        onClose={() => setEditingOwner(null)}
        title="Edit Owner Account"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="label">Full Name *</label>

            <input
              type="text"
              value={editForm.name}
              onChange={(e) =>
                setEditForm((current) => ({
                  ...current,
                  name: e.target.value,
                }))
              }
              className="input-field"
            />
          </div>

          <div>
            <label className="label">Email Address *</label>

            <input
              type="email"
              value={editForm.email}
              onChange={(e) =>
                setEditForm((current) => ({
                  ...current,
                  email: e.target.value,
                }))
              }
              className="input-field"
            />
          </div>

          <div>
            <label className="label">New Password</label>

            <input
              type="password"
              value={editForm.password}
              onChange={(e) =>
                setEditForm((current) => ({
                  ...current,
                  password: e.target.value,
                }))
              }
              placeholder="Leave blank to keep current password"
              className="input-field"
            />
          </div>

          <div>
            <label className="label">Business</label>

            <select
              value={editForm.businessId}
              onChange={(e) =>
                setEditForm((current) => ({
                  ...current,
                  businessId: e.target.value,
                }))
              }
              className="input-field"
            >
              <option value="">Select business</option>

              {businesses.map((business) => (
                <option
                  key={business.id}
                  value={business.id}
                >
                  {business.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setEditingOwner(null)}
              className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              onClick={handleUpdateOwner}
              disabled={saving}
              className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </Modal>

      {/* =========================
          Approve Confirmation
      ========================== */}

      {approveTarget && (
        <ConfirmModal
          title="Approve Registration"
          onClose={() => setApproveTarget(null)}
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              This will create an owner account and business
              profile for:
            </p>

            <div className="bg-gray-50 rounded-xl p-4 space-y-1">
              <p className="font-semibold text-gray-900">
                {approveTarget.name}
              </p>

              <p className="text-sm text-gray-500">
                {approveTarget.email}
              </p>

              <p className="text-sm font-medium text-gray-700 mt-1">
                {approveTarget.businessName} ·{' '}
                {approveTarget.businessCity}
              </p>
            </div>

            <p className="text-xs text-gray-400">
              The owner will be able to log in at{' '}
              <span className="font-mono bg-gray-100 px-1 py-0.5 rounded">
                /owner/login
              </span>{' '}
              using their registered email and password.
            </p>

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setApproveTarget(null)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={handleApprove}
                disabled={actioning}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                {actioning
                  ? 'Approving…'
                  : 'Approve & Create Account'}
              </button>
            </div>
          </div>
        </ConfirmModal>
      )}

      {/* =========================
          Reject Confirmation
      ========================== */}

      {rejectTarget && (
        <ConfirmModal
          title="Reject Registration"
          onClose={() => {
            setRejectTarget(null);
            setRejectReason('');
          }}
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Rejecting registration from{' '}
              <strong>{rejectTarget.name}</strong> for{' '}
              <strong>{rejectTarget.businessName}</strong>.
            </p>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Reason (optional)
              </label>

              <input
                type="text"
                value={rejectReason}
                onChange={(e) =>
                  setRejectReason(e.target.value)
                }
                className="input-field"
                placeholder="e.g. Incomplete information, duplicate application…"
              />
            </div>

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => {
                  setRejectTarget(null);
                  setRejectReason('');
                }}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={handleReject}
                disabled={actioning}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                {actioning ? 'Rejecting…' : 'Reject'}
              </button>
            </div>
          </div>
        </ConfirmModal>
      )}
    </div>
  );
}