import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setGoogleAuth } from '../../store/slices/customerAuthSlice';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function GoogleCallbackPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const token = params.get('token');
    const name = params.get('name');

    if (token) {
      dispatch(setGoogleAuth({
        token,
        customer: { name: decodeURIComponent(name || '') },
      }));
      // Fetch real profile data immediately
      navigate('/profile', { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  }, []);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <LoadingSpinner size="lg" />
      <p className="text-gray-500 text-sm font-medium">Signing you in with Google...</p>
    </div>
  );
}
