import React, { useEffect, useState } from 'react';
import { db, auth } from '../../config/firebase';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';

const AssignedUserCell = ({ volunteerId, status }) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'open' || !volunteerId) {
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', volunteerId));
        if (userDoc.exists()) {
          setName(userDoc.data().name || userDoc.data().displayName || 'Unknown User');
        } else {
          setName('Unknown User');
        }
      } catch (error) {
        console.error("Error fetching volunteer name:", error);
        setName('Unknown User');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [volunteerId, status]);

  if (status === 'open' || !volunteerId) {
    return <span className="text-xs text-slate-400 italic">Unassigned</span>;
  }

  if (loading) {
    return <span className="text-xs text-slate-400 italic">Loading...</span>;
  }

  return (
    <span className="text-sm font-medium text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-md border border-slate-200 dark:border-slate-600">
      {name}
    </span>
  );
};

const getUrgencyBadge = (urgency) => {
  const styles = {
    'Immediate': 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
    'High': 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400',
    'Medium': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400',
    'Low': 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
  };
  return styles[urgency] || 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400';
};

const getStatusBadge = (status) => {
  switch (status) {
    case 'open':
      return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">Open</span>;
    case 'assigned':
    case 'claimed':
      return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400 capitalize">{status}</span>;
    case 'checked-in':
      return (
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400">
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-600 dark:bg-yellow-400 animate-pulse"></span>
          Checked In
        </span>
      );
    case 'completed':
      return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400">Completed</span>;
    default:
      return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400 capitalize">{status}</span>;
  }
};

export default function TasksTable() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'tasks'),
      where('ngoId', '==', auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      const statusWeight = {
        'checked-in': 1,
        'assigned': 2,
        'claimed': 2,
        'open': 3,
        'completed': 4
      };

      tasksData.sort((a, b) => {
        const weightA = statusWeight[a.status] || 5;
        const weightB = statusWeight[b.status] || 5;
        if (weightA !== weightB) return weightA - weightB;
        if (!a.createdAt || !b.createdAt) return 0;
        return b.createdAt.toMillis() - a.createdAt.toMillis();
      });
      
      setTasks(tasksData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching tasks:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 p-12 rounded-xl text-center flex flex-col items-center border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
          <svg className="w-7 h-7 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No tasks found</h3>
        <p className="text-slate-500 dark:text-slate-400 max-w-sm text-sm">You haven't posted any tasks yet. Click "Deploy Mission" to create your first task and start finding volunteers.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              <th className="px-6 py-3.5">Task Name</th>
              <th className="px-6 py-3.5 hidden md:table-cell">Location</th>
              <th className="px-6 py-3.5">Urgency</th>
              <th className="px-6 py-3.5 hidden lg:table-cell">Required Skills</th>
              <th className="px-6 py-3.5">Status</th>
              <th className="px-6 py-3.5">Assigned To</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {tasks.map((task) => (
              <tr key={task.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="px-6 py-4">
                  <p className="text-slate-900 dark:text-white font-medium truncate max-w-[150px] md:max-w-xs">{task.taskName}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[150px] md:max-w-xs" title={task.description}>
                    {task.description}
                  </p>
                </td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-300 text-sm hidden md:table-cell">{task.location}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getUrgencyBadge(task.urgency)}`}>
                    {task.urgency}
                  </span>
                </td>
                <td className="px-6 py-4 hidden lg:table-cell">
                  <div className="flex flex-wrap gap-1.5">
                    {task.requiredSkills?.slice(0, 2).map((skill, index) => (
                      <span key={index} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-[10px] text-slate-600 dark:text-slate-300 font-medium">
                        {skill}
                      </span>
                    ))}
                    {task.requiredSkills?.length > 2 && (
                      <span className="text-[10px] text-slate-400">+{task.requiredSkills.length - 2}</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {getStatusBadge(task.status)}
                </td>
                <td className="px-6 py-4">
                  <AssignedUserCell volunteerId={task.assignedVolunteerId} status={task.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
