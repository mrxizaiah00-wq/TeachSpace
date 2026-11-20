
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';

import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import { ToastProvider } from './contexts/ToastContext.jsx';

import AppLayout from './layouts/AppLayout.jsx';

import LoginPage from './pages/LoginPage.jsx';
import LandingPage from './pages/LandingPage.jsx';

import DashboardPage from './pages/DashboardPage.jsx';
import ClassesPage from './pages/ClassesPage.jsx';
import StudentsPage from './pages/StudentsPage.jsx';
import SubjectsPage from './pages/SubjectsPage.jsx';
import SchedulesPage from './pages/SchedulesPage.jsx';
import AttendancePage from './pages/AttendancePage.jsx';
import GradesPage from './pages/GradesPage.jsx';
import MaterialsPage from './pages/MaterialsPage.jsx';
import ReportsPage from './pages/ReportsPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import { useState, useCallback } from 'react';
import LandingLoader from './components/landing/LoadingScreen.jsx';

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F9FC] text-sm font-medium text-[#142B4A]">
      Memuat TeachSpace...
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  if (!user) return <Navigate to="/login" replace />;

  return children;
}

function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  if (user) return <Navigate to="/" replace />;

  return children;
}

// Halaman utama: landing page untuk pengunjung,
// dashboard untuk pengguna yang sudah login.
function RootRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  const [introFinished, setIntroFinished] = useState(
    () => sessionStorage.getItem('teachspace-intro') === 'done'
  );

  const finishIntro = useCallback(() => {
    sessionStorage.setItem('teachspace-intro', 'done');
    setIntroFinished(true);
  }, []);

  if (loading) return <LoadingScreen />;

  if (!user && location.pathname === '/') {
    if (!introFinished) {
      return <LandingLoader onComplete={finishIntro} />;
    }

    return <LandingPage />;
  }

  if (!user) return <Navigate to="/login" replace />;

  return <AppLayout />;
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>

            {/* LANDING PAGE */}
            <Route path="/" element={<RootRoute />}>
              <Route
                index
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="classes"
                element={<ProtectedRoute><ClassesPage /></ProtectedRoute>}
              />

              <Route
                path="students"
                element={<ProtectedRoute><StudentsPage /></ProtectedRoute>}
              />

              <Route
                path="subjects"
                element={<ProtectedRoute><SubjectsPage /></ProtectedRoute>}
              />

              <Route
                path="schedules"
                element={<ProtectedRoute><SchedulesPage /></ProtectedRoute>}
              />

              <Route
                path="attendance"
                element={<ProtectedRoute><AttendancePage /></ProtectedRoute>}
              />

              <Route
                path="grades"
                element={<ProtectedRoute><GradesPage /></ProtectedRoute>}
              />

              <Route
                path="materials"
                element={<ProtectedRoute><MaterialsPage /></ProtectedRoute>}
              />

              <Route
                path="reports"
                element={<ProtectedRoute><ReportsPage /></ProtectedRoute>}
              />

              <Route
                path="settings"
                element={<ProtectedRoute><SettingsPage /></ProtectedRoute>}
              />
            </Route>

            {/* LOGIN */}
            <Route
              path="/login"
              element={
                <PublicOnlyRoute>
                  <LoginPage initialMode="login" />
                </PublicOnlyRoute>
              }
            />

            {/* REGISTER */}
            <Route
              path="/register"
              element={
                <PublicOnlyRoute>
                  <LoginPage initialMode="register" />
                </PublicOnlyRoute>
              }
            />

            {/* URL TIDAK DIKENAL */}
            <Route path="*" element={<Navigate to="/" replace />} />

          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
