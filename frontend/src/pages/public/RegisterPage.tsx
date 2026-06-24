import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Eye, EyeOff, User, Phone, Mail, Lock, UserPlus } from 'lucide-react';
import { customerRegister, clearCustomerError } from '../../store/slices/customerAuthSlice';
import { RootState, AppDispatch } from '../../store';
import { customerApi } from '../../services/api';

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error, token } = useSelector((s: RootState) => s.customerAuth);

  const from = (location.state as any)?.from || '/';

  useEffect(() => {
    if (token) navigate(from, { replace: true });
    return () => { dispatch(clearCustomerError()); };
  }, [token]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Full name is required';
    if (!form.email && !form.phone) e.email = 'Provide at least an email or phone number';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email address';
    if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    dispatch(customerRegister({
      name: form.name,
      email: form.email || undefined,
      phone: form.phone || undefined,
      password: form.password,
    }));
  };

  const f = (key: keyof typeof form, label: string, icon: React.ReactNode, type = 'text', placeholder = '') => (
    <div>
      <label className="label">{label}</label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>
        <input
          type={type}
          value={form[key]}
          onChange={(e) => { setForm(f => ({ ...f, [key]: e.target.value })); setErrors(er => ({ ...er, [key]: '' })); }}
          placeholder={placeholder}
          className={`input-field pl-10 ${errors[key] ? 'border-red-400' : ''}`}
        />
      </div>
      {errors[key] && <p className="text-xs text-red-500 mt-1">{errors[key]}</p>}
    </div>
  );

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="text-gray-500 mt-1">Join Lanka Futsal Hub for easy booking</p>
        </div>

        <div className="card shadow-lg border-0">
          <button
            onClick={() => { window.location.href = customerApi.googleLoginUrl; }}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all mb-5 text-sm"
          >
            <GoogleIcon />
            Sign up with Google
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">or register with email</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              {typeof error === 'string' ? error : 'Registration failed'}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {f('name', 'Full Name *', <User className="w-4 h-4" />, 'text', 'Kamal Perera')}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {f('email', 'Email Address', <Mail className="w-4 h-4" />, 'email', 'kamal@gmail.com')}
              {f('phone', 'Phone Number', <Phone className="w-4 h-4" />, 'tel', '+94 77 123 4567')}
            </div>
            <p className="text-xs text-gray-400 -mt-2">Provide at least one: email or phone</p>

            <div>
              <label className="label">Password *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => { setForm(f => ({ ...f, password: e.target.value })); setErrors(er => ({ ...er, password: '' })); }}
                  placeholder="Min. 6 characters"
                  className={`input-field pl-10 pr-10 ${errors.password ? 'border-red-400' : ''}`}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              <UserPlus className="w-4 h-4" />
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-xs text-gray-400 text-center mt-4">
            By registering you agree to our Terms & Privacy Policy
          </p>

          <p className="text-sm text-center text-gray-500 mt-3">
            Already have an account?{' '}
            <Link to="/login" state={{ from }} className="text-brand-600 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
