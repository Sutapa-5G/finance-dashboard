import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const navItems = [
  { path: '/',             label: 'Dashboard',    icon: '📊' },
  { path: '/transactions', label: 'Transactions', icon: '💳' },
  { path: '/budget',       label: 'Budget',       icon: '🎯' },
];

export default function Sidebar() {
  const { user, logout }             = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <aside className="w-60 shrink-0 bg-white dark:bg-gray-800 border-r border-gray-200
                      dark:border-gray-700 flex flex-col h-full">
      <div className="px-5 py-5 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white">FinanceTrack</p>
            <p className="text-xs text-gray-400">Personal Dashboard</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(item => (
          <NavLink key={item.path} to={item.path} end={item.path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition
               ${isActive
                 ? 'bg-indigo-50 dark:bg-indigo-900/30 text-primary'
                 : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'
               }`
            }>
            <span>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-gray-100 dark:border-gray-700 space-y-2">
        <button onClick={toggleDarkMode}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm
                     text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition">
          {darkMode ? 'Light mode' : 'Dark mode'}
        </button>

        <div className="flex items-center gap-3 px-2 py-1">
          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 text-primary
                          flex items-center justify-center text-sm font-bold shrink-0">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 dark:text-white truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
          <button onClick={logout}
            className="text-xs text-red-400 hover:text-red-600 font-medium shrink-0">
            Out
          </button>
        </div>
      </div>
    </aside>
  );
}