import React, { useState, useEffect } from 'react';
import { db, auth } from '../../config/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import BottomNav from '../../components/hub/BottomNav';
import { CheckCircle, Calendar, MapPin, Award } from 'lucide-react';

export default function History() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(
      collection(db, 'tasks'), 
      where('assignedVolunteerId', '==', auth.currentUser.uid),
      where('status', '==', 'completed')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const formatDate = (date) => {
    if (!date) return 'Past Mission';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 transition-colors duration-200">
      <main className="px-5 pt-8 space-y-6">
        <div className="space-y-4">
          <h2 className="font-bold text-slate-900 dark:text-white uppercase text-xs tracking-widest mb-4">Mission History</h2>
          
          {loading ? (
            <div className="py-20 flex justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-blue-600"></div>
            </div>
          ) : tasks.length === 0 ? (
            <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
              <CheckCircle size={32} className="mx-auto text-slate-200 dark:text-slate-800 mb-3" />
              <p className="text-slate-400 text-sm italic">No completed missions yet. Start your journey today!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.map(task => (
                <div 
                  key={task.id} 
                  className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-[10px] font-bold rounded uppercase">
                        Mission Success
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1">
                      <Calendar size={10} />
                      {formatDate(task.scheduledTime)}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white mb-2">{task.taskName}</h3>
                  <div className="flex items-center gap-3">
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 min-w-0">
                      <MapPin size={12} className="shrink-0" />
                      <span className="truncate">{task.location}</span>
                    </p>
                    <div className="h-3 w-px bg-slate-200 dark:bg-slate-800"></div>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-bold shrink-0">
                      +{task.estimatedDuration || 0}h Impact
                    </p>
                  </div>
                  <div className="absolute top-0 right-0 w-16 h-16 bg-green-600/5 dark:bg-green-600/10 rounded-bl-full -mr-8 -mt-8 pointer-events-none group-hover:scale-110 transition-transform"></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
