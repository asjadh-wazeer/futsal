import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Search, MapPin, Clock, Building2, ArrowRight, Filter, X } from 'lucide-react';
import { publicApi } from '../../services/api';
import { setBranch } from '../../store/slices/bookingSlice';
import { Branch, Sport } from '../../types';

const SPORT_ICONS: Record<string, string> = {
  Football: '⚽',
  Futsal: '⚽',
  Cricket: '🏏',
  Badminton: '🏸',
  Basketball: '🏀',
  Volleyball: '🏐',
  Tennis: '🎾',
};

function getSportIcon(name: string) {
  for (const key of Object.keys(SPORT_ICONS)) {
    if (name.toLowerCase().includes(key.toLowerCase())) return SPORT_ICONS[key];
  }
  return '🏟️';
}

export default function FutsalDiscoveryPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [allSports, setAllSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSportId, setSelectedSportId] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  // Fetch sports list once
  useEffect(() => {
    publicApi.getSports().then((res: any) => setAllSports(res.data)).catch(() => {});
  }, []);

  // Fetch branches when filters change
  useEffect(() => {
    setLoading(true);
    publicApi.getBranches({
      ...(debouncedSearch && { search: debouncedSearch }),
      ...(selectedSportId && { sportId: selectedSportId }),
    })
      .then((res: any) => setBranches(res.data))
      .finally(() => setLoading(false));
  }, [debouncedSearch, selectedSportId]);

  const handleBook = (branch: Branch) => {
    dispatch(setBranch(branch));
    navigate('/booking/court');
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedSportId('');
  };

  const hasFilters = search || selectedSportId;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="gradient-hero text-white py-14 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3">
            Find a Futsal Near You
          </h1>
          <p className="text-green-200 text-lg mb-8 max-w-lg mx-auto">
            Browse all registered futsal centers across Sri Lanka — search by name or city, filter by sport.
          </p>

          {/* Search bar */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, city or address…"
              className="w-full pl-12 pr-10 py-4 rounded-2xl text-gray-900 bg-white shadow-lg focus:outline-none focus:ring-2 focus:ring-green-400 text-base"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Sport filter pills */}
        {allSports.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap mb-6">
            <span className="text-sm font-medium text-gray-500 flex items-center gap-1.5 shrink-0">
              <Filter className="w-4 h-4" /> Filter:
            </span>
            <button
              onClick={() => setSelectedSportId('')}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                !selectedSportId
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-emerald-300 hover:text-emerald-600'
              }`}
            >
              All Sports
            </button>
            {allSports.map((sport) => (
              <button
                key={sport.id}
                onClick={() => setSelectedSportId(sport.id === selectedSportId ? '' : sport.id)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all flex items-center gap-1.5 ${
                  selectedSportId === sport.id
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-emerald-300 hover:text-emerald-600'
                }`}
              >
                <span>{getSportIcon(sport.name)}</span>
                {sport.name}
              </button>
            ))}
          </div>
        )}

        {/* Result count + clear */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-gray-500">
            {loading ? 'Searching…' : `${branches.length} futsal center${branches.length !== 1 ? 's' : ''} found`}
          </p>
          {hasFilters && !loading && (
            <button onClick={clearFilters} className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
              <X className="w-3.5 h-3.5" /> Clear filters
            </button>
          )}
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-5 shadow-sm animate-pulse h-52" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && branches.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">No futsals found</h3>
            <p className="text-sm text-gray-400 mb-4">
              {hasFilters ? 'Try a different search term or remove some filters.' : 'No futsal centers are registered yet.'}
            </p>
            {hasFilters && (
              <button onClick={clearFilters} className="px-5 py-2 bg-emerald-600 text-white font-semibold rounded-xl text-sm hover:bg-emerald-700 transition-colors">
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Branch cards */}
        {!loading && branches.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {branches.map((branch) => {
              const branchSports: Sport[] = (branch as any).courts
                ? (branch as any).courts.map((c: any) => c.sport).filter(Boolean)
                : [];

              return (
                <div
                  key={branch.id}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 flex flex-col overflow-hidden group"
                >
                  {/* Color accent bar */}
                  <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 to-green-400" />

                  <div className="p-5 flex-1 flex flex-col">
                    {/* Header */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0 group-hover:bg-emerald-100 transition-colors">
                        <Building2 className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-base leading-snug">{branch.name}</h3>
                        <p className="text-sm text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          {branch.city}
                        </p>
                      </div>
                    </div>

                    {/* Address */}
                    <p className="text-xs text-gray-500 mb-3 leading-relaxed">{branch.address}</p>

                    {/* Sports available */}
                    {branchSports.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {branchSports.map((sport) => (
                          <span
                            key={sport.id}
                            className="inline-flex items-center gap-1 text-xs font-medium bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full"
                          >
                            {getSportIcon(sport.name)} {sport.name}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Info row */}
                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-4 mt-auto">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {branch.openTime} – {branch.closeTime}
                      </span>
                      {branch._count && (
                        <span className="text-emerald-600 font-semibold">
                          {branch._count.courts} court{branch._count.courts !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>

                    {/* Book button */}
                    <button
                      onClick={() => handleBook(branch)}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 group/btn"
                    >
                      Book Now
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
