import React, { useState, useEffect, useRef } from 'react';
import { BarChart3, TrendingUp, AlertCircle, CheckCircle2, Calendar, FileDown } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface AuditStats {
    totalAudits: number;
    conformityRate: number;
    criticalAlerts: number;
    auditsByMonth: { month: string; count: number }[];
}

export const ReportsModule: React.FC = () => {
    const [stats, setStats] = useState<AuditStats>({
        totalAudits: 0,
        conformityRate: 0,
        criticalAlerts: 0,
        auditsByMonth: []
    });
    
    const progressRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchStats();
    }, []);

    useEffect(() => {
        if (progressRef.current) {
            progressRef.current.style.setProperty('--tw-dynamic-width', `${stats.conformityRate}%`);
        }
    }, [stats.conformityRate]);

    const fetchStats = async () => {
        const { data: headers } = await supabase.from('audit_headers').select('id, start_at');
        const { data: details } = await supabase.from('audit_details').select('is_conform');

        const total = headers?.length || 0;
        const totalDetails = details?.length || 0;
        const conformingDetails = details?.filter(d => d.is_conform).length || 0;
        const rate = totalDetails > 0 ? (conformingDetails / totalDetails) * 100 : 0;

        setStats({
            totalAudits: total,
            conformityRate: Math.round(rate),
            criticalAlerts: totalDetails - conformingDetails,
            auditsByMonth: [
                { month: 'Ene', count: 12 },
                { month: 'Feb', count: 18 },
                { month: 'Mar', count: total },
            ]
        });
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <header className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Reportes de Control</h2>
                    <p className="text-slate-500 font-bold">Análisis de cumplimiento ISO ADT-SRF-FR-025.</p>
                </div>
                <button className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-all shadow-sm">
                    <FileDown size={16} />
                    Exportar Consolidado
                </button>
            </header>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none transition-transform hover:scale-[1.02]">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 w-fit rounded-2xl text-blue-500 mb-4">
                        <BarChart3 size={24} />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Auditorías</p>
                    <h3 className="text-3xl font-black text-slate-800 dark:text-white mt-1">{stats.totalAudits}</h3>
                    <div className="mt-4 flex items-center gap-1 text-emerald-500 font-bold text-xs">
                        <TrendingUp size={14} />
                        <span>+12% vs mes anterior</span>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none transition-transform hover:scale-[1.02]">
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 w-fit rounded-2xl text-emerald-500 mb-4">
                        <CheckCircle2 size={24} />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tasa Cumplimiento</p>
                    <h3 className="text-3xl font-black text-slate-800 dark:text-white mt-1">{stats.conformityRate}%</h3>
                    <div className="mt-4 w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div 
                            ref={progressRef}
                            className="bg-emerald-500 h-full rounded-full transition-all duration-1000 dynamic-width" 
                        />
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none transition-transform hover:scale-[1.02]">
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 w-fit rounded-2xl text-red-500 mb-4">
                        <AlertCircle size={24} />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inconformidades</p>
                    <h3 className="text-3xl font-black text-slate-800 dark:text-white mt-1">{stats.criticalAlerts}</h3>
                    <p className="mt-4 text-slate-400 font-bold text-xs uppercase">Requieren acción inmediata</p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none transition-transform hover:scale-[1.02]">
                    <div className="p-3 bg-orange-50 dark:bg-orange-900/20 w-fit rounded-2xl text-orange-500 mb-4">
                        <Calendar size={24} />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Próxima Revisión</p>
                    <h3 className="text-xl font-black text-slate-800 dark:text-white mt-1">20 Mar, 2026</h3>
                    <p className="mt-4 text-slate-400 font-bold text-xs uppercase">Carro CP-082 (Urgencias)</p>
                </div>
            </div>

            {/* Charts Placeholder/Simplified */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/30 dark:shadow-none">
                    <h4 className="text-lg font-black text-slate-800 dark:text-white mb-8">Auditorías por Mes</h4>
                    <div className="flex items-end justify-between gap-4 h-48 px-4">
                        {stats.auditsByMonth.map((m, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                                <div 
                                    className="w-full bg-slate-50 dark:bg-slate-800 group-hover:bg-primary/10 rounded-2xl relative transition-all duration-500 cursor-pointer dynamic-height" 
                                    ref={(el) => {
                                        if (el) el.style.setProperty('--tw-dynamic-height', `${m.count * 5}%`);
                                    }}
                                >
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-2 py-1 rounded text-[10px] font-black opacity-0 group-hover:opacity-100 transition-opacity">
                                        {m.count}
                                    </div>
                                    <div className="absolute bottom-0 w-full bg-primary rounded-2xl shadow-lg shadow-primary/20 transition-all h-full" />
                                </div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{m.month}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-slate-900 rounded-[40px] p-8 text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-20 transition-transform group-hover:scale-110 duration-700">
                        <TrendingUp size={120} />
                    </div>
                    <div className="relative z-10">
                        <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest">Optimización de Farmacia</span>
                        <h4 className="text-3xl font-black mt-4 leading-tight">Tu nivel de cumplimiento aumentó un <span className="text-emerald-400">14.2%</span> este trimestre.</h4>
                        <p className="text-slate-400 mt-4 font-medium leading-relaxed">Gracias al seguimiento continuo, has reducido las mermas por vencimiento en un 8.5%, optimizando la rotación de insumos críticos.</p>
                        <button className="mt-8 px-6 py-3 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all">Ver Recomendaciones</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

