import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './pages/Login';
import { AdminLayout } from './components/AdminLayout';
import { AdminUpload } from './pages/admin/AdminUpload';
import { AdminDoctors } from './pages/admin/AdminDoctors';
import { AdminAssignments } from './pages/admin/AdminAssignments';
import { AdminProgress } from './pages/admin/AdminProgress';
import { DoctorDashboard } from './pages/DoctorDashboard';
import { ReviewCase } from './pages/ReviewCase';

const PrivateRoute: React.FC<{ children: React.ReactNode; roles?: string[] }> = ({ children, roles }) => {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (roles && user && !roles.includes(user.role)) return <Navigate to="/" />;
  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <PrivateRoute roles={['ADMIN']}>
              <AdminLayout />
            </PrivateRoute>
          }>
            <Route index element={<Navigate to="progress" replace />} />
            <Route path="upload" element={<AdminUpload />} />
            <Route path="doctors" element={<AdminDoctors />} />
            <Route path="assignments" element={<AdminAssignments />} />
            <Route path="progress" element={<AdminProgress />} />
          </Route>

          {/* Doctor Routes */}
          <Route path="/doctor/dashboard" element={
            <PrivateRoute roles={['DOCTOR']}>
              <DoctorDashboard />
            </PrivateRoute>
          } />
          <Route path="/doctor/review/:id" element={
            <PrivateRoute roles={['DOCTOR']}>
              <ReviewCase />
            </PrivateRoute>
          } />

          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
