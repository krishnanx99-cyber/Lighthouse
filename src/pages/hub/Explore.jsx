import React, { useState, useEffect } from 'react';
import { db, auth } from '../../config/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import BottomNav from '../../components/hub/BottomNav';
import { Search, MapPin, SlidersHorizontal, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Explore() {
  const [tasks, setTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(collection(db, 'tasks'), where('status', '==', 'open'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsubscribe;
  }, []);

  const filteredTasks = tasks.filter(t => 
    t.taskName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 transition-colors duration-200">
      <div className="px-5 pt-8 pb-4 sticky top-0 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md z-40">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Explore Missions</h1>
        
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Search by task or city..."
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <main className="px-5 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-bold text-slate-900 dark:text-white uppercase text-[10px] tracking-widest">Near You</h2>
          <span className="text-xs text-slate-400">{filteredTasks.length} missions found</span>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-slate-400 text-sm italic">No missions matching your search.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTasks.map(task => (
              <div 
                key={task.id} 
                onClick={() => navigate(`/hub/task/${task.id}`)}
                className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex gap-4 cursor-pointer hover:border-blue-500/30 transition-all"
              >
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-xl shrink-0 flex items-center justify-center text-blue-600">
                  <MapPin size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 dark:text-white truncate mb-1">{task.taskName}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate mb-2">{task.location}</p>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold rounded uppercase">
                      {task.urgency || 'Standard'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
