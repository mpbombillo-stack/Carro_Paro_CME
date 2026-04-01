import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Clock, AlertTriangle, PlayCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

import type { MasterUser } from '../../types/audit';

export const DashboardModule: React.FC<{ user?: MasterUser, onNavigate?: (tab: string) => void }> = ({ user, onNavigate }) => {
    const [counts, setCounts] = useState({ audits: 0, alerts: 0, carts: 0 });
    const [cartsList, setCartsList] = useState<any[]>([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            const { count: auditsCount } = await supabase.from('audit_headers').select('*', { count: 'exact', head: true });
            const { data: alerts } = await supabase.from('audit_details').select('id').eq('estado_conformidad', false);
            const { data: cList } = await supabase.from('master_carts').select('*').order('created_at', { ascending: false });

            setCounts({
                audits: auditsCount || 0,
                alerts: alerts?.length || 0,
                carts: cList?.length || 0
            });
            setCartsList(cList || []);
        };
        fetchDashboardData();
        
        const interval = setInterval(fetchDashboardData, 60000);
        return () => clearInterval(interval);
    }, []);

    const handleStartAudit = (cartId: string) => {
        localStorage.setItem('targetAuditCart', cartId);
        if (onNavigate) {
            onNavigate('auditorias');
        } else {
            // Fallback en caso de que App aún no esté inyectando la prop `onNavigate` de forma limpia
            window.location.hash = '#auditorias'; 
            window.location.reload(); 
        }
    };

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
                            <button onClick={() => onNavigate && onNavigate('auditorias')} className="px-6 py-3 bg-white text-primary rounded-2xl font-black text-xs uppercase tracking-widest hover:shadow-xl transition-all">Nueva Auditoría</button>
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
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-2xl text-red-500"><AlertTriangle size={24} /></div>
                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Alertas Críticas</span>
                       </div>
                       <h4 className="text-3xl font-black text-red-500">{counts.alerts}</h4>
                       <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase">Insumos no conformes</p>
                    </div>
                </div>

                {/* Available Carts */}
                <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/10">
                        <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">Carros Configurados</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Selecciona un kit para iniciar auditoría</p>
                    </div>
                    <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
                        {cartsList.map(cart => (
                            <div key={cart.id} className="p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors group">
                                <div>
                                    <h4 className="text-sm font-black text-slate-800 dark:text-slate-100">{cart.name}</h4>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Ubicación: {cart.location}</p>
                                </div>
                                <button 
                                    onClick={() => handleStartAudit(cart.id)}
                                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white transition-all transform group-hover:scale-105"
                                >
                                    <PlayCircle size={14} /> Auditar
                                </button>
                            </div>
                        ))}
                        {cartsList.length === 0 && (
                            <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-4">
                                <Clock size={32} className="opacity-20" />
                                <p className="text-[10px] font-black uppercase tracking-widest">No hay carros configurados aún</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};
