import React, { useState, useEffect } from 'react';
import { db, auth } from '../../config/firebase';
import { collection, query, where, getDocs, doc, writeBatch, serverTimestamp, onSnapshot } from 'firebase/firestore';
import AdminLayout from '../../components/admin/AdminLayout';
import { findBestVolunteersForTask } from '../../services/aiMatching';
import VolunteerProfileCard from '../../components/admin/VolunteerProfileCard';
import { Flame, CheckCircle2, Eye, X, Users, AlertCircle } from 'lucide-react';

export default function SmartMatching() {
  const [openTasks, setOpenTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [volunteers, setVolunteers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [viewingVolunteer, setViewingVolunteer] = useState(null);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'tasks'),
      where('ngoId', '==', auth.currentUser.uid),
      where('status', '==', 'open')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOpenTasks(tasksData);
      setLoadingTasks(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchVolunteers = async () => {
      try {
        const usersSnap = await getDocs(query(collection(db, 'users'), where('role', '==', 'Volunteer')));
        const usersData = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        setVolunteers(usersData);
      } catch (error) {
        console.error("Error fetching volunteers:", error);
      }
    };
    fetchVolunteers();
  }, []);

  useEffect(() => {
    if (!selectedTask || volunteers.length === 0) {
      setMatches([]);
      return;
    }

    const runAiMatching = async () => {
      setLoadingMatches(true);
      try {
        const aiMatches = await findBestVolunteersForTask(selectedTask, volunteers);
        
        const taskSkills = selectedTask.requiredSkills || [];
        
        const finalMatches = volunteers.map(vol => {
          const aiResult = aiMatches.find(m => m.volunteerId === vol.id);
          const volSkills = vol.skills || [];
          
          return {
            ...vol,
            overlapSkills: taskSkills.filter(skill => volSkills.includes(skill)),
            matchPercentage: aiResult ? aiResult.matchScore : 0,
            reasoning: aiResult ? aiResult.reasoning : "Alternative Volunteer: Has different skills and availability."
          };
        }).sort((a, b) => b.matchPercentage - a.matchPercentage);

        setMatches(finalMatches);
      } catch (error) {
        console.error("NGO AI Matching failed:", error);
      } finally {
        setLoadingMatches(false);
      }
    };

    runAiMatching();
  }, [selectedTask, volunteers]);

  const handleAssign = async (volunteerId) => {
    if (!selectedTask) return;
    setAssigning(true);

    try {
      const batch = writeBatch(db);
      
      const taskRef = doc(db, 'tasks', selectedTask.id);
      batch.update(taskRef, { 
        status: 'assigned',
        assignedVolunteerId: volunteerId
      });

      const appRef = doc(collection(db, 'applications'));
      batch.set(appRef, {
        taskId: selectedTask.id,
        volunteerId: volunteerId,
        status: 'assigned',
        assignedAt: serverTimestamp()
      });

      await batch.commit();
      
      alert("Task successfully assigned!");
      setSelectedTask(null);
    } catch (error) {
      console.error("Error assigning task:", error);
      alert("Failed to assign task.");
    } finally {
      setAssigning(false);
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)] gap-6 p-6">
        {/* Left Column - Tasks */}
        <div className="w-full lg:w-1/3 flex flex-col bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm transition-colors duration-200">
          <div className="p-5 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Open Tasks</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Select a task to find matches</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {loadingTasks ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
                <span className="text-xs font-medium">Loading tasks...</span>
              </div>
            ) : openTasks.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-sm text-slate-400">No open tasks</p>
              </div>
            ) : (
              openTasks.map(task => (
                <button
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className={`w-full text-left p-4 rounded-lg transition-colors duration-200 border ${
                    selectedTask?.id === task.id
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-slate-600 text-slate-900 dark:text-white shadow-sm'
                  }`}
                >
                  <h3 className={`text-sm font-semibold mb-1 ${selectedTask?.id === task.id ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{task.taskName}</h3>
                  <p className={`text-xs mb-3 ${selectedTask?.id === task.id ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'}`}>{task.location}</p>
                  <div className="flex flex-wrap gap-1">
                    {task.requiredSkills?.map(skill => (
                      <span key={skill} className={`px-2 py-0.5 text-[10px] font-medium rounded border transition-colors ${
                        selectedTask?.id === task.id
                          ? 'bg-white/20 text-white border-white/30'
                          : 'bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600'
                      }`}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Column - Matches */}
        <div className="w-full lg:w-2/3 flex flex-col bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm transition-colors duration-200">
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">AI Smart Match</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                {selectedTask ? `Finding best fit for: ${selectedTask.taskName}` : 'Select a task to begin analysis'}
              </p>
            </div>
            {selectedTask && (
              <span className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-medium">
                {selectedTask.requiredSkills?.length} Skills Required
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {!selectedTask ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center border border-slate-200 dark:border-slate-700">
                  <Flame size={28} className="opacity-30" />
                </div>
                <div className="text-center">
                  <p className="text-base font-semibold text-slate-900 dark:text-white mb-1">Select a task</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Gemini will scan volunteer availability and skillsets</p>
                </div>
              </div>
            ) : loadingMatches ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4">
                <div className="animate-spin rounded-full h-10 w-10 border-3 border-slate-200 dark:border-slate-700 border-t-blue-600"></div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">Analyzing volunteers...</p>
              </div>
            ) : matches.length === 0 ? (
              <div className="text-center py-16 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <p className="text-lg font-semibold text-slate-900 dark:text-white mb-1">No matches found</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Consider relaxing skill requirements or check new signups.</p>
              </div>
            ) : (
              <div className="space-y-12">
                {/* High Match Volunteers */}
                {matches.filter(m => m.matchPercentage > 0).length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 px-1">
                      <div className="p-1 bg-green-100 dark:bg-green-900/30 text-green-600 rounded">
                        <CheckCircle2 size={16} />
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Top Smart Matches</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {matches.filter(m => m.matchPercentage > 0).map(match => (
                        <VolunteerMatchCard 
                          key={match.id} 
                          match={match} 
                          onAssign={handleAssign} 
                          onView={() => setViewingVolunteer(match)}
                          assigning={assigning}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Other Available Volunteers */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 px-1">
                    <div className="p-1 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded">
                      <Users size={16} />
                    </div>
                    <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Other Available Volunteers</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-80 hover:opacity-100 transition-opacity">
                    {matches.filter(m => m.matchPercentage === 0).length > 0 ? (
                      matches.filter(m => m.matchPercentage === 0).map(match => (
                        <VolunteerMatchCard 
                          key={match.id} 
                          match={match} 
                          onAssign={handleAssign} 
                          onView={() => setViewingVolunteer(match)}
                          assigning={assigning}
                          isMismatched={true}
                        />
                      ))
                    ) : (
                      <div className="col-span-2 py-8 text-center bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                        <p className="text-xs text-slate-400">No other volunteers found</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Volunteer Profile Modal */}
      {viewingVolunteer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto relative animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setViewingVolunteer(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-colors"
            >
              <X size={24} />
            </button>
            <VolunteerProfileCard volunteer={viewingVolunteer} />
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

function VolunteerMatchCard({ match, onAssign, onView, assigning, isMismatched = false }) {
  return (
    <div className={`bg-white dark:bg-slate-800 border ${isMismatched ? 'border-slate-200 dark:border-slate-800 bg-slate-50/30' : 'border-slate-200 dark:border-slate-700 shadow-sm'} p-5 rounded-xl flex flex-col hover:shadow-md transition-all duration-200 relative overflow-hidden group`}>
      
      {/* Match Score Badge */}
      <div className={`absolute top-0 right-0 ${isMismatched ? 'bg-slate-400' : 'bg-green-600'} text-white text-[10px] font-semibold px-3 py-1 rounded-bl-lg flex items-center gap-1`}>
        {isMismatched ? <AlertCircle size={11} /> : <Flame size={11} />}
        {match.matchPercentage}% Match
      </div>

      <div className="mb-4">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          {match.name}
          {!isMismatched && match.matchPercentage > 85 && <CheckCircle2 size={16} className="text-green-500" />}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{match.phone || 'Contact via Profile'}</p>
      </div>

      <div className="flex-1 space-y-4">
        {!isMismatched && (
          <div>
            <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-wide">Matching Skills</p>
            <div className="flex flex-wrap gap-1.5">
              {match.overlapSkills?.map(skill => (
                <span key={skill} className="px-2 py-0.5 rounded text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className={`p-3 rounded-lg border-l-3 ${isMismatched ? 'bg-slate-100 dark:bg-slate-900 border-slate-400' : 'bg-slate-50 dark:bg-slate-900 border-green-500'}`}>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed italic">
            "{match.reasoning}"
          </p>
        </div>
      </div>

      <div className="mt-5 flex gap-2">
        <button
          onClick={onView}
          className="flex-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold py-2.5 rounded-lg transition-colors text-xs flex items-center justify-center gap-2"
        >
          <Eye size={14} /> View Profile
        </button>
        <button
          onClick={() => onAssign(match.id)}
          disabled={assigning}
          className="flex-[1.5] bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg transition-colors text-xs shadow-sm active:scale-95 disabled:opacity-50"
        >
          {assigning ? 'Assigning...' : 'Assign Task'}
        </button>
      </div>
    </div>
  );
}
