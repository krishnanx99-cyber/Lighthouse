import React, { useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import RoleSelection from '../components/RoleSelection';
import Auth from '../components/Auth';
import { useTheme } from '../context/ThemeContext';

export default function Login() {
  const [selectedRole, setSelectedRole] = useState(null);
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col items-center justify-center p-4 transition-colors duration-200">
      <div className="absolute top-6 right-6">
        <button 
          onClick={toggleTheme}
          className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 shadow-sm transition-colors"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      <div className="w-full max-w-lg transition-all duration-500 ease-in-out">
        {/* Branding Section */}
        <div className="mb-12 text-center animate-in fade-in zoom-in-95 duration-700">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-3xl shadow-2xl shadow-blue-500/30 mb-8 rotate-3 hover:rotate-0 transition-transform duration-500 group">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 text-white">
              <path d="M12 2l-3 3h6l-3-3z" />
              <path d="M11 5l-2 17h6l-2-17h-2z" />
              <path d="M9 12h6" />
              <path d="M9 16h6" />
              <circle cx="12" cy="3.5" r="1.5" fill="white" className="animate-pulse" />
            </svg>
          </div>
          <h1 className="text-5xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
            Lighthouse
          </h1>
          <div className="space-y-2">
            <p className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Your beacon for social good.
            </p>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">
              Guiding volunteers. Empowering NGOs.
            </p>
          </div>
        </div>
        
        {!selectedRole ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <RoleSelection selectedRole={selectedRole} onSelectRole={setSelectedRole} />
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex items-center justify-between mb-2 px-1">
              <button 
                onClick={() => setSelectedRole(null)}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                ← Change Role
              </button>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                As {selectedRole}
              </span>
            </div>
            <Auth selectedRole={selectedRole} />
          </div>
        )}

      </div>
    </div>
  );
}
