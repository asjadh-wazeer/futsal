import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Menu } from 'lucide-react';
import OwnerSidebar from '../components/owner/OwnerSidebar';
import { RootState } from '../store';

const pageTitles: Record<string, string> = {
  '/owner': 'Dashboard',
  '/owner/futsals': 'My Futsal Locations',
  '/owner/courts': 'Courts',
  '/owner/bookings': 'Bookings',
  '/owner/analytics': 'Analytics',
  '/owner/staff': 'Staff',
  '/owner/settlements': 'Settlements',
};

export default function OwnerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const admin = useSelector((s: RootState) => s.auth.admin);
  const title = pageTitles[location.pathname] || 'Owner Portal';

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <OwnerSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-6 lg:px-8 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100">
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
              <p className="hidden sm:block text-xs text-gray-500">{admin?.business?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-sm font-bold">
              {admin?.name?.[0]?.toUpperCase() || 'O'}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-gray-900 leading-none">{admin?.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">Owner</p>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
