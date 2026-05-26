import { NavLink } from 'react-router-dom';

const NavigationBar: React.FC = () => {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? 'bg-blue-500 rounded px-4 py-2 text-white'
      : 'text-gray-400 hover:text-white';

  return (
    <nav className="fixed top-0 w-full bg-gray-800 border-b border-gray-700 py-4 px-6 z-50 flex items-center justify-between">
      <div className="text-xl font-bold text-white">🎯 4 Masters</div>
      <div className="flex items-center gap-2">
        <NavLink to="/" className={linkClass} end>
          🔍 Analyze
        </NavLink>
        <NavLink to="/portfolio" className={linkClass}>
          💼 Portfolio
        </NavLink>
        <NavLink to="/journal" className={linkClass}>
          📓 Journal
        </NavLink>
      </div>
    </nav>
  );
};

export default NavigationBar;
