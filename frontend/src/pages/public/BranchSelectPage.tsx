import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { MapPin, Clock, ArrowRight, ChevronRight } from 'lucide-react';
import { setBranch } from '../../store/slices/bookingSlice';
import { publicApi } from '../../services/api';
import BookingSteps from '../../components/public/BookingSteps';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Branch } from '../../types';

export default function BranchSelectPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    publicApi.getBranches()
      .then((res) => setBranches(res.data))
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = (branch: Branch) => {
    dispatch(setBranch(branch));
    navigate('/booking/court');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <BookingSteps current={1} />

      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Choose a Branch</h2>
        <p className="text-gray-500">Select the location closest to you</p>
      </div>

      {loading ? (
        <LoadingSpinner size="lg" className="py-16" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {branches.map((branch) => (
            <button
              key={branch.id}
              onClick={() => handleSelect(branch)}
              className="card text-left hover:shadow-card-hover hover:border-brand-200 transition-all duration-200 group border-2 border-transparent"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center shrink-0 group-hover:bg-brand-200 transition-colors">
                  <MapPin className="w-6 h-6 text-brand-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg mb-1">{branch.name}</h3>
                  <p className="text-sm text-gray-500 mb-3">{branch.address}, {branch.city}</p>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {branch.openTime} – {branch.closeTime}
                    </span>
                    {branch._count && (
                      <span className="text-brand-600 font-medium">{branch._count.courts} courts</span>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-brand-600 group-hover:translate-x-1 transition-all mt-1 shrink-0" />
              </div>
            </button>
          ))}
        </div>
      )}

      {!loading && branches.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No branches available at the moment.</p>
        </div>
      )}
    </div>
  );
}
