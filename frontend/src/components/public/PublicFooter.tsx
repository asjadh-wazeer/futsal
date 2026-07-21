import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Zap, Phone, Mail, MapPin, Instagram, Facebook, Twitter } from 'lucide-react';
import { setPreferredSport } from '../../store/slices/bookingSlice';

export default function PublicFooter() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSportClick = (sportName: string) => {
    dispatch(setPreferredSport(sportName));
    navigate('/booking/branch');
  };

  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" fill="white" />
              </div>
              <div>
                <span className="text-lg font-bold text-white">Lanka Futsal</span>
                <div className="text-[10px] text-brand-400 font-medium -mt-1">HUB</div>
              </div>
            </div>
            <p className="text-sm leading-relaxed mb-4">
              Sri Lanka's premier sports booking platform. Book futsal, cricket, and badminton courts instantly.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-brand-600 transition-colors"><Facebook className="w-4 h-4" /></a>
              <a href="#" className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-brand-600 transition-colors"><Instagram className="w-4 h-4" /></a>
              <a href="#" className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-brand-600 transition-colors"><Twitter className="w-4 h-4" /></a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/booking/branch" className="hover:text-white transition-colors">Book a Court</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Sports</h4>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => handleSportClick('Football / Futsal')} className="hover:text-white transition-colors cursor-pointer">Football / Futsal</button></li>
              <li><button onClick={() => handleSportClick('Cricket Nets')} className="hover:text-white transition-colors cursor-pointer">Cricket Nets</button></li>
              <li><button onClick={() => handleSportClick('Badminton')} className="hover:text-white transition-colors cursor-pointer">Badminton</button></li>
            </ul>
          </div>

          <div id="contact">
            <h4 className="text-sm font-semibold text-white mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 text-brand-500 shrink-0" />
                <span>45 Galle Road, Wellawatte, Colombo 06</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-500 shrink-0" />
                <a href="tel:+94112345678" className="hover:text-white transition-colors">+94 11 234 5678</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-500 shrink-0" />
                <a href="mailto:info@lankafutsal.lk" className="hover:text-white transition-colors">info@lankafutsal.lk</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs">
          <p>&copy; 2026 Lanka Futsal Hub. All rights reserved.</p>
          <p>Powered by <span className="text-brand-500 font-medium">Webtezza</span></p>
        </div>
      </div>
    </footer>
  );
}
