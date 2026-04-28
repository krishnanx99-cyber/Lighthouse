import React from 'react';
import { Mail, Phone, MapPin, Wrench, ShieldAlert, Clock, Calendar } from 'lucide-react';

export default function VolunteerProfileCard({ volunteer }) {
  if (!volunteer) return null;

  const {
    name,
    skills = [],
    phone,
    email,
    baseLocation,
    availability = { schedule: {}, emergencyStandby: false }
  } = volunteer;

  const formatAvailability = (schedule) => {
    if (!schedule || Object.keys(schedule).length === 0) return 'No schedule set';
    
    return Object.entries(schedule)
      .filter(([_, slots]) => slots.length > 0)
      .map(([day, slots]) => `${day.substring(0, 3)}: ${slots.join(', ')}`)
      .join(' | ');
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden transition-all duration-300">
      {/* Header with Background Color */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white relative">
        <div className="flex justify-between items-start">
          <div className="flex gap-6 items-center">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-3xl font-bold border border-white/30">
              {name?.charAt(0) || 'V'}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-bold">{name}</h2>
                {availability.emergencyStandby && (
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-400 text-amber-950 text-[10px] font-black uppercase tracking-tighter rounded-full shadow-lg shadow-amber-400/20 animate-bounce">
                    <ShieldAlert size={12} />
                    Emergency Standby
                  </span>
                )}
              </div>
              <p className="text-blue-100 font-medium flex items-center gap-2 mt-1">
                <MapPin size={14} />
                {baseLocation || 'Location not specified'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-8">
        {/* Contact Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 transition-colors">
            <div className="p-2 bg-white dark:bg-slate-800 rounded-lg text-blue-600 shadow-sm">
              <Mail size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Address</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{email || 'Not provided'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 transition-colors">
            <div className="p-2 bg-white dark:bg-slate-800 rounded-lg text-green-600 shadow-sm">
              <Phone size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phone Number</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{phone || 'Not provided'}</p>
            </div>
          </div>
        </div>

        {/* Skills Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Wrench size={16} className="text-blue-600" />
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Primary Skills</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {skills.length > 0 ? (
              skills.map(skill => (
                <span key={skill} className="px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-xl border border-blue-100 dark:border-blue-800/50">
                  {skill}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400 italic">No skills listed</span>
            )}
          </div>
        </div>

        {/* Availability Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-blue-600" />
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Weekly Availability</h3>
          </div>
          
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
            {Object.keys(availability.schedule || {}).length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(availability.schedule).map(([day, slots]) => (
                  slots.length > 0 && (
                    <div key={day} className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{day}</span>
                      <div className="flex flex-wrap gap-1">
                        {slots.map(slot => (
                          <span key={slot} className="px-2 py-0.5 bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 text-[10px] font-bold rounded-md border border-slate-200 dark:border-slate-700 shadow-sm">
                            {slot}
                          </span>
                        ))}
                      </div>
                    </div>
                  )
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic text-center py-2">No specific schedule set</p>
            )}
          </div>

          {availability.emergencyStandby && (
            <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-2xl flex items-center gap-3">
              <ShieldAlert className="text-amber-500 shrink-0" size={20} />
              <p className="text-xs font-bold text-amber-700 dark:text-amber-400">
                This volunteer is on 24/7 Emergency Standby and can be contacted for immediate needs.
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="pt-4 flex gap-3">
          <a
            href={`mailto:${email}`}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center font-bold py-3.5 rounded-2xl transition-all shadow-lg shadow-blue-500/25 active:scale-95"
          >
            Send Email
          </a>
          {phone && (
            <a
              href={`tel:${phone}`}
              className="flex-1 bg-white dark:bg-slate-800 border-2 border-blue-600 text-blue-600 dark:text-blue-400 text-center font-bold py-3.5 rounded-2xl transition-all active:scale-95"
            >
              Call Now
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
