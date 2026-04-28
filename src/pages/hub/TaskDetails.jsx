import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, auth } from '../../config/firebase';
import { doc, getDoc, updateDoc, serverTimestamp, increment, collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { defaultCenter, darkMapStyle } from '../../utils/mapUtils';
import BottomNav from '../../components/hub/BottomNav';
import { useTheme } from '../../context/ThemeContext';
import { ArrowLeft, MapPin, Clock, User, CheckCircle, LogIn, FileCheck, Sun, Moon, Navigation, Info, Building2, ChevronRight } from 'lucide-react';

const mapContainerStyle = {
  width: '100%',
  height: '200px',
  borderRadius: '0.75rem'
};

export default function TaskDetails() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const [task, setTask] = useState(null);
  const [ngo, setNgo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const { isLoaded: mapLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  useEffect(() => {
    const fetchTaskAndNgo = async () => {
      try {
        const taskDoc = await getDoc(doc(db, 'tasks', taskId));
        if (taskDoc.exists()) {
          const taskData = { id: taskDoc.id, ...taskDoc.data() };
          setTask(taskData);

          // Fetch NGO details
          if (taskData.ngoId) {
            const ngoDoc = await getDoc(doc(db, 'users', taskData.ngoId));
            if (ngoDoc.exists()) {
              setNgo({ id: ngoDoc.id, ...ngoDoc.data() });
            }
          }
        } else {
          alert("Task not found.");
          navigate('/hub');
        }
      } catch (error) {
        console.error("Error fetching task/ngo:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTaskAndNgo();
  }, [taskId, navigate]);

  const handleClaim = async () => {
    setActionLoading(true);
    try {
      const currentUser = auth.currentUser;
      
      // Check for existing application
      const applicationsQuery = query(
        collection(db, 'applications'),
        where('taskId', '==', task.id),
        where('volunteerId', '==', currentUser.uid)
      );
      const existingApps = await getDocs(applicationsQuery);
      
      if (!existingApps.empty) {
        alert("You have already applied for this task.");
        setActionLoading(false);
        return;
      }

      // Create application
      await addDoc(collection(db, 'applications'), {
        taskId: task.id,
        volunteerId: currentUser.uid,
        status: 'claimed',
        claimedAt: serverTimestamp()
      });

      // Update task status
      await updateDoc(doc(db, 'tasks', task.id), {
        status: 'claimed',
        assignedVolunteerId: currentUser.uid
      });

      setTask(prev => ({ ...prev, status: 'claimed', assignedVolunteerId: currentUser.uid }));
    } catch (error) {
      console.error("Error claiming task:", error);
      alert("Failed to claim task.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckIn = async () => {
    setActionLoading(true);
    try {
      await updateDoc(doc(db, 'tasks', task.id), { status: 'checked-in' });
      setTask(prev => ({ ...prev, status: 'checked-in' }));
    } catch (error) {
      console.error("Error checking in:", error);
      alert("Failed to check in.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async () => {
    setActionLoading(true);
    try {
      const userId = auth.currentUser.uid;
      await updateDoc(doc(db, 'tasks', task.id), { status: 'completed' });
      await updateDoc(doc(db, 'users', userId), {
        tasksCompleted: increment(1),
        hoursVolunteered: increment(task.estimatedDuration || 1),
        activeStreak: increment(1)
      });
      setTask(prev => ({ ...prev, status: 'completed' }));
    } catch (error) {
      console.error("Error completing task:", error);
      alert("Failed to complete task.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleGetDirections = () => {
    if (!task?.coordinates) return;
    const { lat, lng } = task.coordinates;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
  };

  const formatDate = (date) => {
    if (!date) return 'No date set';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleString('en-US', { 
      weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center transition-colors duration-200">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!task) return null;

  const isMyTask = task.assignedVolunteerId === auth.currentUser?.uid;
  const canClaim = task.status === 'open';
  const canCheckIn = isMyTask && (task.status === 'assigned' || task.status === 'claimed');
  const canComplete = isMyTask && task.status === 'checked-in';
  const isCompleted = task.status === 'completed';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 transition-colors duration-200">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 z-50 transition-colors duration-200">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/hub')}
            className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">Mission Details</h1>
        </div>
        <button 
          onClick={toggleTheme}
          className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </header>

      <div className="p-6 max-w-lg mx-auto space-y-6">
        {/* Map */}
        {mapLoaded && task.coordinates && (
          <div className="space-y-3">
            <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm transition-colors duration-200">
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={task.coordinates}
                zoom={14}
                options={{
                  styles: isDark ? darkMapStyle : [],
                  disableDefaultUI: true,
                  zoomControl: true
                }}
              >
                <Marker position={task.coordinates} />
              </GoogleMap>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
              <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                <Info size={14} className="text-blue-600 dark:text-blue-400 shrink-0" />
                <span>Note: Laptops may not have GPS; your location and distance are approximate.</span>
              </div>
              
              <button
                onClick={handleGetDirections}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-semibold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-all active:scale-95 whitespace-nowrap"
              >
                <Navigation size={16} className="text-blue-600 dark:text-blue-400" />
                Get Directions
              </button>
            </div>
          </div>
        )}

        {/* NGO Card */}
        {ngo && (
          <button
            onClick={() => navigate(`/hub/ngo/${ngo.id}`)}
            className="w-full bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-4 flex items-center justify-between group transition-all hover:border-blue-300 dark:hover:border-blue-700 active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                <Building2 size={24} />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Organized By</p>
                <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {ngo.name}
                </h3>
              </div>
            </div>
            <ChevronRight size={20} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
          </button>
        )}

        {/* Task Info */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 transition-colors duration-200">
          <div className="flex items-center gap-2 mb-4">
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
              task.status === 'open' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
              task.status === 'completed' ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
              task.status === 'checked-in' ? 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
              'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
            }`}>
              {task.status === 'checked-in' ? 'Active' : task.status}
            </span>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
              task.urgency === 'Immediate' ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
              task.urgency === 'High' ? 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
              'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
            }`}>
              {task.urgency}
            </span>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{task.taskName}</h2>
          
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-400">
              <MapPin size={16} className="text-blue-600 dark:text-blue-400 shrink-0" />
              {task.location}
            </div>
            <div className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-400">
              <Clock size={16} className="text-blue-600 dark:text-blue-400 shrink-0" />
              {formatDate(task.scheduledTime)} • {task.estimatedDuration || 0}h Est.
            </div>
            {task.assignedVolunteerId && (
              <div className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-400">
                <User size={16} className="text-blue-600 dark:text-blue-400 shrink-0" />
                {isMyTask ? 'Assigned to you' : 'Assigned to another volunteer'}
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 dark:border-slate-700 pt-4 mb-4">
            <h3 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Description</h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{task.description}</p>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-700 pt-4">
            <h3 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">Required Skills</h3>
            <div className="flex flex-wrap gap-2">
              {task.requiredSkills?.map((skill, i) => (
                <span key={i} className="px-3 py-1 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Action Button */}
        {!isCompleted && (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm transition-colors duration-200">
            {canClaim && (
              <button
                onClick={handleClaim}
                disabled={actionLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors shadow-sm active:scale-95 disabled:opacity-50 text-sm flex items-center justify-center gap-2"
              >
                <FileCheck size={18} />
                {actionLoading ? 'Claiming...' : 'Claim This Mission'}
              </button>
            )}
            {canCheckIn && (
              <button
                onClick={handleCheckIn}
                disabled={actionLoading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors shadow-sm active:scale-95 disabled:opacity-50 text-sm flex items-center justify-center gap-2"
              >
                <LogIn size={18} />
                {actionLoading ? 'Checking In...' : 'Check In'}
              </button>
            )}
            {canComplete && (
              <button
                onClick={handleComplete}
                disabled={actionLoading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors shadow-sm active:scale-95 disabled:opacity-50 text-sm flex items-center justify-center gap-2"
              >
                <CheckCircle size={18} />
                {actionLoading ? 'Completing...' : 'Mark Complete'}
              </button>
            )}
          </div>
        )}

        {isCompleted && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 text-center shadow-sm">
            <CheckCircle size={40} className="text-green-600 dark:text-green-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-green-800 dark:text-green-300 mb-1">Mission Complete</h3>
            <p className="text-sm text-green-600 dark:text-green-400">Great work! Your hours have been logged.</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
