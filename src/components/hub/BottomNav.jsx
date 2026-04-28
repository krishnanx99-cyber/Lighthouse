import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Clock, User } from 'lucide-react';

export default function BottomNav() {
  const location = useLocation();
  
  const navItems = [
    { name: 'Home', path: '/hub', icon: Home },
    { name: 'Explore', path: '/hub/explore', icon: Search },
    { name: 'History', path: '/hub/history', icon: Clock },
    { name: 'Profile', path: '/hub/profile', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pt-2 px-6 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] transition-colors duration-200">
      <div className="flex justify-between items-center h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path === '/hub' && location.pathname === '/hub');
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center justify-center w-16 h-12 transition-all duration-300 ${
                isActive 
                  ? 'text-blue-600 dark:text-blue-400 scale-105' 
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'
              }`}
            >
              <Icon size={22} />
              <span className={`text-[10px] mt-1 font-semibold ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
