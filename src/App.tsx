import { useState, useEffect } from 'react';
import { KitVerificationModule } from './components/kit-verification/KitVerificationModule';
import { InventoryModule } from './components/masters/InventoryModule';
import { ConfigurationModule } from './components/masters/ConfigurationModule';
import { CartsModule } from './components/masters/CartsModule';
import { ReportsModule } from './components/analysis/ReportsModule';
import { DashboardModule } from './components/analysis/DashboardModule';
import { DashboardLayout, type DashboardTab } from './components/layout/DashboardLayout';
import { LoginPage } from './components/auth/LoginPage';
import type { MasterUser } from './types/audit';

function App() {
  const [activeTab, setActiveTab] = useState<DashboardTab>('dashboard');
  const [user, setUser] = useState<MasterUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check session
    const savedUser = localStorage.getItem('auth_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  if (loading) return null;

  const handleLogin = (loggedUser: MasterUser) => {
    setUser(loggedUser);
    localStorage.setItem('auth_user', JSON.stringify(loggedUser));
  };

  const handleLogout = () => {
    if (confirm('¿Deseas cerrar la sesión activa?')) {
      setUser(null);
      localStorage.removeItem('auth_user');
      setActiveTab('dashboard');
    }
  };

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'auditorias':
        return <KitVerificationModule />;
      case 'inventario':
        return <InventoryModule />;
      case 'carros':
        return <CartsModule />;
      case 'config':
        return <ConfigurationModule />;
      case 'dashboard':
        return <DashboardModule />;
      case 'reportes':
        return <ReportsModule />;
      default:
        return <DashboardModule />;
    }
  };

  return (
    <DashboardLayout 
      activeTab={activeTab} 
      onTabChange={setActiveTab}
      user={user}
      onLogout={handleLogout}
    >
      {renderContent()}
    </DashboardLayout>
  );
}

export default App;
