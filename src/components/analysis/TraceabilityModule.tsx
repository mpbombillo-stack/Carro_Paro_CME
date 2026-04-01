import React, { useState, useEffect } from 'react';
import { Lock, FileDown, ShieldCheck, Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';

interface TraceabilityRecord {
    id: string;
    fecha_hora_inicio: string;
    id_carro: string;
    serial_apertura: string;
    serial_cierre: string;
    motivo_apertura: string;
    responsable_usuario: string;
}

export const TraceabilityModule: React.FC = () => {
    const [records, setRecords] = useState<TraceabilityRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchTraceability();
    }, []);

    const fetchTraceability = async () => {
        setLoading(true);
        // We need to join audit_headers and audit_custody
        const { data: custodyData, error: custodyError } = await supabase
            .from('audit_custody')
            .select(`
                id,
                serial_apertura,
                serial_cierre,
                motivo_apertura,
                audit_header_id,
                audit_headers (
                    fecha_hora_inicio,
                    id_carro,
                    responsable_usuario
                )
            `)
            .order('created_at', { ascending: false });

        if (!custodyError && custodyData) {
            const formattedRecords: TraceabilityRecord[] = custodyData.map((d: any) => ({
                id: d.id,
                fecha_hora_inicio: d.audit_headers?.fecha_hora_inicio || new Date().toISOString(),
                id_carro: d.audit_headers?.id_carro || 'Desconocido',
                responsable_usuario: d.audit_headers?.responsable_usuario || 'N/A',
                serial_apertura: d.serial_apertura,
                serial_cierre: d.serial_cierre,
                motivo_apertura: d.motivo_apertura
            }));
            setRecords(formattedRecords);
        }
        setLoading(false);
    };

    const filteredRecords = records.filter(r => 
        r.id_carro.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.serial_apertura.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.serial_cierre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const exportToCSV = () => {
        const headers = ['Fecha', 'Carro de Paro / Kit', 'Candado Abierto', 'Candado Cierre', 'Motivo', 'Responsable'];
        const csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(',') + '\n'
            + filteredRecords.map(r => {
                const date = new Date(r.fecha_hora_inicio).toLocaleDateString();
                return `${date},"${r.id_carro}","${r.serial_apertura}","${r.serial_cierre}","${r.motivo_apertura}","${r.responsable_usuario}"`;
            }).join('\n');
            
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "trazabilidad_candados.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700 h-[calc(100vh-8rem)] flex flex-col">
            <header className="flex justify-between items-end shrink-0">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-3">
                        <Lock className="text-primary" size={28} />
                        Trazabilidad de Candados
                    </h2>
                    <p className="text-slate-500 font-bold mt-1">Historial y seguimiento de bloqueos en Carros de Paro.</p>
                </div>
                <button 
                    onClick={exportToCSV}
                    className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-all shadow-sm"
                >
                    <FileDown size={16} />
                    Exportar CSV
                </button>
            </header>

            <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none overflow-hidden flex flex-col flex-1">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-4 bg-slate-50/50 dark:bg-slate-800/20 shrink-0">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-4 block" />
                        <input 
                            type="text" 
                            placeholder="Buscar por carro o serial..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                    </div>
                </div>
                
                <div className="flex-1 overflow-auto custom-scrollbar p-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                            <ShieldCheck className="animate-pulse size-8 mb-2 opacity-50" />
                            <p className="font-bold text-xs uppercase tracking-widest">Cargando registros...</p>
                        </div>
                    ) : filteredRecords.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                            <p className="font-bold text-xs uppercase tracking-widest">No hay registros de trazabilidad</p>
                        </div>
                    ) : (
                        <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
                            <thead>
                                <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-left">
                                    <th className="pb-4 px-4">Fecha Auditoría</th>
                                    <th className="pb-4 px-4">Kit / Carro de Paro</th>
                                    <th className="pb-4 px-4 hidden md:table-cell">Motivo</th>
                                    <th className="pb-4 px-4 text-center">Candado Abierto</th>
                                    <th className="pb-4 px-4 text-center">Candado Usado (Cierre)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                {filteredRecords.map((record) => (
                                    <tr key={record.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="py-4 px-4 text-sm font-bold text-slate-800 dark:text-slate-200">
                                            {format(new Date(record.fecha_hora_inicio), 'dd/MM/yyyy HH:mm')}
                                        </td>
                                        <td className="py-4 px-4">
                                            <p className="text-sm font-black text-slate-800 dark:text-white uppercase">
                                                {record.id_carro}
                                            </p>
                                            <p className="text-[10px] font-bold text-slate-400 mt-1">POR: {record.responsable_usuario}</p>
                                        </td>
                                        <td className="py-4 px-4 hidden md:table-cell">
                                            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                                {record.motivo_apertura}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-center">
                                            <div className="inline-flex items-center justify-center px-4 py-1.5 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-xl font-bold font-mono tracking-widest text-xs border border-red-100 dark:border-red-900/30">
                                                {record.serial_apertura || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 text-center">
                                            <div className="inline-flex flex-col items-center">
                                                <div className="inline-flex items-center justify-center px-4 py-1.5 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 rounded-xl font-bold font-mono tracking-widest text-xs border border-emerald-100 dark:border-emerald-900/30">
                                                    {record.serial_cierre || 'N/A'}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};
