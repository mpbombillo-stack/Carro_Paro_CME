import React, { useEffect, useState } from 'react';
import type { AuditHeader, MasterCart } from '../../types/audit';
import { supabase } from '../../lib/supabase';

interface Props {
    header: AuditHeader;
    onUpdate: (header: AuditHeader) => void;
}

export const AuditHeaderForm: React.FC<Props> = ({ header, onUpdate }) => {
    const [carts, setCarts] = useState<MasterCart[]>([]);
    
    useEffect(() => {
        const fetchCarts = async () => {
            const { data } = await supabase.from('master_carts').select('*');
            if (data) setCarts(data);
        };
        fetchCarts();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'id_carro') {
            const selectedCart = carts.find(c => c.name === value);
            onUpdate({ 
                ...header, 
                id_carro: value, 
                cart_id: selectedCart?.id 
            });
        } else {
            onUpdate({ ...header, [name]: value });
        }
    };

    // Get unique locations from carts
    const locations = Array.from(new Set(carts.map(c => c.location)));

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="flex flex-col gap-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] px-1" htmlFor="servicio_ubicacion">Servicio / Ubicación</label>
                <div className="relative group">
                    <select
                        id="servicio_ubicacion"
                        name="servicio_ubicacion"
                        value={header.servicio_ubicacion}
                        onChange={handleChange}
                        title="Seleccione el servicio o ubicación"
                        className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary/20 rounded-2xl text-sm font-bold text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 transition-all appearance-none outline-none"
                    >
                        <option value="">Seleccione Ubicación...</option>
                        {locations.map(loc => (
                            <option key={loc} value={loc}>{loc}</option>
                        ))}
                    </select>
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                        <span className="material-symbols-outlined">expand_more</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] px-1" htmlFor="id_carro">Identificador del Carro</label>
                <div className="relative group">
                    <select
                        id="id_carro"
                        name="id_carro"
                        value={header.id_carro}
                        onChange={handleChange}
                        title="Seleccione el carro o kit"
                        className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary/20 rounded-2xl text-sm font-bold text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 transition-all appearance-none outline-none"
                    >
                        <option value="">Seleccione Carro...</option>
                        {carts
                            .filter(c => !header.servicio_ubicacion || c.location === header.servicio_ubicacion)
                            .map(cart => (
                            <option key={cart.id} value={cart.name}>{cart.name}</option>
                        ))}
                    </select>
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                        <span className="material-symbols-outlined">expand_more</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] px-1">Responsable</label>
                <div className="flex items-center gap-4 p-4 bg-slate-100/50 dark:bg-slate-800/80 rounded-2xl border border-slate-200/50 dark:border-white/5">
                    <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-xl">person</span>
                    </div>
                    <span className="text-sm font-black text-slate-600 dark:text-slate-200">{header.responsable_usuario}</span>
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] px-1">Fecha de Auditoría</label>
                <div className="flex items-center gap-4 p-4 bg-slate-100/50 dark:bg-slate-800/80 rounded-2xl border border-slate-200/50 dark:border-white/5">
                    <div className="size-8 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500">
                        <span className="material-symbols-outlined text-xl">calendar_today</span>
                    </div>
                    <span className="text-sm font-black text-slate-600 dark:text-slate-200">
                        {new Date(header.fecha_hora_inicio).toLocaleDateString()}
                    </span>
                </div>
            </div>
        </div>
    );
};


