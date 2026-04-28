import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../../config/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { defaultCenter, darkMapStyle } from '../../utils/mapUtils';
import { useTheme } from '../../context/ThemeContext';

const mapContainerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '0.75rem'
};

const getMarkerIcon = (status) => {
  let color = '#ef4444'; // open = red
  if (status === 'assigned' || status === 'claimed' || status === 'checked-in') {
    color = '#eab308'; // active = yellow
  } else if (status === 'completed') {
    color = '#6b7280'; // completed = gray
  }

  return {
    path: window.google?.maps?.SymbolPath?.CIRCLE || 0,
    fillColor: color,
    fillOpacity: 1,
    strokeWeight: 2,
    strokeColor: '#ffffff',
    scale: 10
  };
};

export default function NGOCommandMap() {
  const { isDark } = useTheme();
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  });

  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'tasks'),
      where('ngoId', '==', auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasksData = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          coords: data.coordinates || defaultCenter
        };
      });
      setTasks(tasksData);
    });

    return () => unsubscribe();
  }, []);

  const onMapLoad = useCallback((map) => {
    // We could fit bounds to markers here if needed
  }, []);

  if (loadError) {
    return <div className="text-red-600 p-4 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-sm">Error loading maps</div>;
  }

  if (!isLoaded) {
    return <div className="animate-pulse h-[400px] w-full bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"></div>;
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm mb-6">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={defaultCenter}
        zoom={11}
        onLoad={onMapLoad}
        options={{
          styles: isDark ? darkMapStyle : [],
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false
        }}
      >
        {tasks.filter(t => t.coords).map((task) => (
          <Marker
            key={task.id}
            position={task.coords}
            icon={getMarkerIcon(task.status)}
            onClick={() => setSelectedTask(task)}
          />
        ))}

        {selectedTask && (
          <InfoWindow
            position={selectedTask.coords}
            onCloseClick={() => setSelectedTask(null)}
          >
            <div className="text-slate-900 p-2 max-w-[200px]">
              <h3 className="font-semibold text-base mb-1">{selectedTask.taskName}</h3>
              <p className="text-xs text-slate-500 mb-2">{selectedTask.location}</p>
              
              <div className="flex flex-wrap gap-1 mb-3">
                {selectedTask.requiredSkills?.map((skill, i) => (
                  <span key={i} className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] font-medium text-slate-600">
                    {skill}
                  </span>
                ))}
              </div>
              
              <button
                onClick={() => navigate('/admin/matching')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1.5 px-3 rounded text-xs transition-colors"
              >
                Assign Resources
              </button>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}
