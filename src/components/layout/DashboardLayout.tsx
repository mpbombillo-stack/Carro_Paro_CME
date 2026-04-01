import type { ReactNode } from 'react';
import { 
    LayoutDashboard, 
    Truck, 
    PackageSearch, 
    BarChart3, 
    ClipboardCheck, 
    Settings, 
    Bell, 
    Search,
    ShieldCheck,
    Lock
} from 'lucide-react';
import type { MasterUser } from '../../types/audit';

export type DashboardTab = 'dashboard' | 'carros' | 'inventario' | 'reportes' | 'auditorias' | 'trazabilidad' | 'config';

interface DashboardLayoutProps {
    children: ReactNode;
    headerActions?: ReactNode;
    activeTab: DashboardTab;
    onTabChange: (tab: DashboardTab) => void;
    user: MasterUser;
}

export function DashboardLayout({ children, headerActions, activeTab, onTabChange, user }: DashboardLayoutProps) {
    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, section: 'Gestión' },
        { id: 'carros', label: 'Carros de Paro', icon: Truck, section: 'Gestión' },
        { id: 'inventario', label: 'Inventario Central', icon: PackageSearch, section: 'Gestión' },
        { id: 'auditorias', label: 'Auditorías', icon: ClipboardCheck, section: 'Análisis' },
        { id: 'trazabilidad', label: 'Trazabilidad Candados', icon: Lock, section: 'Análisis' },
        { id: 'reportes', label: 'Reportes', icon: BarChart3, section: 'Análisis' },
        { id: 'config', label: 'Configuración', icon: Settings, section: 'Análisis' },
    ];

    const isTabActive = (id: string) => activeTab === id;

    return (
        <div className="relative flex min-h-screen w-full font-display bg-slate-50/30 dark:bg-slate-950">
            {/* Sidebar Navigation */}
            <aside className="w-72 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shrink-0 sticky top-0 h-screen z-20">
                <div className="p-8 pb-6 flex items-center gap-3 text-primary">
                    <div className="size-10 bg-primary/10 rounded-xl flex items-center justify-center">
                        <ShieldCheck className="size-6 font-bold" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-black text-xl leading-none tracking-tight italic">
                            VerifiCa-<span className="text-slate-800 dark:text-white not-italic">RX</span>
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-1">Safe Management</span>
                    </div>
                </div>

                <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                    <div className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Gestión</div>
                    {navItems.filter(i => i.section === 'Gestión').map(item => (
                        <button
                            key={item.id}
                            onClick={() => onTabChange(item.id as DashboardTab)}
                            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
                                isTabActive(item.id) 
                                ? 'bg-primary text-white shadow-xl shadow-primary/30 font-bold' 
                                : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary font-bold'
                            }`}
                        >
                            <item.icon className={`size-5 transition-transform group-hover:scale-110`} />
                            <span className="text-sm">{item.label}</span>
                        </button>
                    ))}

                    <div className="pt-6 px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Análisis</div>
                    {navItems.filter(i => i.section === 'Análisis').map(item => (
                        <button
                            key={item.id}
                            onClick={() => onTabChange(item.id as DashboardTab)}
                            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
                                isTabActive(item.id) 
                                ? 'bg-primary text-white shadow-xl shadow-primary/30 font-bold' 
                                : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary font-bold'
                            }`}
                        >
                            <item.icon className={`size-5 transition-transform group-hover:scale-110`} />
                            <span className="text-sm">{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="p-4 pt-0 space-y-2">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-3xl mt-4 border border-slate-100 dark:border-white/5 group relative">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black shadow-lg shadow-slate-900/20 uppercase">
                                {user.full_name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-black text-slate-800 dark:text-white truncate">{user.full_name}</p>
                                <p className="text-[10px] font-bold text-primary uppercase tracking-tighter truncate">{user.job_title}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-10 sticky top-0 z-10 w-full shrink-0">
                    <div className="flex items-center gap-6 flex-1">
                        <div className="relative group flex-1 max-w-xl">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors size-5" />
                            <input 
                                type="text" 
                                placeholder="Buscar medicamento, lote o registro..." 
                                className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary/20 focus:bg-white dark:focus:bg-slate-900 rounded-2xl pl-12 pr-4 py-2.5 text-sm font-medium transition-all outline-none" 
                            />
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                        <button title="Notificaciones" className="relative p-2.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all">
                            <Bell className="size-5" />
                            <span className="absolute top-2.5 right-2.5 size-2 bg-red-500 rounded-full ring-4 ring-white dark:ring-slate-900"></span>
                        </button>
                        <div className="h-8 w-px bg-slate-200 dark:bg-slate-800"></div>
                        {headerActions}
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto overflow-x-hidden p-10 custom-scrollbar">
                    {children}
                </div>
            </main>
        </div>
    );
}
