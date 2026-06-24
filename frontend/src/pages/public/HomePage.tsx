import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ArrowRight, MapPin, Clock, Shield, Star, ChevronRight, Zap, Search } from 'lucide-react';
import { setPreferredSport } from '../../store/slices/bookingSlice';

const sports = [
  {
    name: 'Football / Futsal',
    icon: '⚽',
    description: 'Premium astroturf 5-a-side & futsal courts with floodlights',
    price: 'From LKR 3,500/hr',
    color: 'from-green-500 to-green-600',
    badge: 'Most Popular',
  },
  {
    name: 'Cricket Nets',
    icon: '🏏',
    description: 'Professional indoor cricket practice nets for all skill levels',
    price: 'From LKR 2,000/hr',
    color: 'from-blue-500 to-blue-600',
    badge: 'Great for Practice',
  },
  {
    name: 'Badminton',
    icon: '🏸',
    description: 'Olympic-standard badminton courts with wooden flooring',
    price: 'From LKR 1,500/hr',
    color: 'from-amber-500 to-amber-600',
    badge: 'Available Now',
  },
];

const features = [
  { icon: Zap, title: 'Instant Booking', desc: 'Book your court in under 60 seconds. No waiting, no callbacks.' },
  { icon: Clock, title: 'Real-Time Slots', desc: 'See live availability and choose your perfect time slot.' },
  { icon: Shield, title: 'Secure Payment', desc: 'Pay safely online via PayHere or cash at the venue.' },
  { icon: Star, title: 'Premium Facilities', desc: 'Top-quality courts maintained to the highest standards.' },
];


export default function HomePage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSelectSport = (sportName: string) => {
    dispatch(setPreferredSport(sportName));
    navigate('/booking/branch');
  };

  return (
    <div>
      {/* Hero */}
      <section className="gradient-hero text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-20 w-72 h-72 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-medium mb-6 border border-white/20">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Courts available today
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              Book Your Perfect
              <span className="block text-green-300">Sports Court</span>
              in Sri Lanka
            </h1>
            <p className="text-lg text-green-100 mb-8 leading-relaxed max-w-xl">
              Futsal, cricket nets, and badminton courts at premium venues across Colombo and Kandy. Book instantly, play immediately.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={() => navigate('/futsals')} className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white text-brand-700 font-bold rounded-xl hover:bg-green-50 transition-all shadow-lg text-base">
                <Search className="w-5 h-5" /> Browse Centers
              </button>
              <button onClick={() => navigate('/booking/branch')} className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 border border-white/20 transition-all text-base">
                Book Now <ArrowRight className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center gap-6 mt-8 text-sm text-green-200">
              <span className="flex items-center gap-1.5"><span className="text-green-300 font-bold">50+</span> Centers</span>
              <span className="flex items-center gap-1.5"><span className="text-green-300 font-bold">200+</span> Courts</span>
              <span className="flex items-center gap-1.5"><span className="text-green-300 font-bold">5,000+</span> Bookings</span>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Book Banner */}
      <section className="bg-brand-600 text-white py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm font-medium">Weekend slots filling fast! Book your court now.</p>
          <button onClick={() => navigate('/booking/branch')} className="flex items-center gap-2 bg-white text-brand-700 px-5 py-2 rounded-lg text-sm font-bold hover:bg-green-50 transition-colors shrink-0">
            Book Instantly <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Sports */}
      <section id="sports" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">Choose Your Sport</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">World-class facilities for every sport. All courts are professionally maintained and available to book online.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sports.map((sport) => (
              <div key={sport.name} className="group card hover:shadow-card-hover transition-all duration-300 cursor-pointer relative overflow-hidden" onClick={() => handleSelectSport(sport.name)}>
                <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-3xl bg-gradient-to-br ${sport.color} opacity-10 group-hover:opacity-20 transition-opacity`} />
                <div className="flex items-start justify-between mb-4">
                  <span className="text-5xl">{sport.icon}</span>
                  <span className="text-xs font-semibold bg-brand-100 text-brand-700 px-2.5 py-1 rounded-full">{sport.badge}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{sport.name}</h3>
                <p className="text-gray-500 text-sm mb-4">{sport.description}</p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="text-brand-600 font-semibold text-sm">{sport.price}</span>
                  <span className="flex items-center gap-1 text-sm text-gray-500 group-hover:text-brand-600 transition-colors font-medium">
                    Book Now <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">How It Works</h2>
            <p className="text-gray-500 text-lg">Book your court in 4 simple steps</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Choose Branch', desc: 'Pick a location near you — Colombo or Kandy', icon: '📍' },
              { step: '02', title: 'Select Sport', desc: 'Football, cricket, or badminton — your choice', icon: '🏆' },
              { step: '03', title: 'Pick a Slot', desc: 'See live availability and choose your time', icon: '🕐' },
              { step: '04', title: 'Pay & Play', desc: 'Secure payment and instant confirmation', icon: '✅' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-brand-600 text-white text-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                  {item.icon}
                </div>
                <div className="text-xs font-bold text-brand-600 mb-1">STEP {item.step}</div>
                <h3 className="text-base font-bold text-gray-900 mb-1.5">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <button onClick={() => navigate('/booking/branch')} className="btn-primary text-base px-8 py-3">
              Start Booking Now <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="p-6 rounded-2xl bg-gray-50 hover:bg-brand-50 transition-colors group">
                <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center mb-4 group-hover:bg-brand-200 transition-colors">
                  <Icon className="w-5 h-5 text-brand-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1.5">{title}</h3>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Browse Centers CTA */}
      <section id="about" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-10">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Browse All Futsal Centers</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Discover registered futsal grounds across Sri Lanka — search by city, filter by sport, and book instantly.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <div className="flex items-center gap-2 px-5 py-3 bg-white rounded-2xl shadow-sm border border-gray-100 text-sm text-gray-600">
              <MapPin className="w-4 h-4 text-brand-600" /> Search by city or name
            </div>
            <div className="flex items-center gap-2 px-5 py-3 bg-white rounded-2xl shadow-sm border border-gray-100 text-sm text-gray-600">
              <span className="text-base">⚽</span> Filter by sport
            </div>
            <div className="flex items-center gap-2 px-5 py-3 bg-white rounded-2xl shadow-sm border border-gray-100 text-sm text-gray-600">
              <Clock className="w-4 h-4 text-brand-600" /> See real-time availability
            </div>
          </div>
          <button
            onClick={() => navigate('/futsals')}
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl transition-colors shadow-sm text-base"
          >
            <Search className="w-5 h-5" /> Browse All Centers <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 gradient-hero text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Ready to Play?</h2>
          <p className="text-green-200 text-lg mb-8 max-w-xl mx-auto">Join hundreds of players who book their courts online. Quick, easy, and instant confirmation.</p>
          <button onClick={() => navigate('/booking/branch')} className="inline-flex items-center gap-2 px-8 py-4 bg-white text-brand-700 font-bold rounded-xl hover:bg-green-50 transition-all shadow-lg text-base">
            Book Your Court Now <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>
    </div>
  );
}
