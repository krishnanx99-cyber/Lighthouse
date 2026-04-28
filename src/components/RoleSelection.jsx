import React from 'react';
import { User, Building2 } from 'lucide-react';

export default function RoleSelection({ selectedRole, onSelectRole }) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-700">

      <div className="grid grid-cols-1 gap-4">
        <button
          onClick={() => onSelectRole('Volunteer')}
          className={`relative p-8 rounded-2xl border-2 transition-all duration-300 group
            ${selectedRole === 'Volunteer' 
              ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 shadow-lg shadow-blue-500/10' 
              : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-200 dark:hover:border-blue-900 shadow-sm hover:shadow-md'
            }`}
        >
          <div className="flex items-center gap-6 text-left">
            <div className={`p-5 rounded-2xl transition-colors duration-300 ${selectedRole === 'Volunteer' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600'}`}>
              <User className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h3 className={`text-xl font-bold mb-1 transition-colors ${selectedRole === 'Volunteer' ? 'text-blue-700 dark:text-blue-300' : 'text-slate-900 dark:text-white'}`}>Volunteer</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Find tasks and make an impact in your community</p>
            </div>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedRole === 'Volunteer' ? 'bg-blue-600 border-blue-600' : 'border-slate-200 dark:border-slate-700'}`}>
              {selectedRole === 'Volunteer' && <div className="w-2 h-2 bg-white rounded-full" />}
            </div>
          </div>
        </button>

        <button
          onClick={() => onSelectRole('NGO')}
          className={`relative p-8 rounded-2xl border-2 transition-all duration-300 group
            ${selectedRole === 'NGO' 
              ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 shadow-lg shadow-blue-500/10' 
              : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-200 dark:hover:border-blue-900 shadow-sm hover:shadow-md'
            }`}
        >
          <div className="flex items-center gap-6 text-left">
            <div className={`p-5 rounded-2xl transition-colors duration-300 ${selectedRole === 'NGO' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600'}`}>
              <Building2 className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h3 className={`text-xl font-bold mb-1 transition-colors ${selectedRole === 'NGO' ? 'text-blue-700 dark:text-blue-300' : 'text-slate-900 dark:text-white'}`}>NGO / Organization</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Post tasks and manage volunteer operations</p>
            </div>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedRole === 'NGO' ? 'bg-blue-600 border-blue-600' : 'border-slate-200 dark:border-slate-700'}`}>
              {selectedRole === 'NGO' && <div className="w-2 h-2 bg-white rounded-full" />}
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
