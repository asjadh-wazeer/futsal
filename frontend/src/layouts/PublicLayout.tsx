import { Outlet } from 'react-router-dom';
import PublicNavbar from '../components/public/PublicNavbar';
import PublicFooter from '../components/public/PublicFooter';

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <PublicNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  );
}
