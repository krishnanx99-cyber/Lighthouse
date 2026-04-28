import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../../config/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, ArrowLeft, ArrowRight, Check, MapPin, Phone, User, Wrench, Heart } from 'lucide-react';

const ALL_SKILLS = ['Medical', 'Teaching', 'Manual Labor', 'Logistics', 'Admin/IT', 'Counseling', 'Other'];

export default function Onboarding() {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    baseLocation: '',
    skills: [],
    motivation: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    const checkOnboarding = async () => {
      if (!auth.currentUser) return;
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (userDoc.exists() && userDoc.data().onboardingComplete) {
        navigate('/hub');
      }
      setLoadingProfile(false);
    };
    checkOnboarding();
  }, [navigate]);

  const steps = [
    { title: 'Personal Info', icon: <User size={20} />, description: 'Tell us about yourself' },
    { title: 'Contact', icon: <Phone size={20} />, description: 'How to reach you' },
    { title: 'Skills', icon: <Wrench size={20} />, description: 'What you can contribute' },
    { title: 'Motivation', icon: <Heart size={20} />, description: 'Why you want to help' }
  ];

  const toggleSkill = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handleSubmit = async () => {
    setError('');
    if (!formData.name || !formData.phone || formData.skills.length === 0) {
      setError("Please complete all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const uid = auth.currentUser.uid;
      await updateDoc(doc(db, 'users', uid), {
        ...formData,
        onboardingComplete: true,
        hoursVolunteered: 0,
        tasksCompleted: 0,
        activeStreak: 0,
      });
      // Small delay to ensure state settles before navigating
      setTimeout(() => {
        navigate('/hub', { replace: true });
      }, 300);
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center transition-colors duration-200">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col items-center justify-center p-4 transition-colors duration-200">
      <div className="absolute top-6 right-6">
        <button 
          onClick={toggleTheme}
          className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Complete Your Profile</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Step {step + 1} of {steps.length}: {steps[step].description}</p>
        </div>

        {/* Progress Bar */}
        <div className="flex gap-2 mb-8">
          {steps.map((s, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                i <= step ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'
              }`}
            />
          ))}
        </div>

        {error && (
          <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm font-medium text-center">
            {error}
          </div>
        )}

        {/* Card */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-8 transition-colors duration-200">
          
          {/* Step 0: Personal Info */}
          {step === 0 && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <User size={20} />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Personal Info</h2>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Full Name</label>
                <input
                  type="text"
                  placeholder="Your full name"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-sm"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Base Location</label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Your city or area"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-10 pr-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-sm"
                    value={formData.baseLocation}
                    onChange={(e) => setFormData({ ...formData, baseLocation: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Contact */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Phone size={20} />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Contact Details</h2>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-sm"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* Step 2: Skills */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Wrench size={20} />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Your Skills</h2>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Select all skills you can contribute:</p>
              <div className="grid grid-cols-2 gap-2.5">
                {ALL_SKILLS.map(skill => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors border ${
                      formData.skills.includes(skill)
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-300 dark:hover:border-slate-600'
                    }`}
                  >
                    {formData.skills.includes(skill) && <Check size={14} className="inline mr-1.5" />}
                    {skill}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Motivation */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Heart size={20} />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Your Motivation</h2>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Why do you want to volunteer?</label>
                <textarea
                  rows="4"
                  placeholder="Share what drives you to make a difference..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-sm resize-none"
                  value={formData.motivation}
                  onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            {step > 0 && (
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setStep(s => s - 1);
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm"
              >
                <ArrowLeft size={16} />
                Back
              </button>
            )}
            {step < steps.length - 1 ? (
              <button
                type="button"
                onClick={() => {
                  setError('');
                  if (step === 0 && (!formData.name.trim() || !formData.baseLocation.trim())) {
                    setError("Please fill in your Full Name and Base Location.");
                    return;
                  }
                  if (step === 1 && !formData.phone.trim()) {
                    setError("Please fill in your Phone Number.");
                    return;
                  }
                  setStep(s => s + 1);
                }}
                className="flex-[2] flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors shadow-sm active:scale-95 text-sm"
              >
                Continue
                <ArrowRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors shadow-sm active:scale-95 disabled:opacity-50 text-sm"
              >
                {isSubmitting ? 'Saving...' : 'Complete Profile'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
