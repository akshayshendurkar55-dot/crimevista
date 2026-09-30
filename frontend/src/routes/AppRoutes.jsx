import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { RoleGuard } from '../components/layout/RoleGuard';

// Pages
import { LandingPage } from '../pages/landing/LandingPage';
import { RoleSelectionPage } from '../pages/auth/RoleSelectionPage';
import { AdminLoginPage } from '../pages/auth/AdminLoginPage';
import { OfficerLoginPage } from '../pages/auth/OfficerLoginPage';
import { UserLoginPage } from '../pages/auth/UserLoginPage';
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { OfficerDashboard } from '../pages/officer/OfficerDashboard';
import { UserDashboard } from '../pages/user/UserDashboard';
import { UnauthorizedPage } from '../pages/UnauthorizedPage';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Landing & Login Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<RoleSelectionPage />} />
      <Route path="/login/admin" element={<AdminLoginPage />} />
      <Route path="/login/officer" element={<OfficerLoginPage />} />
      <Route path="/login/user" element={<UserLoginPage />} />

      {/* Role-Protected Admin Dashboard */}
      <Route
        path="/admin/dashboard"
        element={
          <RoleGuard allowedRoles={['ADMIN']}>
            <AdminDashboard />
          </RoleGuard>
        }
      />

      {/* Role-Protected Officer Dashboard */}
      <Route
        path="/officer/dashboard"
        element={
          <RoleGuard allowedRoles={['OFFICER']}>
            <OfficerDashboard />
          </RoleGuard>
        }
      />

      {/* Role-Protected User Dashboard */}
      <Route
        path="/user/dashboard"
        element={
          <RoleGuard allowedRoles={['USER']}>
            <UserDashboard />
          </RoleGuard>
        }
      />

      {/* RBAC 403 Unauthorized Route */}
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
