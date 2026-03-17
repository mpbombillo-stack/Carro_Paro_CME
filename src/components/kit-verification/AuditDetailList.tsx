import React from 'react';
import type { AuditDetail } from '../../types/audit';
import { getTrafficLightStatus, getTrafficLightColor } from '../../utils/semaforizacion';
import { AlertTriangle, CheckSquare } from 'lucide-react';

interface Props {
    details: AuditDetail[];
    onUpdate: (details: AuditDetail[]) => void;
}

export const AuditDetailList: React.FC<Props> = ({ details, onUpdate }) => {
    const handleUpdateItem = (id: string, field: string, value: any) => {
        const updated = details.map(item => item.id === id ? { ...item, [field]: value } : item);
        onUpdate(updated);
    };

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full border-collapse divide-y divide-slate-200 dark:divide-slate-800">
                <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                        <th className="px-6 py-4 text-left">Descripción / Producto</th>
                        <th className="px-4 py-4 text-center">Cant. Física</th>
                        <th className="px-4 py-4 text-left">Lote</th>
                        <th className="px-4 py-4 text-left">Vencimiento</th>
                        <th className="px-4 py-4 text-left">Reg. Sanitario</th>
                        <th className="px-4 py-4 text-center">Semaforización</th>
                        <th className="px-6 py-4 text-center whitespace-nowrap">Conformidad</th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800">
                    {details.map((item) => {
                        const status = getTrafficLightStatus(item.fecha_vencimiento_insumo, item.vencimiento_registro_sanitario);
                        const statusColor = getTrafficLightColor(status);

                        return (
                            <tr key={item.id} className={`${status === 'ROJO' ? 'bg-red-50/30' : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/30'} transition-colors`}>
                                <td className="px-6 py-4">
                                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{item.descripcion}</p>
                                </td>
                                <td className="px-4 py-4 text-center">
                                    <input
                                        type="number"
                                        value={item.cantidad_fisica}
                                        onChange={(e) => handleUpdateItem(item.id, 'cantidad_fisica', parseInt(e.target.value))}
                                        title="Cantidad física encontrada"
                                        className="w-16 p-1.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded text-center text-sm font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    />
                                </td>
                                <td className="px-4 py-4">
                                    <input
                                        type="text"
                                        value={item.lote}
                                        onChange={(e) => handleUpdateItem(item.id, 'lote', e.target.value)}
                                        title="Lote del producto"
                                        className="p-1.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded w-28 text-sm font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    />
                                </td>
                                <td className="px-4 py-4">
                                    <input
                                        type="date"
                                        value={item.fecha_vencimiento_insumo}
                                        onChange={(e) => handleUpdateItem(item.id, 'fecha_vencimiento_insumo', e.target.value)}
                                        title="Fecha de vencimiento"
                                        className="p-1.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded text-xs font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    />
                                </td>
                                <td className="px-4 py-4">
                                    <input
                                        type="text"
                                        value={item.registro_sanitario}
                                        onChange={(e) => handleUpdateItem(item.id, 'registro_sanitario', e.target.value)}
                                        title="Registro sanitario"
                                        className="p-1.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded w-36 text-xs font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    />
                                </td>
                                <td className="px-4 py-4">
                                    <div className="flex flex-col items-center gap-1">
                                        <div className={`w-3 h-3 rounded-full ${statusColor} shadow-sm shadow-${statusColor}/50`} />
                                        <span className={`text-[9px] font-black tracking-tighter ${status === 'ROJO' ? 'text-red-600' : 'text-slate-400'}`}>
                                            {status}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex justify-center items-center gap-3">
                                        <button 
                                            onClick={() => handleUpdateItem(item.id, 'estado_conformidad', !item.estado_conformidad)}
                                            title={item.estado_conformidad ? "Marcar como no conforme" : "Marcar como conforme"}
                                            className={`p-1 rounded transition-colors ${item.estado_conformidad ? 'text-emerald-500 hover:bg-emerald-50' : 'text-slate-300 hover:bg-slate-50'}`}
                                        >
                                            <CheckSquare size={22} fill={item.estado_conformidad ? 'currentColor' : 'none'} fillOpacity={0.1} />
                                        </button>
                                        {status === 'ROJO' && (
                                            <AlertTriangle size={18} className="text-red-500 animate-pulse" />
                                        )}
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

