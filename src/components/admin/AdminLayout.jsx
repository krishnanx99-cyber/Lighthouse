import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-0 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-8 relative">
          <div className="relative z-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
