import { Routes, Route } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { Dashboard } from './components/dashboard/Dashboard';
import { LoginPage } from './components/auth/LoginPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { VoiceAssistantProvider, useVoiceAssistant } from './context/VoiceAssistantContext';
import { useEffect, useRef } from 'react';
import { useAuthStore } from './store/authStore';
import { droneConnectionService } from './services/droneConnectionService';

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
  const { isAuthenticated, token } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && token) {
      droneConnectionService.connect(token);
    } else {
      droneConnectionService.disconnect();
    }

    return () => {
      droneConnectionService.disconnect();
    };
  }, [isAuthenticated, token]);

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
                  <Dashboard />
                </div>
              </MainLayout>
            </VoiceAssistantProvider>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;

