import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { setCourt, setSport } from '../../store/slices/bookingSlice';
import { RootState } from '../../store';
import { publicApi } from '../../services/api';
import BookingSteps from '../../components/public/BookingSteps';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Court, Sport } from '../../types';
import clsx from 'clsx';

const sportIcons: Record<string, string> = {
  football: '⚽',
  cricket: '🏏',
  badminton: '🏸',
  default: '🏆',
};

export default function CourtSelectPage() {
  const [sports, setSports] = useState<Sport[]>([]);
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selectedBranch, selectedSport } = useSelector((s: RootState) => s.booking);

  useEffect(() => {
    if (!selectedBranch) { navigate('/booking/branch'); return; }
    publicApi.getBranchSports(selectedBranch.id)
      .then((res) => setSports(res.data))
      .finally(() => setLoading(false));
  }, [selectedBranch]);

  useEffect(() => {
    if (!selectedBranch || !selectedSport) return;
    publicApi.getCourts({ branchId: selectedBranch.id, sportId: selectedSport.id })
      .then((res) => setCourts(res.data));
  }, [selectedSport]);

  const handleSelectSport = (sport: Sport) => {
    dispatch(setSport(sport));
  };

  const handleSelectCourt = (court: Court) => {
    dispatch(setCourt(court));
    navigate('/booking/slot');
  };

  const getIcon = (sport: Sport) => sportIcons[sport.icon || ''] || sportIcons.default;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <BookingSteps current={2} />

      <button onClick={() => navigate('/booking/branch')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-brand-600 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Branches
      </button>

      <div className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Select a Court</h2>
        <p className="text-gray-500">{selectedBranch?.name}</p>
      </div>

      {loading ? (
        <LoadingSpinner size="lg" className="py-16" />
      ) : (
        <>
          {/* Sport filter */}
          <div className="flex flex-wrap gap-2 justify-center mb-6">
            {sports.map((sport) => (
              <button
                key={sport.id}
                onClick={() => handleSelectSport(sport)}
                className={clsx(
                  'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all',
                  selectedSport?.id === sport.id
                    ? 'bg-brand-600 text-white border-brand-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-brand-300'
                )}
              >
                <span>{getIcon(sport)}</span>
                {sport.name}
              </button>
            ))}
          </div>

          {/* Courts grid */}
          {selectedSport && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {courts.map((court) => (
                <button
                  key={court.id}
                  onClick={() => handleSelectCourt(court)}
                  className="card text-left hover:shadow-card-hover hover:border-brand-200 border-2 border-transparent transition-all duration-200 group"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="text-3xl">{getIcon(court.sport)}</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{court.name}</h3>
                      <span className="text-xs text-brand-600 font-medium bg-brand-50 px-2 py-0.5 rounded-full">{court.sport.name}</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-brand-600 group-hover:translate-x-1 transition-all shrink-0" />
                  </div>
                  {court.description && <p className="text-sm text-gray-500 mb-3">{court.description}</p>}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="text-lg font-bold text-brand-600">LKR {court.pricePerHour.toLocaleString()}<span className="text-xs text-gray-400 font-normal">/hr</span></span>
                    <span className="text-xs text-gray-500">Min. {court.minDuration} min</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {selectedSport && courts.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p>No courts available for this sport.</p>
            </div>
          )}

          {!selectedSport && (
            <div className="text-center py-12 text-gray-400">
              <p className="text-lg">Select a sport above to see available courts</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
