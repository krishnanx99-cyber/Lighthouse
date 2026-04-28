import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function NotFound() {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-200 ${isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <div className="text-center space-y-6 max-w-md">
        <h1 className="text-9xl font-extrabold text-blue-600 dark:text-blue-500 opacity-20">404</h1>
        <div className="-mt-16">
          <h2 className="text-3xl font-bold mb-2">Page Not Found</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        <button 
          onClick={() => navigate('/')}
          className="mx-auto flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-sm active:scale-95"
        >
          <Home size={20} />
          Back to Home
        </button>
      </div>
    </div>
  );
}
