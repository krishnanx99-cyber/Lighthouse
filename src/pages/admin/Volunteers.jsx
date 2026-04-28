import React, { useState, useEffect } from 'react';
import { db } from '../../config/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import AdminLayout from '../../components/admin/AdminLayout';
import { Search, UserCircle2, MessageSquare, Edit, X, Phone, Mail, MapPin, Award } from 'lucide-react';

const PREDEFINED_SKILLS = ['Medical', 'Teaching', 'Manual Labor', 'Logistics', 'Admin/IT', 'Counseling', 'Other'];

const VolunteerModal = ({ volunteer, isOpen, onClose }) => {
  if (!isOpen || !volunteer) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-500/20">
                {volunteer.name?.charAt(0) || 'V'}
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{volunteer.name || 'Anonymous Volunteer'}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Joined {new Date(volunteer.createdAt?.seconds * 1000).toLocaleDateString() || 'Recently'}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 transition-colors">
                <Mail size={18} className="text-blue-500" />
                <div className="overflow-hidden">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Address</p>
                  <p className="text-sm text-slate-900 dark:text-white font-medium truncate">{volunteer.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 transition-colors">
                <Phone size={18} className="text-green-500" />
                <div className="overflow-hidden">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phone Number</p>
                  <p className="text-sm text-slate-900 dark:text-white font-medium">{volunteer.phone || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 transition-colors">
                <MapPin size={18} className="text-red-500" />
                <div className="overflow-hidden">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Base Location</p>
                  <p className="text-sm text-slate-900 dark:text-white font-medium">{volunteer.baseLocation || 'Global'}</p>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <Award size={16} className="text-orange-500" />
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Expertise & Skills</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {volunteer.skills?.map((skill, i) => (
                  <span key={i} className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-bold border border-blue-100 dark:border-blue-800/50">
                    {skill}
                  </span>
                )) || <span className="text-xs text-slate-500 italic">No specific skills listed.</span>}
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]">
                Send Message
              </button>
              <button className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold py-3 px-4 rounded-xl transition-all active:scale-[0.98]">
                Assign Task
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Volunteers() {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSkill, setFilterSkill] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchVolunteers = async () => {
      try {
        const q = query(collection(db, 'users'), where('role', '==', 'Volunteer'));
        const snapshot = await getDocs(q);
        const vols = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setVolunteers(vols);
      } catch (error) {
        console.error("Error fetching volunteers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVolunteers();
  }, []);

  const handleOpenDetails = (vol) => {
    setSelectedVolunteer(vol);
    setIsModalOpen(true);
  };

  const filteredVolunteers = volunteers.filter(vol => {
    const matchesSearch = vol.name?.toLowerCase().includes(searchTerm.toLowerCase()) || vol.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSkill = filterSkill === 'All' || vol.skills?.includes(filterSkill);
    const isActive = (vol.hoursVolunteered || 0) > 0 || vol.activeStreak > 0;
    const matchesStatus = filterStatus === 'All' || (filterStatus === 'Active' && isActive) || (filterStatus === 'Inactive' && !isActive);
    return matchesSearch && matchesSkill && matchesStatus;
  });

  const totalVolunteers = volunteers.length;
  const activeVolunteers = volunteers.filter(v => (v.hoursVolunteered || 0) > 0 || v.activeStreak > 0).length;
  const totalHours = volunteers.reduce((acc, v) => acc + (v.hoursVolunteered || 0), 0);
  const avgHours = totalVolunteers > 0 ? (totalHours / totalVolunteers).toFixed(1) : 0;

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Volunteer Roster</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Manage your network of on-the-ground responders.</p>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search volunteers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-4 py-2 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-56 md:w-64 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors duration-200">
            <h3 className="text-slate-500 dark:text-slate-400 font-medium text-xs uppercase tracking-wide mb-1">Total Volunteers</h3>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{totalVolunteers}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors duration-200">
            <h3 className="text-slate-500 dark:text-slate-400 font-medium text-xs uppercase tracking-wide mb-1">Currently Active</h3>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{activeVolunteers}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors duration-200">
            <h3 className="text-slate-500 dark:text-slate-400 font-medium text-xs uppercase tracking-wide mb-1">Avg. Hours/Week</h3>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{avgHours}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-4">
          <select 
            value={filterSkill} 
            onChange={(e) => setFilterSkill(e.target.value)}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-700 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
          >
            <option value="All">All Skills</option>
            {PREDEFINED_SKILLS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-700 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
          >
            <option value="All">All Status</option>
            <option value="Active">Active Only</option>
            <option value="Inactive">Inactive Only</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm transition-colors duration-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                  <th className="px-6 py-3.5 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Volunteer Details</th>
                  <th className="px-6 py-3.5 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide hidden md:table-cell">Expertise</th>
                  <th className="px-6 py-3.5 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide hidden lg:table-cell">Impact</th>
                  <th className="px-6 py-3.5 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Status</th>
                  <th className="px-6 py-3.5 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                      <div className="flex items-center justify-center gap-3">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                        Loading roster...
                      </div>
                    </td>
                  </tr>
                ) : filteredVolunteers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400 text-sm">
                      No matching volunteers found.
                    </td>
                  </tr>
                ) : (
                  filteredVolunteers.map((vol) => (
                    <tr key={vol.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                            <UserCircle2 className="text-slate-400 dark:text-slate-500" size={22} />
                          </div>
                          <div>
                            <div className="font-medium text-slate-900 dark:text-white text-sm">{vol.name || 'Anonymous'}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">{vol.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {vol.skills && vol.skills.slice(0, 2).map((skill, i) => (
                            <span key={i} className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800">
                              {skill}
                            </span>
                          ))}
                          {vol.skills?.length > 2 && (
                            <span className="text-[10px] text-slate-400 font-medium self-center">+{vol.skills.length - 2}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-slate-900 dark:text-white">{vol.hoursVolunteered || 0}h</span>
                          <span className="text-xs text-slate-400 dark:text-slate-500">Total Hours</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {((vol.hoursVolunteered || 0) > 0 || vol.activeStreak > 0) ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2.5 py-1 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-600 dark:bg-green-500 animate-pulse"></span>
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-full">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button 
                            onClick={() => handleOpenDetails(vol)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          >
                            <MessageSquare size={16} />
                          </button>
                          <button 
                            onClick={() => handleOpenDetails(vol)}
                            className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                          >
                            <Edit size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <VolunteerModal 
        volunteer={selectedVolunteer} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </AdminLayout>
  );
}
