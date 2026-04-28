import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import SmartMatching from './pages/admin/SmartMatching';
import Volunteers from './pages/admin/Volunteers';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminProfile from './pages/admin/Profile';
import HubDashboard from './pages/hub/Dashboard';
import Onboarding from './pages/hub/Onboarding';
import Explore from './pages/hub/Explore';
import History from './pages/hub/History';
import Profile from './pages/hub/Profile';
import TaskDetails from './pages/hub/TaskDetails';
import NgoProfile from './pages/hub/NgoProfile';
import ProtectedRoute from './components/ProtectedRoute';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route 
        path="/admin/dashboard" 
        element={
          <ProtectedRoute allowedRole="NGO">
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/matching" 
        element={
          <ProtectedRoute allowedRole="NGO">
            <SmartMatching />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/volunteers" 
        element={
          <ProtectedRoute allowedRole="NGO">
            <Volunteers />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/profile" 
        element={
          <ProtectedRoute allowedRole="NGO">
            <AdminProfile />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/hub/onboarding" 
        element={
          <ProtectedRoute allowedRole="Volunteer">
            <Onboarding />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/hub" 
        element={
          <ProtectedRoute allowedRole="Volunteer">
            <HubDashboard />
          </ProtectedRoute>
        } 
      />
      <Route path="/hub/dashboard" element={<Navigate to="/hub" replace />} />
      <Route path="/hub/tasks" element={<Navigate to="/hub" replace />} />
      <Route 
        path="/hub/explore" 
        element={
          <ProtectedRoute allowedRole="Volunteer">
            <Explore />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/hub/history" 
        element={
          <ProtectedRoute allowedRole="Volunteer">
            <History />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/hub/profile" 
        element={
          <ProtectedRoute allowedRole="Volunteer">
            <Profile />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/hub/task/:taskId" 
        element={
          <ProtectedRoute allowedRole="Volunteer">
            <TaskDetails />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/hub/ngo/:ngoId" 
        element={
          <ProtectedRoute allowedRole="Volunteer">
            <NgoProfile />
          </ProtectedRoute>
        } 
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
