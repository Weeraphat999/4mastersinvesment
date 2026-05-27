import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Disclaimer } from '../components/Disclaimer';

export default function LandingPage() {
  const { session } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      <div className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Four Masters Investor
        </h1>
        <p className="text-lg text-gray-300 max-w-2xl mb-8">
          Analyze stocks through the lens of four legendary investment masters.
          Get comprehensive scoring, portfolio tracking, and decision journaling
          to make smarter investment decisions.
        </p>
        {session ? (
          <Link
            to="/analyze"
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-lg"
          >
            Go to Analysis
          </Link>
        ) : (
          <Link
            to="/signup"
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-lg"
          >
            Get Started
          </Link>
        )}
      </div>
      <Disclaimer />
    </div>
  );
}
