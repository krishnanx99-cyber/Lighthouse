import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../../config/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { useTheme } from '../../context/ThemeContext';
import BottomNav from '../../components/hub/BottomNav';
import AvailabilitySettings from '../../components/hub/AvailabilitySettings';
import { Sun, Moon, Check, MapPin, Phone, User, Wrench, Heart, Save, LogOut, Clock } from 'lucide-react';
import { signOut } from 'firebase/auth';

const ALL_SKILLS = ['Medical', 'Teaching', 'Manual Labor', 'Logistics', 'Admin/IT', 'Counseling', 'Other'];

export default function Profile() {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    baseLocation: '',
    monthlyGoal: 10,
    skills: [],
    motivation: '',
    availability: {
      schedule: {},
      emergencyStandby: false
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!auth.currentUser) return;
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setFormData({
          name: data.name || '',
          phone: data.phone || '',
          baseLocation: data.baseLocation || '',
          monthlyGoal: data.monthlyGoal || 10,
          skills: data.skills || [],
          motivation: data.motivation || '',
          availability: data.availability || { schedule: {}, emergencyStandby: false }
        });
      }
      setLoadingProfile(false);
    };
    fetchProfile();
  }, []);

  const toggleSkill = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handleSave = async () => {
    setError('');
    setIsSubmitting(true);
    try {
      const uid = auth.currentUser.uid;
      // Convert monthlyGoal to number before saving
      const parsedGoal = parseInt(formData.monthlyGoal);
      if (isNaN(parsedGoal) || parsedGoal < 1) {
        setError("Goal must be at least 1 hour");
        setIsSubmitting(false);
        return;
      }
      const dataToSave = {
        ...formData,
        monthlyGoal: parsedGoal
      };
      await updateDoc(doc(db, 'users', uid), dataToSave);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving profile:", error);
      setError("Failed to save profile.");
    } finally {
      if (error === '') setIsSubmitting(false); // only reset if we didn't return early above
    }
  };

  const handleLogout = () => {
    signOut(auth).then(() => navigate('/'));
  };

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center transition-colors duration-200">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 transition-colors duration-200">
      {/* Profile Header */}
      <div className="bg-white dark:bg-slate-900 px-5 pt-12 pb-8 border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="flex justify-between items-start mb-6">
          <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-blue-500/20">
            {formData.name?.charAt(0) || 'V'}
          </div>
          <div className="flex gap-2">
            <button 
              onClick={toggleTheme}
              className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button 
              onClick={handleLogout}
              className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{formData.name || 'Volunteer'}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Ready to make an impact</p>
      </div>

      <main className="px-5 py-8 space-y-8 max-w-lg mx-auto">
        {/* Personal Info */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <User size={16} className="text-blue-600" />
            <h2 className="font-bold text-slate-900 dark:text-white uppercase text-[10px] tracking-widest">Personal Info</h2>
          </div>
          <div className="space-y-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
              <input
                type="text"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-colors"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Base Location</label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-colors"
                  value={formData.baseLocation}
                  onChange={(e) => setFormData({ ...formData, baseLocation: e.target.value })}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Impact Goals */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Save size={16} className="text-blue-600" />
            <h2 className="font-bold text-slate-900 dark:text-white uppercase text-[10px] tracking-widest">Impact Goals</h2>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Monthly Volunteering Goal (Hours)</label>
            <input
              type="number"
              min="1"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-colors"
              value={formData.monthlyGoal}
              onChange={(e) => setFormData({ ...formData, monthlyGoal: e.target.value })}
            />
            <p className="text-[10px] text-slate-400 mt-2 italic">Setting a goal helps us tailor your impact tracking on the dashboard.</p>
          </div>
        </section>

        {/* Contact */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Phone size={16} className="text-blue-600" />
            <h2 className="font-bold text-slate-900 dark:text-white uppercase text-[10px] tracking-widest">Contact</h2>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Phone Number</label>
            <input
              type="tel"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-colors"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
        </section>

        {/* Skills */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Wrench size={16} className="text-blue-600" />
            <h2 className="font-bold text-slate-900 dark:text-white uppercase text-[10px] tracking-widest">Skills</h2>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {ALL_SKILLS.map(skill => (
              <button
                key={skill}
                type="button"
                onClick={() => toggleSkill(skill)}
                className={`px-4 py-3 rounded-xl text-xs font-bold transition-all border ${
                  formData.skills.includes(skill)
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
        </section>

        {/* Motivation */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Heart size={16} className="text-blue-600" />
            <h2 className="font-bold text-slate-900 dark:text-white uppercase text-[10px] tracking-widest">Motivation</h2>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
            <textarea
              rows="4"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-colors resize-none"
              value={formData.motivation}
              onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
            />
          </div>
        </section>

        {/* Availability */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={16} className="text-blue-600" />
            <h2 className="font-bold text-slate-900 dark:text-white uppercase text-[10px] tracking-widest">Availability</h2>
          </div>
          <AvailabilitySettings 
            initialAvailability={formData.availability} 
            onSave={(newAvailability) => {
              setFormData(prev => ({ ...prev, availability: newAvailability }));
              // Optional: You could trigger the full save here, 
              // but I'll keep it unified for now as per user's "Save Profile Changes" flow.
              // Or better, let's just make the "Save Schedule" button update the state.
            }} 
          />
        </section>

        {/* Save Button */}
        <div className="relative">
          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : <><Save size={20} /> Save Profile Changes</>}
          </button>
          
          {error && (
            <div className="mt-3 text-red-500 text-sm font-bold text-center">
              {error}
            </div>
          )}
          
          {saveSuccess && (
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-green-500 text-white text-sm font-bold py-2 px-4 rounded-xl shadow-lg flex items-center gap-2 animate-in slide-in-from-bottom-2 fade-in">
              <Check size={16} />
              Profile saved successfully!
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
