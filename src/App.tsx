import { useState } from 'react';
import { KitVerificationModule } from './components/kit-verification/KitVerificationModule';
import { InventoryModule } from './components/masters/InventoryModule';
import { ConfigurationModule } from './components/masters/ConfigurationModule';
import { CartsModule } from './components/masters/CartsModule';
import { ReportsModule } from './components/analysis/ReportsModule';
import { DashboardModule } from './components/analysis/DashboardModule';
import { DashboardLayout, type DashboardTab } from './components/layout/DashboardLayout';
import type { MasterUser } from './types/audit';

const DEFAULT_USER: MasterUser = {
  id: 'admin-id',
  full_name: 'Msuaza',
  job_title: 'Químico Farmacéutico',
  profile: 'Administrador',
  is_active: true
};

function App() {
  const [activeTab, setActiveTab] = useState<DashboardTab>('dashboard');

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
        return <DashboardModule user={DEFAULT_USER} onNavigate={(tab: any) => setActiveTab(tab)} />;
      case 'reportes':
        return <ReportsModule />;
      default:
        return <DashboardModule user={DEFAULT_USER} onNavigate={(tab: any) => setActiveTab(tab)} />;
    }
  };

  return (
    <DashboardLayout 
      activeTab={activeTab} 
      onTabChange={setActiveTab}
      user={DEFAULT_USER}
    >
      {renderContent()}
    </DashboardLayout>
  );
}

export default App;
