import React, { useState, useEffect } from 'react';
import type { AuditDetail, MasterItem } from '../../types/audit';
import { getTrafficLightStatus, getTrafficLightColor } from '../../utils/semaforizacion';
import { CheckSquare, Plus, Trash2, Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Props {
    details: AuditDetail[];
    onUpdate: (details: AuditDetail[]) => void;
}

export const AuditDetailList: React.FC<Props> = ({ details, onUpdate }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<MasterItem[]>([]);
    const [showSearch, setShowSearch] = useState(false);

    useEffect(() => {
        if (searchTerm.length > 2) {
            const search = async () => {
                const { data } = await supabase
                    .from('master_items')
                    .select('*')
                    .ilike('description', `%${searchTerm}%`)
                    .limit(5);
                if (data) setSearchResults(data);
            };
            search();
        } else {
            setSearchResults([]);
        }
    }, [searchTerm]);

    const handleUpdateItem = (id: string, field: string, value: any) => {
        const updated = details.map(item => item.id === id ? { ...item, [field]: value } : item);
        onUpdate(updated);
    };

    const handleRemoveItem = (id: string) => {
        onUpdate(details.filter(i => i.id !== id));
    };

    const handleAddItem = (master: MasterItem) => {
        const newItem: AuditDetail = {
            id: 'NEW-' + Date.now(),
            audit_header_id: '',
            descripcion: master.description,
            cantidad_fisica: master.standard_quantity,
            lote: '',
            fecha_vencimiento_insumo: '',
            registro_sanitario: master.invima_registry,
            vencimiento_registro_sanitario: '',
            estado_conformidad: true
        };
        onUpdate([...details, newItem]);
        setShowSearch(false);
        setSearchTerm('');
    };

    return (
        <div className="space-y-4">
            <div className="overflow-x-auto bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                <table className="min-w-full border-collapse divide-y divide-slate-200 dark:divide-slate-800">
                    <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest">
                            <th className="px-6 py-4 text-left">Descripción / Producto</th>
                            <th className="px-4 py-4 text-center">Cant.</th>
                            <th className="px-4 py-4 text-left">Lote</th>
                            <th className="px-4 py-4 text-left">Vencimiento</th>
                            <th className="px-4 py-4 text-center">Semaforización</th>
                            <th className="px-6 py-4 text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {details.map((item) => {
                            const status = getTrafficLightStatus(item.fecha_vencimiento_insumo, item.vencimiento_registro_sanitario);
                            const statusColor = getTrafficLightColor(status);

                            return (
                                <tr key={item.id} className={`${status === 'ROJO' ? 'bg-red-50/50' : 'hover:bg-slate-50/[0.3]'} transition-colors`}>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-black text-slate-800 dark:text-slate-100">{item.descripcion}</p>
                                        <p className="text-[10px] font-bold text-primary uppercase mt-0.5">{item.registro_sanitario}</p>
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        <input
                                            type="number"
                                            value={item.cantidad_fisica}
                                            onChange={(e) => handleUpdateItem(item.id, 'cantidad_fisica', parseInt(e.target.value))}
                                            title="Cantidad física"
                                            className="w-14 p-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-center text-sm font-black focus:ring-2 focus:ring-primary/20 outline-none"
                                        />
                                    </td>
                                    <td className="px-4 py-4">
                                        <input
                                            type="text"
                                            value={item.lote}
                                            onChange={(e) => handleUpdateItem(item.id, 'lote', e.target.value)}
                                            placeholder="LOTE"
                                            title="Lote"
                                            className="w-24 p-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-xs font-mono font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                                        />
                                    </td>
                                    <td className="px-4 py-4">
                                        <input
                                            type="date"
                                            value={item.fecha_vencimiento_insumo}
                                            onChange={(e) => handleUpdateItem(item.id, 'fecha_vencimiento_insumo', e.target.value)}
                                            title="Fecha vencimiento"
                                            className="p-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-[10px] font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                                        />
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        <div className="flex flex-col items-center gap-1">
                                            <div className={`size-3 rounded-full ${statusColor} ring-4 ring-${statusColor}/10`} />
                                            <span className={`text-[8px] font-black uppercase ${status === 'ROJO' ? 'text-red-600' : 'text-slate-400'}`}>
                                                {status}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center items-center gap-2">
                                            <button 
                                                onClick={() => handleUpdateItem(item.id, 'estado_conformidad', !item.estado_conformidad)}
                                                className={`p-2 rounded-xl transition-all ${item.estado_conformidad ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-100 text-slate-300'}`}
                                                title="Conformidad"
                                            >
                                                <CheckSquare size={18} fill={item.estado_conformidad ? 'currentColor' : 'none'} fillOpacity={0.2} />
                                            </button>
                                            <button 
                                                onClick={() => handleRemoveItem(item.id)}
                                                className="p-2 bg-red-50 text-red-400 hover:text-red-600 rounded-xl transition-all"
                                                title="Eliminar"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="relative">
                {showSearch ? (
                    <div className="absolute bottom-full left-0 w-full mb-2 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden animate-in slide-in-from-bottom-2 duration-300 z-50">
                        <div className="p-4 border-b border-slate-50 dark:border-slate-800 flex items-center gap-3">
                            <Search size={18} className="text-slate-400" />
                            <input 
                                autoFocus
                                type="text"
                                placeholder="Escribe el nombre del medicamento..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full bg-transparent border-none text-sm font-bold outline-none"
                            />
                            <button onClick={() => setShowSearch(false)} className="text-xs font-black text-slate-400 hover:text-slate-600">CERRAR</button>
                        </div>
                        <div className="max-h-60 overflow-y-auto">
                            {searchResults.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => handleAddItem(item)}
                                    className="w-full text-left p-4 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between group transition-colors"
                                >
                                    <div>
                                        <p className="text-sm font-black text-slate-700 dark:text-slate-200">{item.description}</p>
                                        <p className="text-[10px] text-slate-400 uppercase font-bold">{item.invima_registry}</p>
                                    </div>
                                    <Plus size={16} className="text-slate-300 group-hover:text-primary" />
                                </button>
                            ))}
                            {searchTerm.length > 2 && searchResults.length === 0 && (
                                <div className="p-8 text-center text-slate-400 font-bold text-xs uppercase tracking-widest">
                                    No se encontraron resultados
                                </div>
                            )}
                        </div>
                    </div>
                ) : null}
                
                <button 
                    onClick={() => setShowSearch(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 dark:shadow-none hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                    <Plus size={16} />
                    Agregar Medicamento del Catálogo
                </button>
            </div>
        </div>
    );
};


