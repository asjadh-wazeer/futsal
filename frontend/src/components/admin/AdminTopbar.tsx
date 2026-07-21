import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, Bell, Calendar } from 'lucide-react';
import { RootState } from '../../store';
import { adminApi } from '../../services/api';
import dayjs from 'dayjs';

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
  const navigate = useNavigate();
  const admin = useSelector((s: RootState) => s.auth.admin);
  const title = pageTitles[location.pathname] || 'Dashboard';

  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  const loadNotifications = () => {
    adminApi.getBookings({ status: 'PENDING' }).then((res) => {
      setNotifications((res.data?.bookings || res.data || []).slice(0, 8));
    }).catch(() => setNotifications([]));
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

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
        <div className="relative" ref={ref}>
          <button
            onClick={() => { setOpen((o) => { if (!o) loadNotifications(); return !o; }); }}
            className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <Bell className="w-5 h-5" />
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900">Pending Bookings</p>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">No new notifications</p>
                ) : (
                  notifications.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => { setOpen(false); navigate('/admin/bookings'); }}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-50 flex items-start gap-3"
                    >
                      <Calendar className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-800">{n.customerName || n.customer?.name || 'New booking'}</p>
                        <p className="text-xs text-gray-400">
                          {n.branch?.name ? `${n.branch.name} · ` : ''}{n.date ? dayjs(n.date).format('D MMM YYYY') : ''}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>
              {notifications.length > 0 && (
                <button
                  onClick={() => { setOpen(false); navigate('/admin/bookings'); }}
                  className="w-full text-center py-2.5 text-sm font-medium text-brand-600 hover:bg-brand-50 transition-colors"
                >
                  View all bookings
                </button>
              )}
            </div>
          )}
        </div>
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
