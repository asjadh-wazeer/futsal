import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Store, User, Building2, Eye, EyeOff, CheckCircle, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { ownerRegistrationApi } from '../../services/api';

type Step = 'form' | 'success';

const INITIAL = {
  name: '', email: '', phone: '', password: '', confirmPassword: '',
  businessName: '', businessCity: '', businessAddress: '', businessPhone: '', businessEmail: '',
};

export default function OwnerRegisterPage() {
  const [form, setForm] = useState(INITIAL);
  const [step, setStep] = useState<Step>('form');
  const [submitting, setSubmitting] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState<Partial<typeof INITIAL>>({});

  const set = (field: keyof typeof INITIAL) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((err) => ({ ...err, [field]: '' }));
  };

  const validate = () => {
    const e: Partial<typeof INITIAL> = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.email.trim()) e.email = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email';
    if (!form.password) e.password = 'Required';
    else if (form.password.length < 8) e.password = 'Min 8 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    if (!form.businessName.trim()) e.businessName = 'Required';
    if (!form.businessCity.trim()) e.businessCity = 'Required';
    if (!form.businessAddress.trim()) e.businessAddress = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await ownerRegistrationApi.register({
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        password: form.password,
        businessName: form.businessName,
        businessCity: form.businessCity,
        businessAddress: form.businessAddress,
        businessPhone: form.businessPhone || undefined,
        businessEmail: form.businessEmail || undefined,
      });
      setStep('success');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-10 h-10 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Submitted!</h2>
            <p className="text-gray-500 mb-6 text-sm leading-relaxed">
              Thank you for registering <strong>{form.businessName}</strong>. Our team will review your application and contact you at <strong>{form.email}</strong> within 1–2 business days.
            </p>
            <div className="bg-emerald-50 rounded-xl p-4 mb-6 text-sm text-emerald-700">
              Once approved, you'll receive your login credentials and can start managing your bookings right away.
            </div>
            <Link
              to="/owner/login"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-lg">
        <div className="text-center mb-7">
          <div className="w-16 h-16 rounded-2xl bg-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Store className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Register Your Futsal Center</h1>
          <p className="text-gray-500 mt-1 text-sm">Join our platform and start managing bookings online</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 space-y-5">
          {/* Personal info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-emerald-700" />
              </div>
              <h3 className="font-semibold text-gray-800 text-sm">Your Details</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Full Name *</label>
                <input value={form.name} onChange={set('name')} placeholder="Mohamed Aslam" className={`input-field ${errors.name ? 'border-red-400' : ''}`} />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email Address *</label>
                <input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" className={`input-field ${errors.email ? 'border-red-400' : ''}`} />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Phone Number</label>
                <input value={form.phone} onChange={set('phone')} placeholder="07X XXX XXXX" className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Password *</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={form.password}
                    onChange={set('password')}
                    placeholder="Min 8 characters"
                    className={`input-field pr-10 ${errors.password ? 'border-red-400' : ''}`}
                  />
                  <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Confirm Password *</label>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={set('confirmPassword')}
                  placeholder="Repeat password"
                  className={`input-field ${errors.confirmPassword ? 'border-red-400' : ''}`}
                />
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100" />

          {/* Business info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                <Building2 className="w-3.5 h-3.5 text-blue-700" />
              </div>
              <h3 className="font-semibold text-gray-800 text-sm">Business Details</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Business Name *</label>
                <input value={form.businessName} onChange={set('businessName')} placeholder="Green Arena Futsal" className={`input-field ${errors.businessName ? 'border-red-400' : ''}`} />
                {errors.businessName && <p className="text-red-500 text-xs mt-1">{errors.businessName}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">City *</label>
                <input value={form.businessCity} onChange={set('businessCity')} placeholder="Colombo" className={`input-field ${errors.businessCity ? 'border-red-400' : ''}`} />
                {errors.businessCity && <p className="text-red-500 text-xs mt-1">{errors.businessCity}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Business Phone</label>
                <input value={form.businessPhone} onChange={set('businessPhone')} placeholder="011 XXX XXXX" className="input-field" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Address *</label>
                <input value={form.businessAddress} onChange={set('businessAddress')} placeholder="45 Galle Road, Wellawatte, Colombo" className={`input-field ${errors.businessAddress ? 'border-red-400' : ''}`} />
                {errors.businessAddress && <p className="text-red-500 text-xs mt-1">{errors.businessAddress}</p>}
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Business Email</label>
                <input type="email" value={form.businessEmail} onChange={set('businessEmail')} placeholder="info@greenarenafutsal.lk" className="input-field" />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {submitting ? 'Submitting…' : (
              <>Submit Registration <ChevronRight className="w-4 h-4" /></>
            )}
          </button>

          <p className="text-xs text-gray-400 text-center">
            Already have an account?{' '}
            <Link to="/owner/login" className="text-emerald-600 font-medium hover:underline">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
