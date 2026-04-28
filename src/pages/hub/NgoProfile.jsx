import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../config/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import BottomNav from '../../components/hub/BottomNav';
import { useTheme } from '../../context/ThemeContext';
import { ArrowLeft, Building2, MapPin, Globe, Phone, Mail, ChevronRight, Sun, Moon, Calendar } from 'lucide-react';

export default function NgoProfile() {
  const { ngoId } = useParams();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  
  const [ngo, setNgo] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNgoData = async () => {
      setLoading(true);
      try {
        // Fetch NGO Profile
        const ngoDoc = await getDoc(doc(db, 'users', ngoId));
        if (ngoDoc.exists() && ngoDoc.data().role === 'NGO') {
          setNgo({ id: ngoDoc.id, ...ngoDoc.data() });
        } else {
          alert("Organization not found.");
          navigate('/hub');
          return;
        }

        // Fetch Tasks by NGO
        const q = query(
          collection(db, 'tasks'),
          where('ngoId', '==', ngoId),
          where('status', 'in', ['open', 'assigned', 'claimed'])
        );
        const taskSnap = await getDocs(q);
        const activeTasks = taskSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        // Sort by created at descending
        activeTasks.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
        setTasks(activeTasks);

      } catch (error) {
        console.error("Error fetching NGO details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (ngoId) {
      fetchNgoData();
    }
  }, [ngoId, navigate]);

  const formatDate = (date) => {
    if (!date) return 'No date set';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleString('en-US', { 
      weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center transition-colors duration-200">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!ngo) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 transition-colors duration-200">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 z-50 transition-colors duration-200">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">Organization</h1>
        </div>
        <button 
          onClick={toggleTheme}
          className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </header>

      <div className="max-w-xl mx-auto p-6 space-y-6">
        
        {/* NGO Info Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm relative overflow-hidden transition-colors duration-200">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
          
          <div className="flex items-start gap-4 mb-6 pt-2">
            <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
              <Building2 size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{ngo.name}</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Registered NGO</p>
            </div>
          </div>

          <div className="space-y-4">
            {ngo.description && (
              <div>
                <h3 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">About Us</h3>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {ngo.description}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              {ngo.address && (
                <div className="flex items-start gap-3">
                  <MapPin size={16} className="text-slate-400 mt-0.5 shrink-0" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">{ngo.address}</span>
                </div>
              )}
              {ngo.website && (
                <div className="flex items-center gap-3">
                  <Globe size={16} className="text-slate-400 shrink-0" />
                  <a href={ngo.website.startsWith('http') ? ngo.website : `https://${ngo.website}`} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 dark:text-blue-400 hover:underline truncate">
                    {ngo.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
              {ngo.email && (
                <div className="flex items-center gap-3">
                  <Mail size={16} className="text-slate-400 shrink-0" />
                  <a href={`mailto:${ngo.email}`} className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 truncate">
                    {ngo.email}
                  </a>
                </div>
              )}
              {ngo.phone && (
                <div className="flex items-center gap-3">
                  <Phone size={16} className="text-slate-400 shrink-0" />
                  <a href={`tel:${ngo.phone}`} className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 truncate">
                    {ngo.phone}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Active Tasks Section */}
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 px-1 flex items-center justify-between">
            <span>Active Missions</span>
            <span className="text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-1 rounded-full">
              {tasks.length}
            </span>
          </h3>

          {tasks.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center transition-colors duration-200">
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar size={24} className="text-slate-400" />
              </div>
              <p className="text-slate-600 dark:text-slate-400 font-medium">No active missions right now.</p>
              <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">Check back later for new opportunities to help.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map(task => (
                <button
                  key={task.id}
                  onClick={() => navigate(`/hub/task/${task.id}`)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-left hover:border-blue-300 dark:hover:border-blue-700 transition-all flex items-center justify-between group shadow-sm hover:shadow-md"
                >
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        task.urgency === 'Immediate' ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        task.urgency === 'High' ? 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                        'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {task.urgency}
                      </span>
                      {task.status !== 'open' && (
                        <span className="px-2 py-0.5 rounded bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 text-[10px] font-bold uppercase tracking-wider">
                          In Progress
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-slate-900 dark:text-white truncate">{task.taskName}</h4>
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <MapPin size={12} />
                        <span className="truncate max-w-[120px]">{task.location}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {formatDate(task.scheduledTime)}
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-slate-400 group-hover:text-blue-500 transition-colors shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
