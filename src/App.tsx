import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { DataProvider } from './data/DataContext';
import { LoginPage } from './pages/LoginPage';
import { ListPage } from './pages/ListPage';
import { DetailsPage } from './pages/DetailsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';

const PrivateRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <DataProvider>
        <div className="app-shell">
          <header className="app-header">
            <h1>Employee Insights Dashboard</h1>
          </header>
          <main className="app-main">
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/list"
                element={
                  <PrivateRoute>
                    <ListPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/details/:id"
                element={
                  <PrivateRoute>
                    <DetailsPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <PrivateRoute>
                    <AnalyticsPage />
                  </PrivateRoute>
                }
              />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </main>
        </div>
      </DataProvider>
    </AuthProvider>
  );
};

