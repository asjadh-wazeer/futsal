import { NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { LayoutDashboard, CalendarDays, Building2, BarChart3, LogOut, Store, X, MapPin, Users } from 'lucide-react';
import { RootState } from '../../store';
import { logout } from '../../store/slices/authSlice';
import clsx from 'clsx';

const navItems = [
  { to: '/owner', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/owner/futsals', icon: MapPin, label: 'My Futsals' },
  { to: '/owner/courts', icon: Building2, label: 'Courts' },
  { to: '/owner/bookings', icon: CalendarDays, label: 'Bookings' },
  { to: '/owner/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/owner/staff', icon: Users, label: 'Staff' },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function OwnerSidebar({ open, onClose }: Props) {
  const dispatch = useDispatch();
  const admin = useSelector((s: RootState) => s.auth.admin);

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={onClose} />}

      <aside className={clsx(
        'fixed lg:static inset-y-0 left-0 z-40 w-64 flex flex-col bg-gray-900 transition-transform duration-300',
        open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      )}>
        <div className="flex items-center justify-between h-16 px-5 border-b border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
              <Store className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-sm font-bold text-white truncate max-w-[120px] block">
                {admin?.business?.name || 'My Futsal'}
              </span>
              <div className="text-[9px] text-emerald-400 font-medium -mt-0.5">OWNER PORTAL</div>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) => clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white',
              )}
            >
              <Icon className="w-5 h-5" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-gray-800">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
              {admin?.name?.[0]?.toUpperCase() || 'O'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{admin?.name}</p>
              <p className="text-xs text-gray-500">Owner</p>
            </div>
          </div>
          <button
            onClick={() => dispatch(logout())}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
