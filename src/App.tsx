import { useState } from 'react';
import { KitVerificationModule } from './components/kit-verification/KitVerificationModule';
import { InventoryModule } from './components/masters/InventoryModule';
import { ConfigurationModule } from './components/masters/ConfigurationModule';
import { CartsModule } from './components/masters/CartsModule';
import { ReportsModule } from './components/analysis/ReportsModule';
import { DashboardModule } from './components/analysis/DashboardModule';
import { DashboardLayout, type DashboardTab } from './components/layout/DashboardLayout';

function App() {
  const [activeTab, setActiveTab] = useState<DashboardTab>('auditorias');

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
        return <KitVerificationModule />;
    }
  };

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </DashboardLayout>
  );
}


export default App;

