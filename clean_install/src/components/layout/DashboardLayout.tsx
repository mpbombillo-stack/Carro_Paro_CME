import type { ReactNode } from 'react';

interface DashboardLayoutProps {
    children: ReactNode;
    headerActions?: ReactNode;
}

export function DashboardLayout({ children, headerActions }: DashboardLayoutProps) {
    return (
        <div className="relative flex min-h-screen w-full font-display">
            {/* Sidebar Navigation */}
            <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shrink-0 sticky top-0 h-screen">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3 text-primary">
                    <span className="material-symbols-outlined text-3xl font-bold">medical_services</span>
                    <span className="font-bold text-lg leading-tight">HospTrack Pro</span>
                </div>

                <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                    <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Gestión</div>
                    <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-primary/10 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined">dashboard</span>
                        <span className="text-sm font-medium">Dashboard</span>
                    </a>
                    <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary text-white shadow-md shadow-primary/20">
                        <span className="material-symbols-outlined filled">emergency</span>
                        <span className="text-sm font-medium">Carros de Paro</span>
                    </a>
                    <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-primary/10 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined">inventory_2</span>
                        <span className="text-sm font-medium">Inventario Central</span>
                    </a>

                    <div className="pt-4 px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Análisis</div>
                    <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-primary/10 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined">analytics</span>
                        <span className="text-sm font-medium">Reportes</span>
                    </a>
                    <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-primary/10 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined">event_note</span>
                        <span className="text-sm font-medium">Auditorías</span>
                    </a>
                </nav>

                <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
                    <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-primary/10 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined">settings</span>
                        <span className="text-sm font-medium">Configuración</span>
                    </a>
                    <div className="flex items-center gap-3 px-3 py-3">
                        <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold overflow-hidden border border-primary/30">
                            DR
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold truncate">Dr. Rodríguez</p>
                            <p className="text-xs text-slate-500 truncate">Jefe de Farmacia</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 bg-background-light dark:bg-background-dark">
                {/* Header */}
                <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 sticky top-0 z-10 w-full">
                    <div className="flex items-center gap-4">
                        <div className="text-slate-400">
                            <span className="material-symbols-outlined">search</span>
                        </div>
                        <input type="text" placeholder="Buscar medicamento, lote o registro..." className="bg-transparent border-none focus:ring-0 text-sm w-80" />
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="relative p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                            <span className="material-symbols-outlined">notifications</span>
                            <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900"></span>
                        </button>
                        {headerActions}
                    </div>
                </header>

                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
