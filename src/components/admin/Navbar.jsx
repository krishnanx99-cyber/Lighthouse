import React, { useState, useRef, useEffect } from 'react';
import { Search, LogOut, User, Sun, Moon, ChevronDown, UserCircle2, ClipboardList, Loader2, X } from 'lucide-react';
import { auth, db } from '../../config/firebase';
import { signOut } from 'firebase/auth';
import { useTheme } from '../../context/ThemeContext';
import { collection, query, where, getDocs, limit, or } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { isDark, toggleTheme } = useTheme();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState({ volunteers: [], tasks: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);
  const navigate = useNavigate();
  
  const handleLogout = () => signOut(auth);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm.trim().length >= 2) {
        performSearch();
      } else {
        setSearchResults({ volunteers: [], tasks: [] });
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const performSearch = async () => {
    setIsSearching(true);
    setShowResults(true);
    try {
      // Search Volunteers
      const volQ = query(
        collection(db, 'users'),
        where('role', '==', 'Volunteer'),
        limit(5)
      );
      const volSnap = await getDocs(volQ);
      const vols = volSnap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(v => v.name?.toLowerCase().includes(searchTerm.toLowerCase()) || v.email?.toLowerCase().includes(searchTerm.toLowerCase()));

      // Search Tasks
      const taskQ = query(
        collection(db, 'tasks'),
        where('ngoId', '==', auth.currentUser?.uid),
        limit(5)
      );
      const taskSnap = await getDocs(taskQ);
      const tasks = taskSnap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(t => t.taskName?.toLowerCase().includes(searchTerm.toLowerCase()));

      setSearchResults({ volunteers: vols, tasks: tasks });
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleResultClick = (type, id) => {
    setShowResults(false);
    setSearchTerm('');
    if (type === 'volunteer') {
      navigate('/admin/volunteers'); // In a real app, we might go to a specific user page
    } else {
      navigate('/admin/dashboard'); // Or to a task detail
    }
  };

  return (
    <header className="h-16 px-6 flex items-center justify-between bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 transition-colors duration-200">
      <div className="flex-1 flex items-center">
        <div className="relative w-full max-w-md" ref={searchRef}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search volunteers or tasks..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => searchTerm.length >= 2 && setShowResults(true)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl py-2 pl-10 pr-10 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X size={14} />
            </button>
          )}

          {/* Search Results Dropdown */}
          {showResults && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="max-h-[400px] overflow-y-auto p-2">
                {isSearching ? (
                  <div className="flex items-center justify-center py-8 text-slate-400 gap-2">
                    <Loader2 size={18} className="animate-spin text-blue-500" />
                    <span className="text-sm font-medium">Searching records...</span>
                  </div>
                ) : (searchResults.volunteers.length === 0 && searchResults.tasks.length === 0) ? (
                  <div className="py-8 text-center">
                    <p className="text-sm text-slate-500 dark:text-slate-400">No results found for "{searchTerm}"</p>
                  </div>
                ) : (
                  <>
                    {searchResults.volunteers.length > 0 && (
                      <div className="mb-2">
                        <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Volunteers</div>
                        {searchResults.volunteers.map(v => (
                          <button 
                            key={v.id}
                            onClick={() => handleResultClick('volunteer', v.id)}
                            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors text-left"
                          >
                            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                              <UserCircle2 size={18} />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-900 dark:text-white">{v.name || 'Anonymous'}</p>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{v.email}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                    {searchResults.tasks.length > 0 && (
                      <div>
                        <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-t border-slate-100 dark:border-slate-800 mt-1 pt-3">Tasks</div>
                        {searchResults.tasks.map(t => (
                          <button 
                            key={t.id}
                            onClick={() => handleResultClick('task', t.id)}
                            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors text-left"
                          >
                            <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
                              <ClipboardList size={18} />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-900 dark:text-white">{t.taskName}</p>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{t.status} • {t.urgency}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} /> }
        </button>
        
        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>
        
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-sm ring-2 ring-white dark:ring-slate-900">
              <User size={16} />
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-slate-900 dark:text-white leading-none mb-0.5">
                {auth.currentUser?.displayName || 'Admin'}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-none">NGO Account</p>
            </div>
            <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-2 z-50 transition-all duration-200">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {auth.currentUser?.displayName || 'NGO Administrator'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  {auth.currentUser?.email || 'admin@lighthouse.org'}
                </p>
              </div>
              
              <div className="p-1">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors group"
                >
                  <LogOut size={16} className="group-hover:translate-x-0.5 transition-transform" />
                  <span className="font-medium">Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
