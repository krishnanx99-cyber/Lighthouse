import React, { useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import TasksTable from '../../components/admin/TasksTable';
import NewEmergencyModal from '../../components/admin/NewEmergencyModal';
import NGOCommandMap from '../../components/admin/NGOCommandMap';
import { Plus } from 'lucide-react';

export default function AdminDashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <p className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-1">Operational Command</p>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Active Emergencies</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Real-time situational awareness and resource deployment.</p>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-5 rounded-lg transition-colors shadow-sm active:scale-95 text-sm"
          >
            <Plus size={18} />
            Deploy Mission
          </button>
        </div>

        {/* Command Map */}
        <NGOCommandMap />

        {/* Data Table */}
        <TasksTable />

      </div>

      <NewEmergencyModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </AdminLayout>
  );
}
