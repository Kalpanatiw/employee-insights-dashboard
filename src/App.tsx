import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider, useAuth } from './core/session/SessionProvider';
import { DataProvider } from './services/employeeDataStore';

import { LoginPage } from './core/session/LoginPage';
import { EmployeeListPage } from './features/employees/EmployeeListPage';
import { EmployeeVerificationPage } from './features/identity/EmployeeVerificationPage';
import { AnalyticsDashboard } from './features/analytics/AnalyticsDashboard';

const PrivateRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AppContent: React.FC = () => {
  const { logout } = useAuth();

  return (
    <DataProvider>
      <div className="app-shell">
        <header className="app-header">
          <h1>Employee Insights Dashboard</h1>
          <button onClick={logout}>Logout</button>
        </header>

        <main className="app-main">
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />

            <Route path="/login" element={<LoginPage />} />

            <Route
              path="/list"
              element={
                <PrivateRoute>
                  <EmployeeListPage />
                </PrivateRoute>
              }
            />

            <Route
              path="/details/:id"
              element={
                <PrivateRoute>
                  <EmployeeVerificationPage />
                </PrivateRoute>
              }
            />

            <Route
              path="/analytics"
              element={
                <PrivateRoute>
                  <AnalyticsDashboard />
                </PrivateRoute>
              }
            />

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </main>
      </div>
    </DataProvider>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};