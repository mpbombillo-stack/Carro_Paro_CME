import { Plus, Download, AlertTriangle, ChevronRight, Tag, MapPin, Calendar, Filter, LayoutGrid, ChevronLeft } from 'lucide-react';

interface GeneralRevisionViewProps {
    onNavigateToDetail: () => void;
}

export function GeneralRevisionView({ onNavigateToDetail }: GeneralRevisionViewProps) {
    const listItems = [
        { desc: 'Adrenalina 1mg/ml', sub: 'Ampolla x 1ml', conc: '1 mg/ml', cant: '10', lote: 'LOT-2023-A', vto: '2023-09-15', rs: 'INVIMA 2018M-0012', rsVto: '2028-10-20', estado: 'Vencido', color: 'red' },
        { desc: 'Amiodarona 150mg/3ml', sub: 'Ampolla x 3ml', conc: '50 mg/ml', cant: '6', lote: 'XJ-99812', vto: '2023-11-20', rs: 'INVIMA 2015M-0082', rsVto: '2025-05-12', estado: 'Próximo', color: 'yellow' },
        { desc: 'Atropina Sulfato 1mg/ml', sub: 'Ampolla x 1ml', conc: '1 mg/ml', cant: '10', lote: 'BN-2022-01', vto: '2025-12-30', rs: 'INVIMA 2013M-0994', rsVto: '2023-08-01', estado: 'RS Vencido', color: 'primary' },
        { desc: 'Bicarbonato de Sodio 10%', sub: 'Ampolla x 10ml', conc: '1 mEq/ml', cant: '20', lote: 'B-88392-T', vto: '2026-06-15', rs: 'INVIMA 2021M-1122', rsVto: '2031-11-30', estado: 'Óptimo', color: 'green' },
        { desc: 'Dopamina 200mg/5ml', sub: 'Ampolla x 5ml', conc: '40 mg/ml', cant: '4', lote: 'DP-00122', vto: '2025-02-10', rs: 'INVIMA 2017M-0133', rsVto: '2027-08-15', estado: 'Óptimo', color: 'green' },
        { desc: 'Gluconato de Calcio 10%', sub: 'Ampolla x 10ml', conc: '100 mg/ml', cant: '5', lote: 'GC-22-X4', vto: '2024-09-22', rs: 'INVIMA 2019M-0019', rsVto: '2029-01-05', estado: 'Óptimo', color: 'green' }
    ];

    return (
        <div className="animate-in fade-in duration-500 space-y-8">
            {/* Breadcrumbs & Title */}
            <div className="space-y-6">
                <nav className="flex text-[10px] font-black uppercase tracking-widest text-slate-400 items-center gap-2">
                    <span className="hover:text-primary transition-colors cursor-pointer">Gestión de Carros</span>
                    <ChevronRight size={12} className="text-slate-300" />
                    <span className="text-slate-900 dark:text-slate-100 italic">Carro de Paro CP-082</span>
                </nav>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white">Revisión de Carro de Paro</h1>
                        <div className="mt-4 flex flex-wrap items-center gap-6 text-slate-500">
                            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-tight"><Tag size={14} className="text-primary" /> ID: CP-082</span>
                            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-tight"><MapPin size={14} className="text-primary" /> Sala de Urgencias</span>
                            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-tight"><Calendar size={14} className="text-primary" /> Última: 25 Oct 2023</span>
                        </div>
                    </div>
                    <div className="flex gap-3">
                         <button 
                            onClick={onNavigateToDetail} 
                            className="flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:shadow-xl hover:shadow-primary/20 transition-all active:scale-[0.98]"
                            title="Empezar nueva inspección"
                        >
                            <Plus size={18} />
                            <span>Nueva Inspección</span>
                        </button>
                        <button 
                            className="flex items-center justify-center size-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-500 hover:text-primary transition-all shadow-sm"
                            title="Exportar listado"
                        >
                            <Download size={20} />
                        </button>
                        <button 
                            className="flex items-center justify-center size-12 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-2xl text-red-500 hover:bg-red-100 transition-all"
                            title="Reportar incidencia"
                        >
                            <AlertTriangle size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Artículos</p>
                    <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-4xl font-black text-slate-800 dark:text-white">142</span>
                        <span className="text-xs font-bold text-slate-400">Items registrados</span>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-yellow-500" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Próximos a Vencer</p>
                    <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-4xl font-black text-yellow-600">8</span>
                        <span className="text-xs font-extrabold text-yellow-600/70 tracking-tight uppercase">Menos de 30 días</span>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vencidos / Caducos</p>
                    <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-4xl font-black text-red-600">2</span>
                        <span className="text-xs font-extrabold text-red-600/70 tracking-tight uppercase">Inmediato</span>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Registro Invalido</p>
                    <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-4xl font-black text-primary">3</span>
                        <span className="text-xs font-extrabold text-primary/70 tracking-tight uppercase">Renovación</span>
                    </div>
                </div>
            </div>

            {/* Table Container */}
            <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
                <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/[0.3] dark:bg-slate-800/20">
                    <h3 className="text-lg font-black text-slate-800 dark:text-white tracking-tight">Listado de Medicamentos e Insumos</h3>
                    <div className="flex gap-2">
                        <button title="Filtrar" className="p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-slate-400 hover:text-primary transition-all shadow-sm">
                            <Filter size={18} />
                        </button>
                        <button title="Configurar Columnas" className="p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-slate-400 hover:text-primary transition-all shadow-sm">
                            <LayoutGrid size={18} />
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-800/40 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                                <th className="px-8 py-5">Producto</th>
                                <th className="px-6 py-5">Conc.</th>
                                <th className="px-6 py-5 text-center">Cant.</th>
                                <th className="px-6 py-5">Lote</th>
                                <th className="px-6 py-5">Vencimiento</th>
                                <th className="px-6 py-5">Registro Sanitario</th>
                                <th className="px-8 py-5">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                            {listItems.map((item, i) => (
                                <tr key={i} className="hover:bg-slate-50/[0.5] dark:hover:bg-slate-800/30 transition-colors group">
                                    <td className="px-8 py-6">
                                        <p className="font-black text-slate-800 dark:text-slate-100 text-sm">{item.desc}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{item.sub}</p>
                                    </td>
                                    <td className="px-6 py-6 text-sm font-bold text-slate-600 dark:text-slate-400">{item.conc}</td>
                                    <td className="px-6 py-6 text-center text-sm font-black text-slate-800 dark:text-slate-100">{item.cant}</td>
                                    <td className="px-6 py-6 text-sm font-mono font-bold text-slate-400">{item.lote}</td>
                                    <td className="px-6 py-6 text-sm">
                                        <span className={`px-2 py-1 rounded-lg text-[11px] font-black ${
                                            item.color === 'red' ? 'text-red-600 bg-red-50' :
                                            item.color === 'yellow' ? 'text-yellow-600 bg-yellow-50' :
                                            'text-slate-600 dark:text-slate-400'
                                        }`}>{item.vto}</span>
                                    </td>
                                    <td className="px-6 py-6">
                                        <p className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase">{item.rs}</p>
                                        <p className={`text-[9px] font-bold mt-0.5 ${item.color === 'primary' ? 'text-primary' : 'text-slate-400'}`}>Exp: {item.rsVto}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`inline-flex items-center gap-2 text-[10px] font-black uppercase px-3 py-1.5 rounded-full ${
                                            item.color === 'red' ? 'bg-red-50 text-red-600 ring-1 ring-red-100' :
                                            item.color === 'yellow' ? 'bg-yellow-50 text-yellow-600 ring-1 ring-yellow-100' :
                                            item.color === 'primary' ? 'bg-blue-50 text-primary ring-1 ring-blue-100' :
                                            'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100'
                                        }`}>
                                            <span className={`size-1.5 rounded-full ${
                                                item.color === 'red' ? 'bg-red-500 animate-pulse' :
                                                item.color === 'yellow' ? 'bg-yellow-500' :
                                                item.color === 'primary' ? 'bg-primary' :
                                                'bg-emerald-500'
                                            }`}></span> {item.estado}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="px-8 py-6 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-400">Mostrando <span className="font-black text-slate-900 dark:text-white">1-6</span> de 142 artículos</p>
                    <div className="flex gap-2">
                        <button title="Página anterior" className="size-10 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400 hover:text-primary transition-all shadow-sm">
                            <ChevronLeft size={18} />
                        </button>
                        {[1, 2, 3].map(p => (
                            <button key={p} title={`Ir a página ${p}`} className={`size-10 flex items-center justify-center rounded-xl font-black text-xs transition-all ${p === 1 ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 hover:border-primary hover:text-primary'}`}>{p}</button>
                        ))}
                        <button title="Siguiente página" className="size-10 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400 hover:text-primary transition-all shadow-sm">
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

