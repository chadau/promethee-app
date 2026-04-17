import { Routes, Route } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { DashboardCanvas } from './components/dashboard/DashboardCanvas';
import { LoginPage } from './components/auth/LoginPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { VoiceAssistantProvider, useVoiceAssistant } from './context/VoiceAssistantContext';
import { useEffect, useRef } from 'react';
import { useAuthStore } from './store/authStore';
import { droneConnectionService } from './services/droneConnectionService';
import { AdminProfilesPage } from './pages/AdminProfilesPage';
import { AdminDashboardsPage } from './pages/AdminDashboardsPage';

const GreetingTrigger = () => {
  const { playGreeting } = useVoiceAssistant();
  const hasPlayed = useRef(false);

  useEffect(() => {
    if (!hasPlayed.current) {
      playGreeting();
      hasPlayed.current = true;
    }
  }, [playGreeting]);
  return null;
};

const ConnectionManager = () => {
  const { isAuthenticated, accessToken } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      droneConnectionService.connect(accessToken);
    } else {
      droneConnectionService.disconnect();
    }

    return () => {
      droneConnectionService.disconnect();
    };
  }, [isAuthenticated, accessToken]);

  return null;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <VoiceAssistantProvider>
              <ConnectionManager />
              <GreetingTrigger />
              <MainLayout>
                <div className="w-full h-full p-4">
                  <DashboardCanvas />
                </div>
              </MainLayout>
            </VoiceAssistantProvider>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/dashboards"
        element={
          <ProtectedRoute>
            <VoiceAssistantProvider>
              <MainLayout>
                <AdminDashboardsPage />
              </MainLayout>
            </VoiceAssistantProvider>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/profiles"
        element={
          <ProtectedRoute>
            <VoiceAssistantProvider>
              <MainLayout>
                <AdminProfilesPage />
              </MainLayout>
            </VoiceAssistantProvider>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
