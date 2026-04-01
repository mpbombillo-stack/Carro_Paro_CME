import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';

import type { MasterUser } from '../../types/audit';

export const DashboardModule: React.FC<{ user?: MasterUser }> = ({ user }) => {
    const [counts, setCounts] = useState({ audits: 0, alerts: 0, carts: 0 });

    useEffect(() => {
        const fetchDashboardData = async () => {
            const { count: auditsCount } = await supabase.from('audit_headers').select('*', { count: 'exact', head: true });
            const { data: alerts } = await supabase.from('audit_details').select('id').eq('estado_conformidad', false);
            const { count: cartsCount } = await supabase.from('master_carts').select('*', { count: 'exact', head: true });

            setCounts({
                audits: auditsCount || 0,
                alerts: alerts?.length || 0,
                carts: cartsCount || 0
            });
        };
        fetchDashboardData();
        
        // Polling stats every minute
        const interval = setInterval(fetchDashboardData, 60000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="space-y-8 animate-in fade-in duration-700 max-w-6xl mx-auto">
            <header>
                <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Panel Principal</h2>
                <p className="text-primary font-bold uppercase text-[10px] tracking-widest mt-1">Resumen operativo VerifiCa-RX</p>
            </header>

            <div className="space-y-8">
                {/* Welcome Banner */}
                <div className="bg-gradient-to-br from-primary to-blue-700 rounded-[40px] p-10 text-white shadow-2xl shadow-primary/20 relative overflow-hidden group">
                    <LayoutDashboard size={200} className="absolute -bottom-10 -right-10 opacity-10 group-hover:scale-110 transition-transform duration-1000" />
                    <div className="relative z-10 max-w-lg">
                        <h3 className="text-4xl font-black leading-tight">
                            Bienvenido, <br/>
                            {user?.full_name.split(' ')[0] || 'Profesional'}
                        </h3>
                        <p className="mt-4 text-blue-100 font-medium text-lg leading-relaxed opacity-80">
                            Actualmente se han realizado <span className="font-black text-white">{counts.audits} auditorías</span>. 
                            Hay <span className="font-black text-white">{counts.alerts} inconformidades</span> que requieren atención.
                        </p>
                        <div className="mt-8 flex gap-4">
                            <button className="px-6 py-3 bg-white text-primary rounded-2xl font-black text-xs uppercase tracking-widest hover:shadow-xl transition-all">Nueva Auditoría</button>
                            <button className="px-6 py-3 bg-white/10 text-white border border-white/20 rounded-2xl font-black text-xs uppercase tracking-widest backdrop-blur-md">Ver Inconformidades</button>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-[32px] shadow-sm hover:shadow-xl transition-all">
                       <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-500"><Clock size={24} /></div>
                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Carros Registrados</span>
                       </div>
                       <h4 className="text-3xl font-black text-slate-800 dark:text-white">{counts.carts}</h4>
                       <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase">Kits disponibles en sistema</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-[32px] shadow-sm hover:shadow-xl transition-all">
                       <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-500"><Users size={24} /></div>
                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Alertas Críticas</span>
                       </div>
                       <h4 className="text-3xl font-black text-red-500">{counts.alerts}</h4>
                       <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase">Insumos no conformes</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
