import { useNavigate } from 'react-router-dom';
import { Zap, Shield, Clock, Star, Users, MapPin } from 'lucide-react';

const values = [
  { icon: Zap, title: 'Instant Booking', desc: 'No phone calls, no waiting — book a court in under a minute.' },
  { icon: Shield, title: 'Secure & Reliable', desc: 'Safe online payments and verified venue partners across Sri Lanka.' },
  { icon: Clock, title: 'Real-Time Availability', desc: 'See live slot availability so you never show up to a booked court.' },
  { icon: Star, title: 'Quality First', desc: 'Every partner venue is vetted for facilities, safety, and upkeep.' },
];

export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <div>
      <section className="gradient-hero text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold mb-4">About Lanka Futsal Hub</h1>
          <p className="text-lg text-white/90 max-w-2xl mx-auto">
            We're Sri Lanka's premier sports court booking platform, connecting players with the
            best futsal, cricket, and badminton venues across the island.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Our Story</h2>
          <p className="text-gray-600 leading-relaxed">
            Lanka Futsal Hub started with a simple idea: booking a sports court shouldn't mean
            endless phone calls and uncertainty. Today, we partner with venues across Colombo and
            beyond to give players a fast, transparent way to find and reserve courts for
            football, futsal, cricket nets, and badminton.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-16">
          {values.map((v) => (
            <div key={v.title} className="card flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl gradient-brand flex items-center justify-center shrink-0">
                <v.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">{v.title}</h3>
                <p className="text-sm text-gray-500">{v.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center mb-16">
          <div className="card">
            <Users className="w-8 h-8 text-brand-600 mx-auto mb-3" />
            <p className="text-2xl font-extrabold text-gray-900">10,000+</p>
            <p className="text-sm text-gray-500">Happy players</p>
          </div>
          <div className="card">
            <MapPin className="w-8 h-8 text-brand-600 mx-auto mb-3" />
            <p className="text-2xl font-extrabold text-gray-900">20+</p>
            <p className="text-sm text-gray-500">Partner venues</p>
          </div>
          <div className="card">
            <Star className="w-8 h-8 text-brand-600 mx-auto mb-3" />
            <p className="text-2xl font-extrabold text-gray-900">4.8/5</p>
            <p className="text-sm text-gray-500">Average rating</p>
          </div>
        </div>

        <div className="text-center">
          <button onClick={() => navigate('/booking/branch')} className="btn-primary text-base px-8 py-3">
            Book a Court Now
          </button>
        </div>
      </section>
    </div>
  );
}
