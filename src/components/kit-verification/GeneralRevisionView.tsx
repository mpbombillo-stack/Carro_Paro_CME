import { DashboardLayout } from '../layout/DashboardLayout';

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

    const NewInspectionButton = (
        <button onClick={onNavigateToDetail} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-all">
            <span className="material-symbols-outlined text-sm">add</span>
            <span>Nueva Inspección</span>
        </button>
    );

    return (
        <DashboardLayout headerActions={NewInspectionButton}>
            {/* Breadcrumbs & Title */}
            <div className="mb-8">
                <nav className="flex text-sm text-slate-500 mb-2 items-center gap-2">
                    <a href="#" className="hover:text-primary transition-colors">Gestión de Carros</a>
                    <span className="material-symbols-outlined text-xs">chevron_right</span>
                    <span className="text-slate-900 dark:text-slate-100 font-medium">Carro de Paro CP-082</span>
                </nav>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">Revisión de Carro de Paro</h1>
                        <p className="text-slate-500 mt-1 flex items-center gap-4">
                            <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-sm">tag</span> ID: CP-082</span>
                            <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-sm">location_on</span> Sala de Urgencias</span>
                            <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-sm">calendar_month</span> Última revisión: 25 Oct 2023</span>
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm">
                            <span className="material-symbols-outlined text-lg">download</span>
                            Exportar
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm text-red-600">
                            <span className="material-symbols-outlined text-lg">report</span>
                            Reportar Incidencia
                        </button>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <p className="text-slate-500 text-sm font-medium">Total de Artículos</p>
                    <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-3xl font-black text-slate-900 dark:text-slate-100">142</span>
                        <span className="text-xs font-bold text-slate-400">Total</span>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm border-l-4 border-l-yellow-500">
                    <p className="text-slate-500 text-sm font-medium">Próximos a Vencer</p>
                    <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-3xl font-black text-yellow-600 dark:text-yellow-500">8</span>
                        <span className="text-xs font-bold text-yellow-600/70">&lt; 30 días</span>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm border-l-4 border-l-red-500">
                    <p className="text-slate-500 text-sm font-medium">Vencidos / Caducos</p>
                    <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-3xl font-black text-red-600 dark:text-red-500">2</span>
                        <span className="text-xs font-bold text-red-600/70">Urgente</span>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm border-l-4 border-l-primary">
                    <p className="text-slate-500 text-sm font-medium">Registro Sanitario Vencido</p>
                    <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-3xl font-black text-primary">3</span>
                        <span className="text-xs font-bold text-primary/70">Actualizar</span>
                    </div>
                </div>
            </div>

            {/* Table Container */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                    <h3 className="font-bold text-slate-900 dark:text-slate-100">Listado de Medicamentos e Insumos</h3>
                    <div className="flex gap-2">
                        <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
                            <span className="material-symbols-outlined text-slate-500">filter_list</span>
                        </button>
                        <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
                            <span className="material-symbols-outlined text-slate-500">view_column</span>
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/30 text-slate-500 text-xs font-bold uppercase tracking-wider">
                                <th className="px-6 py-4">Descripción / Producto</th>
                                <th className="px-6 py-4">Concentración</th>
                                <th className="px-6 py-4">Cant.</th>
                                <th className="px-6 py-4">Lote</th>
                                <th className="px-6 py-4">Vencimiento</th>
                                <th className="px-6 py-4">Registro Sanitario</th>
                                <th className="px-6 py-4">Vigencia RS</th>
                                <th className="px-6 py-4">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {listItems.map((item, i) => (
                                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">{item.desc}</p>
                                        <p className="text-xs text-slate-500">{item.sub}</p>
                                    </td>
                                    <td className="px-6 py-4 text-sm">{item.conc}</td>
                                    <td className="px-6 py-4 text-sm font-medium">{item.cant}</td>
                                    <td className="px-6 py-4 text-sm font-mono">{item.lote}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className={`${
                                            item.color === 'red' ? 'text-red-600 font-bold bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded' :
                                            item.color === 'yellow' ? 'text-yellow-600 font-bold bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded' :
                                            'text-slate-600 dark:text-slate-400'
                                        }`}>{item.vto}</span>
                                    </td>
                                    <td className="px-6 py-4 text-sm">{item.rs}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className={`${
                                            item.color === 'primary' ? 'text-primary font-bold bg-primary/10 px-2 py-1 rounded' : ''
                                        }`}>{item.rsVto}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                            item.color === 'red' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                                            item.color === 'yellow' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                                            item.color === 'primary' ? 'bg-primary/10 text-primary' :
                                            'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                        }`}>
                                            <span className={`size-1.5 rounded-full ${
                                                item.color === 'red' ? 'bg-red-500 animate-pulse' :
                                                item.color === 'yellow' ? 'bg-yellow-500' :
                                                item.color === 'primary' ? 'bg-primary' :
                                                'bg-green-500'
                                            }`}></span> {item.estado}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <p className="text-sm text-slate-500">Mostrando <span className="font-bold text-slate-900 dark:text-slate-100">1-6</span> de <span className="font-bold text-slate-900 dark:text-slate-100">142</span> artículos</p>
                    <div className="flex gap-1">
                        <button className="size-8 flex items-center justify-center rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 hover:text-primary hover:border-primary transition-all">
                            <span className="material-symbols-outlined text-sm">chevron_left</span>
                        </button>
                        <button className="size-8 flex items-center justify-center rounded border border-primary bg-primary text-white font-bold text-sm">1</button>
                        <button className="size-8 flex items-center justify-center rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 hover:text-primary hover:border-primary transition-all text-sm">2</button>
                        <button className="size-8 flex items-center justify-center rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 hover:text-primary hover:border-primary transition-all text-sm">3</button>
                        <span className="px-1 text-slate-400">...</span>
                        <button className="size-8 flex items-center justify-center rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 hover:text-primary hover:border-primary transition-all text-sm">24</button>
                        <button className="size-8 flex items-center justify-center rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 hover:text-primary hover:border-primary transition-all">
                            <span className="material-symbols-outlined text-sm">chevron_right</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Footer / Status Explanation */}
            <div className="mt-8 flex flex-wrap gap-8 p-6 bg-slate-100 dark:bg-slate-900/50 rounded-xl text-xs text-slate-500">
                <div className="flex items-center gap-2">
                    <span className="size-2 bg-red-500 rounded-full"></span>
                    <span className="font-bold uppercase tracking-tighter">Vencido:</span> Retiro inmediato y reemplazo.
                </div>
                <div className="flex items-center gap-2">
                    <span className="size-2 bg-yellow-500 rounded-full"></span>
                    <span className="font-bold uppercase tracking-tighter">Próximo:</span> Vigencia menor a 30 días calendario.
                </div>
                <div className="flex items-center gap-2">
                    <span className="size-2 bg-primary rounded-full"></span>
                    <span className="font-bold uppercase tracking-tighter">RS Vencido:</span> Registro Sanitario requiere renovación legal.
                </div>
                <div className="flex items-center gap-2">
                    <span className="size-2 bg-green-500 rounded-full"></span>
                    <span className="font-bold uppercase tracking-tighter">Óptimo:</span> Producto vigente y seguro para uso.
                </div>
            </div>
        </DashboardLayout>
    );
}
