import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { Menu, Bell } from 'lucide-react';
import { RootState } from '../../store';

const pageTitles: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/bookings': 'Bookings',
  '/admin/courts': 'Courts',
  '/admin/branches': 'Branches',
  '/admin/customers': 'Customers',
  '/admin/analytics': 'Analytics',
  '/admin/settings': 'Settings',
};

interface Props {
  onMenuClick: () => void;
}

export default function AdminTopbar({ onMenuClick }: Props) {
  const location = useLocation();
  const admin = useSelector((s: RootState) => s.auth.admin);
  const title = pageTitles[location.pathname] || 'Dashboard';

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-6 lg:px-8 shrink-0">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100">
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
          <p className="hidden sm:block text-xs text-gray-500">{admin?.business?.name}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        <div className="flex items-center gap-2 pl-2 border-l border-gray-100">
          <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-sm font-bold">
            {admin?.name?.[0] || 'A'}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-900 leading-none">{admin?.name}</p>
            <p className="text-xs text-gray-500 mt-0.5">{admin?.role?.replace('_', ' ')}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
