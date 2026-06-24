import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Tag, Calendar, Building2, CheckCircle, XCircle, ChevronDown, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { ownerApi } from '../../services/api';
import { Court, PricingRule, CourtSchedule, Sport, Branch } from '../../types';
import Modal from '../../components/ui/Modal';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const SIZES = ['5v5', '6v6', '7v7', '8v8', '11v11', 'Mini (3v3)'];
const HOURS = Array.from({ length: 25 }, (_, i) => i);

function fmt(h: number) { return `${String(h).padStart(2, '0')}:00`; }

const dayTypeBadge: Record<string, string> = {
  ALL: 'bg-gray-100 text-gray-600',
  WEEKDAY: 'bg-blue-100 text-blue-700',
  WEEKEND: 'bg-orange-100 text-orange-700',
};
const dayTypeLabel: Record<string, string> = { ALL: 'All Days', WEEKDAY: 'Weekdays', WEEKEND: 'Weekends' };

export default function OwnerCourtsPage() {
  const [courts, setCourts] = useState<Court[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showCreate, setShowCreate] = useState(false);
  const [editCourt, setEditCourt] = useState<Court | null>(null);
  const [modalTab, setModalTab] = useState<'details' | 'pricing' | 'schedule'>('details');

  // Pricing state
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [rulesLoading, setRulesLoading] = useState(false);
  const [addingRule, setAddingRule] = useState(false);
  const [ruleTimeTouched, setRuleTimeTouched] = useState(false);
  const [ruleForm, setRuleForm] = useState({ name: '', pricePerHour: '', dayType: 'ALL', startHour: 6, endHour: 22, priority: 0 });

  // Schedule state
  const [schedule, setSchedule] = useState<CourtSchedule[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [scheduleSaving, setScheduleSaving] = useState(false);

  // Court form
  const emptyForm = { name: '', sportIds: [] as string[], branchId: '', pricePerHour: '', size: '', description: '', minDuration: 60, maxDuration: 120 };
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([ownerApi.getCourts(), ownerApi.getSports(), ownerApi.getBranches()])
      .then(([c, s, b]) => {
        setCourts(c.data);
        setSports(s.data);
        setBranches(b.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openEdit = async (court: Court) => {
    setEditCourt(court);
    setForm({
      name: court.name, sportIds: court.sports?.map((s) => s.id) || [], branchId: court.branchId,
      pricePerHour: String(court.pricePerHour), size: court.size || '',
      description: court.description || '', minDuration: court.minDuration, maxDuration: court.maxDuration,
    });
    setModalTab('details');
    setRules([]);
    setSchedule([]);
  };

  const loadTab = async (tab: 'details' | 'pricing' | 'schedule', courtId: string) => {
    setModalTab(tab);
    if (tab === 'pricing' && rules.length === 0) {
      setRulesLoading(true);
      const res = await ownerApi.getPricingRules(courtId);
      setRules(res.data);
      setRulesLoading(false);
    }
    if (tab === 'schedule' && schedule.length === 0) {
      setScheduleLoading(true);
      const res = await ownerApi.getSchedule(courtId);
      setSchedule(res.data);
      setScheduleLoading(false);
    }
  };

  const handleSaveCourt = async () => {
    if (!form.name || !form.branchId || !form.pricePerHour) {
      toast.error('Fill in all required fields'); return;
    }
    const price = parseFloat(form.pricePerHour);
    if (isNaN(price) || price <= 0) {
      toast.error('Please enter a valid price greater than 0'); return;
    }
    setSaving(true);
    try {
      const payload = { ...form, pricePerHour: price };
      if (editCourt) {
        const res = await ownerApi.updateCourt(editCourt.id, payload);
        setCourts((prev) => prev.map((c) => c.id === editCourt.id ? { ...c, ...res.data } : c));
        toast.success('Court updated');
      } else {
        const res = await ownerApi.createCourt(payload);
        setCourts((prev) => [...prev, res.data]);
        toast.success('Court created');
        setShowCreate(false);
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  // Branch hours for current court (constrains pricing rule time pickers)
  const currentBranch = branches.find((b) => b.id === editCourt?.branchId);
  const branchOpenHour = parseInt(currentBranch?.openTime?.split(':')[0] || '6');
  const branchCloseHour = parseInt(currentBranch?.closeTime?.split(':')[0] || '22');

  // Detect time + dayType conflicts between a candidate rule and existing rules
  const getConflicts = (start: number, end: number, dayType: string, excludeId?: string) =>
    rules.filter((r) => {
      if (excludeId && r.id === excludeId) return false;
      if (!r.isActive) return false;
      const dayOverlap =
        r.dayType === 'ALL' || dayType === 'ALL' || r.dayType === dayType;
      const timeOverlap = start < r.endHour && end > r.startHour;
      return dayOverlap && timeOverlap;
    });

  // Pricing rules
  const handleAddRule = async () => {
    if (!editCourt || !ruleForm.name || !ruleForm.pricePerHour) { toast.error('Fill name and price'); return; }
    const rulePrice = parseFloat(ruleForm.pricePerHour);
    if (isNaN(rulePrice) || rulePrice <= 0) { toast.error('Please enter a valid price greater than 0'); return; }
    if (ruleForm.endHour <= ruleForm.startHour) { toast.error('End time must be after start time'); return; }
    try {
      const res = await ownerApi.createPricingRule(editCourt.id, {
        ...ruleForm, pricePerHour: rulePrice,
      });
      setRules((prev) => [...prev, res.data]);
      setRuleForm({ name: '', pricePerHour: '', dayType: 'ALL', startHour: branchOpenHour, endHour: branchCloseHour, priority: 0 });
      setRuleTimeTouched(false);
      setAddingRule(false);
      toast.success('Pricing rule added');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to add rule');
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!editCourt) return;
    if (!window.confirm('Delete this pricing rule?')) return;
    await ownerApi.deletePricingRule(editCourt.id, ruleId);
    setRules((prev) => prev.filter((r) => r.id !== ruleId));
    toast.success('Rule deleted');
  };

  const handleToggleRule = async (rule: PricingRule) => {
    if (!editCourt) return;
    const res = await ownerApi.updatePricingRule(editCourt.id, rule.id, { ...rule, isActive: !rule.isActive });
    setRules((prev) => prev.map((r) => r.id === rule.id ? res.data : r));
  };

  // Schedule
  const setScheduleDay = (dayOfWeek: number, field: keyof CourtSchedule, value: any) => {
    setSchedule((prev) => prev.map((s) => s.dayOfWeek === dayOfWeek ? { ...s, [field]: value } : s));
  };

  const handleSaveSchedule = async () => {
    if (!editCourt) return;
    setScheduleSaving(true);
    try {
      await ownerApi.upsertSchedule(editCourt.id, schedule);
      toast.success('Schedule saved');
    } catch {
      toast.error('Failed to save schedule');
    } finally {
      setScheduleSaving(false);
    }
  };

  const closeModal = () => { setEditCourt(null); setShowCreate(false); setRules([]); setSchedule([]); setAddingRule(false); };

  const isEditOpen = !!editCourt;

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => <div key={i} className="card animate-pulse h-24 bg-gray-50" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">My Courts</h2>
          <p className="text-sm text-gray-500">{courts.length} court{courts.length !== 1 ? 's' : ''} · Manage pricing &amp; availability</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="btn-ghost p-2" title="Refresh">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={() => { setForm(emptyForm); setShowCreate(true); }} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors">
            <Plus className="w-4 h-4" /> Add Court
          </button>
        </div>
      </div>

      {/* Courts grid */}
      {courts.length === 0 ? (
        <div className="card text-center py-16">
          <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No courts yet</p>
          <p className="text-sm text-gray-400 mb-4">Add your first court to start accepting bookings</p>
          <button onClick={() => { setForm(emptyForm); setShowCreate(true); }} className="px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700">
            Add Court
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {courts.map((court) => (
            <div key={court.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{court.name}</p>
                    <p className="text-xs text-gray-500">
                      {court.sports?.map((s) => s.name).join(', ') || 'No sport assigned'}
                      {court.size ? ` · ${court.size}` : ''}
                    </p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${court.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {court.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="text-xs text-gray-500">Base price</p>
                  <p className="text-lg font-bold text-emerald-600">LKR {Number(court.pricePerHour).toLocaleString()}<span className="text-xs text-gray-400 font-normal">/hr</span></p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Pricing rules</p>
                  <p className="text-sm font-semibold text-gray-700">{court.pricingRules?.length ?? 0} active</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={() => openEdit(court)} className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  <Edit2 className="w-3.5 h-3.5" /> Details
                </button>
                <button onClick={() => { openEdit(court); setTimeout(() => loadTab('pricing', court.id), 0); }} className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  <Tag className="w-3.5 h-3.5" /> Pricing
                </button>
                <button onClick={() => { openEdit(court); setTimeout(() => loadTab('schedule', court.id), 0); }} className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  <Calendar className="w-3.5 h-3.5" /> Schedule
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create court modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Add New Court" size="lg">
        <CourtForm form={form} setForm={setForm} sports={sports} branches={branches} />
        <div className="flex gap-3 mt-6">
          <button onClick={() => setShowCreate(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={handleSaveCourt} disabled={saving} className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl disabled:opacity-60">
            {saving ? 'Creating...' : 'Create Court'}
          </button>
        </div>
      </Modal>

      {/* Edit court modal */}
      <Modal open={isEditOpen} onClose={closeModal} title={`Manage: ${editCourt?.name}`} size="xl">
        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6">
          {(['details', 'pricing', 'schedule'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => editCourt && loadTab(tab, editCourt.id)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${modalTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {tab === 'pricing' ? 'Pricing Rules' : tab === 'schedule' ? 'Weekly Schedule' : 'Details'}
            </button>
          ))}
        </div>

        {/* Details tab */}
        {modalTab === 'details' && (
          <>
            <CourtForm form={form} setForm={setForm} sports={sports} branches={branches} />
            <div className="flex gap-3 mt-6">
              <button onClick={closeModal} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={handleSaveCourt} disabled={saving} className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl disabled:opacity-60">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </>
        )}

        {/* Pricing tab */}
        {modalTab === 'pricing' && (
          <div className="space-y-4">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
              <strong>How pricing rules work:</strong> When a booking is made, the system picks the highest-priority rule that matches the day type and time. Falls back to the base price if no rules match.
            </div>

            {rulesLoading ? (
              <div className="space-y-2">{[1, 2].map((i) => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />)}</div>
            ) : (
              <>
                {rules.length === 0 && !addingRule && (
                  <div className="text-center py-8 text-gray-400">
                    <Tag className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">No pricing rules yet — base price always applies</p>
                  </div>
                )}
                <div className="space-y-2">
                  {rules.map((rule) => (
                    <div key={rule.id} className={`flex items-center gap-3 p-3 rounded-xl border ${rule.isActive ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-gray-900">{rule.name}</span>
                          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${dayTypeBadge[rule.dayType]}`}>
                            {dayTypeLabel[rule.dayType]}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          {fmt(rule.startHour)} – {fmt(rule.endHour)} · Priority {rule.priority}
                        </p>
                      </div>
                      <p className="text-base font-bold text-emerald-600 shrink-0">
                        LKR {Number(rule.pricePerHour).toLocaleString()}<span className="text-xs text-gray-400 font-normal">/hr</span>
                      </p>
                      <button onClick={() => handleToggleRule(rule)} className="p-1.5 rounded-lg hover:bg-gray-100" title={rule.isActive ? 'Deactivate' : 'Activate'}>
                        {rule.isActive ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-gray-400" />}
                      </button>
                      <button onClick={() => handleDeleteRule(rule.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {addingRule ? (() => {
                  const conflicts = getConflicts(ruleForm.startHour, ruleForm.endHour, ruleForm.dayType);
                  // valid start hours: branch open → close-1
                  const validStartHours = HOURS.filter(h => h >= branchOpenHour && h < branchCloseHour);
                  // valid end hours: startHour+1 → branch close
                  const validEndHours = HOURS.filter(h => h > ruleForm.startHour && h <= branchCloseHour);
                  return (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-emerald-800">New Pricing Rule</p>
                        <p className="text-xs text-emerald-600">Branch hours: {fmt(branchOpenHour)} – {fmt(branchCloseHour)}</p>
                      </div>

                      {ruleTimeTouched && conflicts.length > 0 && (
                        <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                          <strong>Time conflict</strong> with: {conflicts.map(r => `"${r.name}" (${fmt(r.startHour)}–${fmt(r.endHour)})`).join(', ')}
                          <br />If intentional, set a higher priority so the right rule wins.
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="label">Rule Name *</label>
                          <input type="text" value={ruleForm.name} onChange={(e) => setRuleForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Weekday Night" className="input-field" />
                        </div>
                        <div>
                          <label className="label">Price / Hour (LKR) *</label>
                          <input type="number" value={ruleForm.pricePerHour} onChange={(e) => setRuleForm(f => ({ ...f, pricePerHour: e.target.value }))} placeholder="2500" className="input-field" />
                        </div>
                        <div>
                          <label className="label">Day Type</label>
                          <select value={ruleForm.dayType} onChange={(e) => setRuleForm(f => ({ ...f, dayType: e.target.value }))} className="input-field">
                            <option value="ALL">All Days</option>
                            <option value="WEEKDAY">Weekdays (Mon–Fri)</option>
                            <option value="WEEKEND">Weekends (Sat–Sun)</option>
                          </select>
                        </div>
                        <div>
                          <label className="label">Priority (higher wins)</label>
                          <input type="number" value={ruleForm.priority} onChange={(e) => setRuleForm(f => ({ ...f, priority: parseInt(e.target.value) }))} className="input-field" />
                        </div>
                        <div>
                          <label className="label">Start Time</label>
                          <select
                            value={ruleForm.startHour}
                            onChange={(e) => {
                              const newStart = parseInt(e.target.value);
                              setRuleTimeTouched(true);
                              setRuleForm(f => ({
                                ...f,
                                startHour: newStart,
                                endHour: f.endHour <= newStart ? Math.min(newStart + 1, branchCloseHour) : f.endHour,
                              }));
                            }}
                            className="input-field"
                          >
                            {validStartHours.map((h) => <option key={h} value={h}>{fmt(h)}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="label">End Time</label>
                          <select
                            value={ruleForm.endHour}
                            onChange={(e) => { setRuleTimeTouched(true); setRuleForm(f => ({ ...f, endHour: parseInt(e.target.value) })); }}
                            className="input-field"
                          >
                            {validEndHours.map((h) => <option key={h} value={h}>{fmt(h)}</option>)}
                          </select>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">
                        This rule applies from <strong>{fmt(ruleForm.startHour)}</strong> to <strong>{fmt(ruleForm.endHour)}</strong> ({ruleForm.endHour - ruleForm.startHour}h window)
                      </p>
                      <div className="flex gap-2">
                        <button onClick={() => setAddingRule(false)} className="flex-1 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600">Cancel</button>
                        <button onClick={handleAddRule} className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl">Add Rule</button>
                      </div>
                    </div>
                  );
                })() : (
                  <button
                    onClick={() => {
                      setRuleForm({ name: '', pricePerHour: '', dayType: 'ALL', startHour: branchOpenHour, endHour: branchCloseHour, priority: 0 });
                      setRuleTimeTouched(false);
                      setAddingRule(true);
                    }}
                    className="w-full py-2.5 border-2 border-dashed border-emerald-300 rounded-xl text-sm font-medium text-emerald-600 hover:bg-emerald-50 flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Add Pricing Rule
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {/* Schedule tab */}
        {modalTab === 'schedule' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">Set which days this court is available and the open/close hours per day.</p>

            {scheduleLoading ? (
              <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />)}</div>
            ) : (
              <>
                {/* Quick presets */}
                <div className="flex gap-2 flex-wrap">
                  {[
                    { label: 'Open All Days', action: () => setSchedule(s => s.map(d => ({ ...d, isOpen: true }))) },
                    { label: 'Weekdays Only', action: () => setSchedule(s => s.map(d => ({ ...d, isOpen: d.dayOfWeek >= 1 && d.dayOfWeek <= 5 }))) },
                    { label: 'Weekends Only', action: () => setSchedule(s => s.map(d => ({ ...d, isOpen: d.dayOfWeek === 0 || d.dayOfWeek === 6 }))) },
                  ].map(({ label, action }) => (
                    <button key={label} onClick={action} className="px-3 py-1.5 text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors">
                      {label}
                    </button>
                  ))}
                </div>

                <div className="space-y-2">
                  {schedule.map((s) => (
                    <div key={s.dayOfWeek} className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${s.isOpen ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-100'}`}>
                      <div className="w-10 text-center">
                        <p className="text-xs font-bold text-gray-700">{DAY_SHORT[s.dayOfWeek]}</p>
                        <p className="text-[10px] text-gray-400">{DAYS[s.dayOfWeek].slice(0, 3)}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={s.isOpen} onChange={(e) => setScheduleDay(s.dayOfWeek, 'isOpen', e.target.checked)} className="sr-only peer" />
                        <div className="w-10 h-5 bg-gray-200 peer-checked:bg-emerald-500 rounded-full peer peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-4 after:h-4 after:rounded-full after:bg-white after:transition-all" />
                      </label>
                      {s.isOpen ? (
                        <div className="flex items-center gap-2 flex-1">
                          <select value={s.openTime} onChange={(e) => setScheduleDay(s.dayOfWeek, 'openTime', e.target.value)} className="input-field py-1.5 text-sm flex-1">
                            {HOURS.slice(0, 24).map((h) => <option key={h} value={fmt(h)}>{fmt(h)}</option>)}
                          </select>
                          <span className="text-gray-400 text-sm shrink-0">to</span>
                          <select value={s.closeTime} onChange={(e) => setScheduleDay(s.dayOfWeek, 'closeTime', e.target.value)} className="input-field py-1.5 text-sm flex-1">
                            {HOURS.slice(1).map((h) => <option key={h} value={fmt(h)}>{fmt(h)}</option>)}
                          </select>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400 italic flex-1">Closed</p>
                      )}
                    </div>
                  ))}
                </div>

                <button onClick={handleSaveSchedule} disabled={scheduleSaving} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors">
                  {scheduleSaving ? 'Saving...' : 'Save Schedule'}
                </button>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

// ── Reusable court form ────────────────────────────────────────────────────────
function CourtForm({ form, setForm, sports, branches }: {
  form: any; setForm: any; sports: Sport[]; branches: Branch[];
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="sm:col-span-2">
        <label className="label">Court Name *</label>
        <input type="text" value={form.name} onChange={(e) => setForm((f: any) => ({ ...f, name: e.target.value }))} placeholder="e.g. Court A, Main Futsal" className="input-field" />
      </div>
      <div className="sm:col-span-2">
        <label className="label">Sports (select all that apply)</label>
        <div className="flex flex-wrap gap-2 mt-1">
          {sports.map((s) => {
            const checked = (form.sportIds as string[]).includes(s.id);
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setForm((f: any) => ({
                  ...f,
                  sportIds: checked
                    ? f.sportIds.filter((id: string) => id !== s.id)
                    : [...f.sportIds, s.id],
                }))}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border-2 transition-all ${
                  checked
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-400'
                }`}
              >
                {s.name}
              </button>
            );
          })}
        </div>
        {sports.length === 0 && <p className="text-xs text-gray-400 mt-1">No sports configured — add sports in admin panel</p>}
      </div>
      <div>
        <label className="label">Branch *</label>
        <select value={form.branchId} onChange={(e) => setForm((f: any) => ({ ...f, branchId: e.target.value }))} className="input-field">
          <option value="">Select branch</option>
          {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>
      <div>
        <label className="label">Base Price / Hour (LKR) *</label>
        <input type="number" value={form.pricePerHour} onChange={(e) => setForm((f: any) => ({ ...f, pricePerHour: e.target.value }))} placeholder="2000" className="input-field" />
      </div>
      <div>
        <label className="label">Court Size</label>
        <select value={form.size} onChange={(e) => setForm((f: any) => ({ ...f, size: e.target.value }))} className="input-field">
          <option value="">Select size</option>
          {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div>
        <label className="label">Min Duration (min)</label>
        <select value={form.minDuration} onChange={(e) => setForm((f: any) => ({ ...f, minDuration: parseInt(e.target.value) }))} className="input-field">
          {[30, 60, 90, 120].map((v) => <option key={v} value={v}>{v} min</option>)}
        </select>
      </div>
      <div>
        <label className="label">Max Duration (min)</label>
        <select value={form.maxDuration} onChange={(e) => setForm((f: any) => ({ ...f, maxDuration: parseInt(e.target.value) }))} className="input-field">
          {[60, 90, 120, 180, 240].map((v) => <option key={v} value={v}>{v} min</option>)}
        </select>
      </div>
      <div className="sm:col-span-2">
        <label className="label">Description</label>
        <textarea value={form.description} onChange={(e) => setForm((f: any) => ({ ...f, description: e.target.value }))} rows={2} placeholder="Optional description..." className="input-field resize-none" />
      </div>
    </div>
  );
}
