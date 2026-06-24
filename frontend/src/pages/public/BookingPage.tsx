import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import BookingSteps from '../../components/public/BookingSteps';

export default function BookingPage() {
  const navigate = useNavigate();

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <BookingSteps current={1} />
      <div className="text-center mt-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Start Your Booking</h2>
        <p className="text-gray-500 mb-8">Select a branch to get started</p>
        <button onClick={() => navigate('/booking/branch')} className="btn-primary">
          Choose Branch <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
