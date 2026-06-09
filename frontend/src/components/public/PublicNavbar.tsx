import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Menu, X, Zap, Phone, User, LogOut, ChevronDown } from 'lucide-react';
import { RootState } from '../../store';
import { customerLogout } from '../../store/slices/customerAuthSlice';

export default function PublicNavbar() {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token, customer } = useSelector((s: RootState) => s.customerAuth);

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center shadow-sm">
              <Zap className="w-5 h-5 text-white" fill="white" />
            </div>
            <div>
              <span className="text-lg font-bold text-gray-900">Lanka Futsal</span>
              <span className="hidden sm:block text-[10px] text-brand-600 font-medium -mt-1 leading-none">HUB</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <Link to="/" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-brand-600 rounded-lg hover:bg-brand-50 transition-all">Home</Link>
            <Link to="/futsals" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-brand-600 rounded-lg hover:bg-brand-50 transition-all">Browse Centers</Link>
            <Link to="/booking/branch" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-brand-600 rounded-lg hover:bg-brand-50 transition-all">Book Now</Link>
            <a href="#about" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-brand-600 rounded-lg hover:bg-brand-50 transition-all">About</a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <a href="tel:+94112345678" className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-brand-600 transition-colors">
              <Phone className="w-4 h-4" />
              <span>+94 11 234 5678</span>
            </a>

            {token && customer ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-xl border border-gray-200 hover:border-brand-300 hover:bg-brand-50 transition-all"
                >
                  <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold overflow-hidden">
                    {customer.avatarUrl
                      ? <img src={customer.avatarUrl} alt="" className="w-full h-full object-cover" />
                      : customer.name?.[0]?.toUpperCase()
                    }
                  </div>
                  <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate">{customer.name?.split(' ')[0]}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                </button>

                {profileOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-20">
                      <Link to="/profile" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                        <User className="w-4 h-4 text-gray-400" /> My Profile
                      </Link>
                      <Link to="/profile" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                        <span className="w-4 h-4 text-gray-400 flex items-center justify-center text-xs">📋</span> My Bookings
                      </Link>
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button onClick={() => { dispatch(customerLogout()); setProfileOpen(false); }} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 w-full">
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-ghost text-sm py-2 px-3">Sign In</Link>
                <button onClick={() => navigate('/booking/branch')} className="btn-primary text-sm px-4 py-2">
                  Book a Court
                </button>
              </div>
            )}
          </div>

          <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
          <Link to="/" onClick={() => setOpen(false)} className="block px-4 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50">Home</Link>
          <Link to="/futsals" onClick={() => setOpen(false)} className="block px-4 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50">Browse Centers</Link>
          <Link to="/booking/branch" onClick={() => setOpen(false)} className="block px-4 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50">Book Now</Link>
          <a href="#about" onClick={() => setOpen(false)} className="block px-4 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50">About</a>
          <div className="border-t border-gray-100 pt-2 space-y-1">
            {token && customer ? (
              <>
                <Link to="/profile" onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50">
                  <User className="w-4 h-4" /> {customer.name?.split(' ')[0]}'s Profile
                </Link>
                <button onClick={() => { dispatch(customerLogout()); setOpen(false); }} className="flex items-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-red-500 rounded-lg hover:bg-red-50">
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)} className="block px-4 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50">Sign In</Link>
                <Link to="/register" onClick={() => setOpen(false)} className="block px-4 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50">Create Account</Link>
              </>
            )}
            <button onClick={() => { setOpen(false); navigate('/booking/branch'); }} className="btn-primary w-full mt-1">Book a Court</button>
          </div>
        </div>
      )}
    </nav>
  );
}
