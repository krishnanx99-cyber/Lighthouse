import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../../config/firebase';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import BottomNav from '../../components/hub/BottomNav';
import { LogOut, ArrowRight, MapPin, Clock, Flame, Target, Sun, Moon, Menu, Bell, Calendar, Heart, ChevronRight } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { calculateDistance, convertLocationToCoords } from '../../utils/mapUtils';
import { calculateSmartMatches } from '../../services/aiMatching';
import { useTheme } from '../../context/ThemeContext';

export default function HubDashboard() {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const [openTasks, setOpenTasks] = useState([]);
  const [activeTasks, setActiveTasks] = useState([]);
  const [historyTasks, setHistoryTasks] = useState([]);
  const [userData, setUserData] = useState(null);
  const [smartMatches, setSmartMatches] = useState({});
  const [loading, setLoading] = useState(true);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [newGoal, setNewGoal] = useState('10');

  useEffect(() => {
    if (!auth.currentUser) return;

    // Fetch user profile
    const fetchProfile = async () => {
      const userSnap = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (userSnap.exists()) {
        const data = userSnap.data();
        setUserData(data);
        setNewGoal(data.monthlyGoal || '10');
      }
    };
    fetchProfile();

    // Listen to open tasks (for Recommended section)
    const openTasksQuery = query(
      collection(db, 'tasks'),
      where('status', '==', 'open')
    );

    const unsubscribeOpen = onSnapshot(openTasksQuery, async (snapshot) => {
      const tasksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOpenTasks(tasksData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching open tasks:", error);
      setLoading(false);
    });

    // Listen to MY assigned tasks (active + completed)
    const myTasksQuery = query(
      collection(db, 'tasks'),
      where('assignedVolunteerId', '==', auth.currentUser.uid)
    );

    const unsubscribeMy = onSnapshot(myTasksQuery, (snapshot) => {
      const all = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setActiveTasks(all.filter(t => t.status !== 'completed'));
      setHistoryTasks(all.filter(t => t.status === 'completed'));
    }, (error) => {
      console.error("Error fetching my tasks:", error);
    });

    return () => {
      unsubscribeOpen();
      unsubscribeMy();
    };
  }, []);

  // AI Matching Trigger
  useEffect(() => {
    const runAiMatching = async () => {
      if (userData && openTasks.length > 0) {
        const matches = await calculateSmartMatches(userData, openTasks);
        const matchMap = {};
        matches.forEach(m => {
          matchMap[m.taskId] = m;
        });
        setSmartMatches(matchMap);
      }
    };
    runAiMatching();
  }, [userData, openTasks]);

  const calculateMatchScore = (taskSkills, userSkills) => {
    if (!taskSkills || !userSkills) return 0;
    return taskSkills.filter(skill => userSkills.includes(skill)).length;
  };

  const getSortedOpenTasks = () => {
    if (!userData) return openTasks;
    const userCoords = convertLocationToCoords(userData.baseLocation);
    return [...openTasks].map(task => {
      const taskCoords = task.coordinates || convertLocationToCoords(task.location);
      const dist = calculateDistance(userCoords, taskCoords);
      return {
        ...task,
        matchScore: smartMatches[task.id]?.matchScore || calculateMatchScore(task.requiredSkills, userData.skills),
        reasoning: smartMatches[task.id]?.reasoning,
        distance: dist
      };
    }).sort((a, b) => {
      if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
      return (a.distance || 999) - (b.distance || 999);
    });
  };

  const sortedOpenTasks = getSortedOpenTasks();
  const handleLogout = () => signOut(auth);

  const formatTaskTime = (date) => {
    if (!date) return null;
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const handleUpdateGoal = async () => {
    const goalNum = parseInt(newGoal);
    if (isNaN(goalNum) || goalNum <= 0) return;

    try {
      const { updateDoc, doc: firestoreDoc } = await import('firebase/firestore');
      await updateDoc(firestoreDoc(db, 'users', auth.currentUser.uid), {
        monthlyGoal: goalNum
      });
      setUserData(prev => ({ ...prev, monthlyGoal: goalNum }));
      setIsEditingGoal(false);
    } catch (error) {
      console.error("Error updating goal:", error);
    }
  };

  // Goal logic
  const hours = userData?.hoursVolunteered || 0;
  const goalHours = userData?.monthlyGoal || 10;
  const progressPercent = Math.min((hours / goalHours) * 100, 100);
  
  const getMonthDeadline = () => {
    const today = new Date();
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return lastDay.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center transition-colors duration-200">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 transition-colors duration-200 font-sans">
      {/* App Header */}
      <nav className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 h-16 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div></div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <path d="M12 2l-2 2h4l-2-2z" />
              <path d="M11 4l-1 18h4l-1-18h-2z" />
              <path d="M10 10h4" />
            </svg>
          </div>
          <span className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Lighthouse</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={toggleTheme}
            className="p-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button 
            onClick={() => navigate('/hub/profile')}
            className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm border-2 border-white dark:border-slate-800 hover:scale-105 transition-transform"
          >
            {userData?.name?.charAt(0) || 'V'}
          </button>
        </div>
      </nav>

      <main className="px-5 pt-6 space-y-8 max-w-lg mx-auto">
        {/* Welcome Greeting */}
        <section>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white leading-tight">
            Welcome back,<br />
            {userData?.name?.split(' ')[0] || 'Volunteer'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Your impact is growing.</p>
        </section>

        {/* Monthly Goal Card */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors group relative">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Monthly Goal</p>
                {!isEditingGoal && (
                  <button 
                    onClick={() => setIsEditingGoal(true)}
                    className="p-1 text-slate-300 hover:text-blue-600 transition-colors"
                  >
                    <Target size={12} />
                  </button>
                )}
              </div>
              
              {isEditingGoal ? (
                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    value={newGoal}
                    onChange={(e) => setNewGoal(e.target.value)}
                    className="w-20 bg-slate-100 dark:bg-slate-800 border-none rounded-lg px-2 py-1 text-lg font-bold focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                    autoFocus
                  />
                  <button 
                    onClick={handleUpdateGoal}
                    className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-lg shadow-sm"
                  >
                    Save
                  </button>
                  <button 
                    onClick={() => {
                      setIsEditingGoal(false);
                      setNewGoal(userData?.monthlyGoal || '10');
                    }}
                    className="text-xs text-slate-400 font-bold"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{Math.round(progressPercent)}% Completed</h2>
              )}
            </div>
            <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold rounded-lg uppercase">
              By {getMonthDeadline()}
            </span>
          </div>
          <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 rounded-full transition-all duration-1000 ease-out" 
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
              <Clock size={20} />
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white leading-none mb-1">{hours}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Hours Volunteered</p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
            <div className="w-10 h-10 bg-orange-50 dark:bg-orange-900/30 rounded-xl flex items-center justify-center text-orange-600 dark:text-orange-400 mb-4">
              <Flame size={20} />
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white leading-none mb-1">{userData?.activeStreak || 0} Days</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Active Streak</p>
          </div>
        </section>

        {/* My Tasks Section */}
        <section>
          <div className="flex justify-between items-end mb-4">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">My Tasks</h3>
            <button onClick={() => navigate('/hub/history')} className="text-blue-600 dark:text-blue-400 text-sm font-bold flex items-center gap-1 hover:underline">
              View All <ChevronRight size={16} />
            </button>
          </div>
          
          {activeTasks.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl text-center border border-dashed border-slate-200 dark:border-slate-700">
              <p className="text-slate-400 text-sm">No active missions right now.</p>
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-4 -mx-1 px-1 scrollbar-hide snap-x">
              {activeTasks.map(task => (
                <div 
                  key={task.id} 
                  onClick={() => navigate(`/hub/task/${task.id}`)}
                  className="min-w-[240px] snap-start bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-500/50 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Task</span>
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 transition-colors">{task.taskName}</h4>
                  <div className="space-y-1.5">
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <MapPin size={12} className="shrink-0" />
                      <span className="truncate">{task.location}</span>
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-2">
                      <Clock size={12} className="shrink-0" />
                      {formatTaskTime(task.scheduledTime)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Recommended Section */}
        <section className="space-y-4">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Recommended For You</h3>
          
          {sortedOpenTasks.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 p-10 rounded-2xl text-center border border-slate-200 dark:border-slate-800 shadow-sm">
              <Heart size={32} className="mx-auto text-slate-200 dark:text-slate-800 mb-3" />
              <p className="text-slate-400 text-sm">No tasks available in your area yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedOpenTasks.slice(0, 5).map(task => (
                <div key={task.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all hover:shadow-md">
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          task.urgency === 'Immediate' ? 'bg-red-50 text-red-600 dark:bg-red-900/30' :
                          task.urgency === 'High' ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/30' :
                          'bg-blue-50 text-blue-600 dark:bg-blue-900/30'
                        }`}>
                          {task.urgency || 'Standard'} Urgency
                        </span>
                        {task.distance !== null && (
                          <span className="text-xs text-slate-400 font-medium">{task.distance} mi away</span>
                        )}
                      </div>
                      {task.matchScore > 0 && (
                        <div className="flex items-center gap-1 px-2 py-0.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-[10px] font-bold rounded-md">
                          <Flame size={10} />
                          {task.matchScore}% Match
                        </div>
                      )}
                    </div>

                    <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{task.taskName}</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                      {task.description || 'Join this mission to provide critical support in your area.'}
                    </p>

                    <button 
                      onClick={() => navigate(`/hub/task/${task.id}`)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all active:scale-95 shadow-sm text-sm"
                    >
                      Claim Task
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Check In Now Floating Action (Simulated) */}
        {activeTasks.some(t => t.status === 'claimed' || t.status === 'assigned') && (
          <div className="bg-green-600 text-white p-4 rounded-2xl flex items-center justify-center gap-2 font-bold shadow-lg shadow-green-600/20 active:scale-95 transition-all cursor-pointer">
            <Target size={18} />
            Check In Now
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
