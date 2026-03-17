import React from 'react';
import type { AuditHeader } from '../../types/audit';

interface Props {
    header: AuditHeader;
    onUpdate: (header: AuditHeader) => void;
}

export const AuditHeaderForm: React.FC<Props> = ({ header, onUpdate }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        onUpdate({ ...header, [e.target.name]: e.target.value });
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider" htmlFor="servicio_ubicacion">Servicio / Ubicación</label>
                <select
                    id="servicio_ubicacion"
                    name="servicio_ubicacion"
                    value={header.servicio_ubicacion}
                    onChange={handleChange}
                    title="Seleccione el servicio o ubicación"
                    className="p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary shadow-inner transition-all appearance-none"
                >
                    <option value="">Seleccione...</option>
                    <option value="UCI Adultos">UCI Adultos</option>
                    <option value="Urgencias">Urgencias</option>
                    <option value="Consulta Externa">Consulta Externa</option>
                </select>
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider" htmlFor="id_carro">Identificador del Carro</label>
                <input
                    id="id_carro"
                    name="id_carro"
                    type="text"
                    value={header.id_carro}
                    onChange={handleChange}
                    placeholder="Ej: CP-082"
                    title="Ingrese el identificador del carro"
                    className="p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-mono font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary shadow-inner transition-all"
                />
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Responsable</label>
                <div className="flex items-center gap-2 p-3 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
                    <span className="material-symbols-outlined text-slate-400 text-lg">person</span>
                    <span className="text-sm font-bold text-slate-600 dark:text-slate-400">{header.responsable_usuario}</span>
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fecha de Apertura</label>
                <div className="flex items-center gap-2 p-3 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
                    <span className="material-symbols-outlined text-slate-400 text-lg">calendar_today</span>
                    <span className="text-sm font-mono text-slate-600 dark:text-slate-400">
                        {new Date(header.fecha_hora_inicio).toLocaleDateString()}
                    </span>
                </div>
            </div>
        </div>
    );
};

