import React, { useState, useEffect } from 'react';
import { Clock, ShieldAlert, Save } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIME_SLOTS = ['Morning', 'Afternoon', 'Evening'];

export default function AvailabilitySettings({ initialAvailability = {}, onSave }) {
  const [availability, setAvailability] = useState(initialAvailability?.schedule || {});
  const [emergencyStandby, setEmergencyStandby] = useState(initialAvailability?.emergencyStandby || false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (initialAvailability?.schedule) {
      setAvailability(initialAvailability.schedule);
    }
    if (initialAvailability?.emergencyStandby !== undefined) {
      setEmergencyStandby(initialAvailability.emergencyStandby);
    }
  }, [initialAvailability]);

  const toggleSlot = (day, slot) => {
    setAvailability(prev => {
      const daySlots = prev[day] || [];
      const updatedSlots = daySlots.includes(slot)
        ? daySlots.filter(s => s !== slot)
        : [...daySlots, slot];
      
      return {
        ...prev,
        [day]: updatedSlots
      };
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave({
        schedule: availability,
        emergencyStandby
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Emergency Standby Toggle */}
      <div className={`p-5 rounded-2xl border-2 transition-all duration-300 flex items-center justify-between ${
        emergencyStandby 
          ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-500 shadow-lg shadow-amber-500/10' 
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
      }`}>
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${emergencyStandby ? 'bg-amber-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
            <ShieldAlert size={24} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">24/7 Emergency Standby</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Ready for immediate response tasks</p>
          </div>
        </div>
        <button
          onClick={() => setEmergencyStandby(!emergencyStandby)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
            emergencyStandby ? 'bg-amber-500' : 'bg-slate-200 dark:bg-slate-700'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              emergencyStandby ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Weekly Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center gap-2">
          <Clock size={16} className="text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Weekly Schedule</h3>
        </div>
        
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {DAYS.map(day => (
            <div key={day} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300 w-24">{day}</span>
              <div className="flex gap-2">
                {TIME_SLOTS.map(slot => {
                  const isSelected = availability[day]?.includes(slot);
                  return (
                    <button
                      key={slot}
                      onClick={() => toggleSlot(day, slot)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-blue-300'
                      }`}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={isSaving}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
      >
        {isSaving ? 'Saving...' : <><Save size={20} /> Save Schedule</>}
      </button>
    </div>
  );
}
