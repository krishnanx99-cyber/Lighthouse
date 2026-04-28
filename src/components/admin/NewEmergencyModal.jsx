import React, { useState } from 'react';
import { X, MapPin } from 'lucide-react';
import { db, auth } from '../../config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { defaultCenter, darkMapStyle } from '../../utils/mapUtils';
import { useTheme } from '../../context/ThemeContext';

const PREDEFINED_SKILLS = [
  'Medical', 'Teaching', 'Manual Labor', 'Logistics', 
  'Admin/IT', 'Counseling', 'Other'
];

const mapContainerStyle = {
  width: '100%',
  height: '220px',
  borderRadius: '0.75rem'
};

export default function NewEmergencyModal({ isOpen, onClose }) {
  const { isDark } = useTheme();
  const [taskName, setTaskName] = useState('');
  const [address, setAddress] = useState('');
  const [coordinates, setCoordinates] = useState(null);
  const [urgency, setUrgency] = useState('Medium');
  const [scheduledTime, setScheduledTime] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState('');
  const [description, setDescription] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  });

  if (!isOpen) return null;

  const toggleSkill = (skill) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const handleMapClick = async (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setCoordinates({ lat, lng });

    // Reverse geocode to get readable address
    try {
      const geocoder = new window.google.maps.Geocoder();
      const result = await geocoder.geocode({ location: { lat, lng } });
      if (result.results && result.results.length > 0) {
        setAddress(result.results[0].formatted_address);
      }
    } catch (err) {
      console.warn("Reverse geocoding failed:", err);
      setAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!taskName || !coordinates || selectedSkills.length === 0) {
      alert("Please fill all required fields, drop a pin on the map, and select at least one skill.");
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'tasks'), {
        taskName,
        location: address,
        coordinates,
        urgency,
        scheduledTime: scheduledTime ? new Date(scheduledTime) : null,
        estimatedDuration: Number(estimatedDuration) || 0,
        requiredSkills: selectedSkills,
        description,
        status: 'open',
        ngoId: auth.currentUser.uid,
        createdAt: serverTimestamp()
      });
      // Reset form and close
      setTaskName('');
      setAddress('');
      setCoordinates(null);
      setUrgency('Medium');
      setScheduledTime('');
      setEstimatedDuration('');
      setDescription('');
      setSelectedSkills([]);
      onClose();
    } catch (error) {
      console.error("Error creating task:", error);
      alert("Failed to create task.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden max-h-[95vh] flex flex-col">
        <div className="p-8 overflow-y-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <p className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-1">Command Center</p>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Deploy New Mission</h2>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Map Section */}
            <div className="space-y-3">
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-2">
                <MapPin size={14} className="text-blue-600" />
                Target Zone <span className="text-[10px] opacity-60">(Drop pin on map)</span>
              </label>
              {isLoaded ? (
                <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 h-[220px]">
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={coordinates || defaultCenter}
                    zoom={12}
                    onClick={handleMapClick}
                    options={{
                      styles: isDark ? darkMapStyle : [],
                      disableDefaultUI: true,
                      zoomControl: true,
                    }}
                  >
                    {coordinates && <Marker position={coordinates} />}
                  </GoogleMap>
                </div>
              ) : (
                <div className="h-[220px] bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse flex items-center justify-center text-slate-400 text-sm">
                  Loading map...
                </div>
              )}
              {address && (
                <div className="px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg flex items-start gap-3">
                  <MapPin size={16} className="text-blue-600 mt-0.5 shrink-0" />
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-300 leading-tight">{address}</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Mission Title</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g., Critical Medical Supply"
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-sm"
                    value={taskName}
                    onChange={(e) => setTaskName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Priority</label>
                    <select
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-sm appearance-none"
                      value={urgency}
                      onChange={(e) => setUrgency(e.target.value)}
                    >
                      <option>Immediate</option>
                      <option>High</option>
                      <option>Medium</option>
                      <option>Low</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Est. Hours</label>
                    <input
                      type="number"
                      placeholder="Hours"
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-sm"
                      value={estimatedDuration}
                      onChange={(e) => setEstimatedDuration(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Scheduled Time</label>
                  <input
                    required
                    type="datetime-local"
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-sm"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Required Skills</label>
                  <div className="flex flex-wrap gap-2">
                    {PREDEFINED_SKILLS.map(skill => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                          selectedSkills.includes(skill)
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Description</label>
              <textarea
                required
                rows="3"
                placeholder="Detailed mission overview..."
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-sm resize-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {isSubmitting ? 'Creating...' : 'Deploy Mission'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
