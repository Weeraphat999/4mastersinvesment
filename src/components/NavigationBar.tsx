import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const NavigationBar: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? 'bg-blue-500 rounded px-3 py-2 text-white text-sm sm:text-base flex items-center gap-1'
      : 'text-gray-400 hover:text-white px-2 py-2 text-sm sm:text-base flex items-center gap-1';

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 w-full bg-gray-800 border-b border-gray-700 py-3 px-4 sm:px-6 z-50 flex items-center justify-between">
      <div className="text-lg sm:text-xl font-bold text-white">🎯 4 Masters</div>
      <div className="flex items-center gap-1 sm:gap-2">
        <NavLink to="/" className={linkClass} end>
          <span className="hidden sm:inline">🔍</span> Analyze
        </NavLink>
        <NavLink to="/portfolio" className={linkClass}>
          <span className="hidden sm:inline">💼</span> Portfolio
        </NavLink>
        <NavLink to="/journal" className={linkClass}>
          <span className="hidden sm:inline">📓</span> Journal
        </NavLink>
        {user && (
          <button
            onClick={handleSignOut}
            className="ml-2 text-gray-400 hover:text-white px-2 py-2 text-sm sm:text-base flex items-center gap-1"
          >
            <span className="hidden sm:inline">🚪</span> Sign Out
          </button>
        )}
      </div>
    </nav>
  );
};

export default NavigationBar;
