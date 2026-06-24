import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { LayoutDashboard, CalendarDays, LogOut, Store, Menu, X, MapPin } from 'lucide-react';
import { RootState } from '../store';
import { logout } from '../store/slices/authSlice';
import clsx from 'clsx';

const navItems = [
  { to: '/staff', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/staff/bookings', icon: CalendarDays, label: 'Bookings' },
];

function StaffSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
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
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Store className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-sm font-bold text-white truncate max-w-[120px] block">
                {admin?.business?.name || 'My Branch'}
              </span>
              <div className="text-[9px] text-blue-400 font-medium -mt-0.5">STAFF PORTAL</div>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Branch badge */}
        <div className="mx-3 mt-3 px-3 py-2 bg-blue-900/40 rounded-xl flex items-center gap-2">
          <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
          <div className="min-w-0">
            <p className="text-[10px] text-blue-400 font-semibold uppercase tracking-wide">Your Branch</p>
            <p className="text-xs text-white font-medium truncate">{(admin as any)?.branchName || 'Assigned branch'}</p>
          </div>
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
                  ? 'bg-blue-600 text-white shadow-sm'
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
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
              {admin?.name?.[0]?.toUpperCase() || 'S'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{admin?.name}</p>
              <p className="text-xs text-gray-500">Staff</p>
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

export default function StaffLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const admin = useSelector((s: RootState) => s.auth.admin);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <StaffSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center px-4 gap-3 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-500"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{admin?.business?.name}</p>
            <p className="text-xs text-gray-400">Staff Portal</p>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
