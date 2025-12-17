
import { MainLayout } from './layouts/MainLayout';
import { Dashboard } from './components/dashboard/Dashboard';

function App() {
  return (
    <MainLayout>
      <div className="w-full h-full p-4">
        <Dashboard />
      </div>
    </MainLayout>
  );
}

export default App;

