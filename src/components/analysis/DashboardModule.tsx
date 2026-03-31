import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, Clock, History, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

import type { MasterUser } from '../../types/audit';

export const DashboardModule: React.FC<{ user?: MasterUser }> = ({ user }) => {
    const [counts, setCounts] = useState({ audits: 0, alerts: 0, carts: 0 });
    const [recentActivity, setRecentActivity] = useState([
        { id: '1', user: 'Jefe María', action: 'Verificó CP-01', time: 'Hace 5 min', details: 'Se completó la verificación del carro de paro 01 en Urgencias. Sin novedades ni elementos faltantes.' },
        { id: '2', user: 'Farm. Carlos', action: 'Ajustó stock Adrenalina', time: 'Hace 12 min', details: 'Ajuste de inventario en bodega: Se repusieron 5 ampollas de Adrenalina 1mg por uso en emergencia cardiovascular.' },
        { id: '3', user: 'Dr. Pedro', action: 'Firmó Auditoría #82', time: 'Hace 45 min', details: 'Firma electrónica verificada para el cierre de la auditoría mensual del área quirúrgica. Estado: Conforme.' },
    ]);
    const [selectedActivity, setSelectedActivity] = useState<{id: string, user: string, action: string, time: string, details: string} | null>(null);

    const removeActivity = (e: React.MouseEvent, actId: string) => {
        e.stopPropagation();
        setRecentActivity(prev => prev.filter(a => a.id !== actId));
    };

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
    }, []);

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <header>
                <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Panel Principal</h2>
                <p className="text-primary font-bold uppercase text-[10px] tracking-widest mt-1">Resumen operativo VerifiCa-RX</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
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
                    <div className="grid grid-cols-2 gap-6">
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

                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-[32px] shadow-sm h-full flex flex-col">
                        <h4 className="flex justify-between items-center text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest mb-6">
                            <div className="flex items-center gap-2">
                                <History size={18} className="text-primary" /> Actividad Reciente
                            </div>
                            {recentActivity.length > 0 && (
                                <button 
                                    onClick={() => setRecentActivity([])}
                                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 rounded-xl transition-all"
                                    title="Limpiar actividad"
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </h4>
                        <div className="flex-1 space-y-6">
                            {recentActivity.length > 0 ? (
                                recentActivity.map((act) => (
                                    <div 
                                        key={act.id} 
                                        onClick={() => setSelectedActivity(act)}
                                        className="flex gap-4 items-center group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 p-2 -mx-2 rounded-2xl transition-all"
                                    >
                                        <div className="size-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-[10px] font-black group-hover:bg-primary group-hover:text-white transition-colors duration-500 shrink-0">
                                            {act.user.split(' ')[1]?.substring(0,2).toUpperCase() || act.user.substring(0,2).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-black text-slate-700 dark:text-slate-200 group-hover:text-primary transition-colors">{act.user}</p>
                                            <p className="text-[10px] font-bold text-slate-400 truncate mt-0.5">{act.action}</p>
                                        </div>
                                        <div className="flex flex-col items-end shrink-0 gap-1 pt-0.5">
                                            <span className="text-[8px] font-black text-slate-300 uppercase">{act.time}</span>
                                            <button 
                                                onClick={(e) => removeActivity(e, act.id)}
                                                className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:text-slate-600 dark:hover:text-red-400 dark:hover:bg-red-900/30 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                title="Eliminar actividad"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-10 text-slate-300 gap-2">
                                    <History size={40} className="opacity-20" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">Sin actividad</p>
                                </div>
                            )}
                        </div>
                        <button className="w-full py-4 text-[10px] font-black text-primary border-t border-slate-50 dark:border-slate-800 mt-6 hover:tracking-widest transition-all uppercase">Ver todos los eventos</button>
                    </div>
                </div>
            </div>

            {/* Modal de Detalle de Actividad */}
            {selectedActivity && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl relative">
                        <div className="p-8">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xl font-black text-slate-800 dark:text-white">Detalle de Actividad</h3>
                                <button 
                                    onClick={() => setSelectedActivity(null)}
                                    className="p-2 -mr-2 text-slate-400 hover:bg-slate-50 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-white transition-colors rounded-xl"
                                >
                                    ✕
                                </button>
                            </div>
                            
                            <div className="flex items-center gap-4 mt-6 mb-6">
                                <div className="size-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-lg font-black shadow-inner shadow-primary/20">
                                    {selectedActivity.user.substring(0,2).toUpperCase()}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-black text-slate-800 dark:text-white">{selectedActivity.user}</p>
                                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest mt-1"><Clock size={10} className="inline mr-1"/>{selectedActivity.time}</p>
                                </div>
                            </div>

                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-3">{selectedActivity.action}</p>
                            <div className="bg-slate-50 dark:bg-slate-800/80 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-inner">
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                                    {selectedActivity.details}
                                </p>
                            </div>
                        </div>

                        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                            <button
                                onClick={() => setSelectedActivity(null)}
                                className="px-6 py-3 bg-white dark:bg-slate-700 shadow-sm border border-slate-100 dark:border-slate-600 font-black text-[10px] text-slate-600 dark:text-slate-200 uppercase tracking-widest rounded-xl hover:shadow-lg transition-all"
                            >
                                Aceptar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
