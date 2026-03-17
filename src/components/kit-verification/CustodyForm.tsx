import React, { useState, useEffect } from 'react';
import type { AuditCustody } from '../../types/audit';
import { SignaturePad } from './SignaturePad';
import { ShieldAlert } from 'lucide-react';

interface Props {
    custody: AuditCustody;
    onUpdate: (custody: AuditCustody) => void;
}

export const CustodyForm: React.FC<Props> = ({ custody, onUpdate }) => {
    const [lastClosingSeal] = useState("SANT-2026-X1");
    const [misaligned, setMisaligned] = useState(false);

    useEffect(() => {
        if (custody.serial_apertura && custody.serial_apertura !== lastClosingSeal) {
            setMisaligned(true);
        } else {
            setMisaligned(false);
        }
    }, [custody.serial_apertura, lastClosingSeal]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        onUpdate({ ...custody, [e.target.name]: e.target.value });
    };

    const handleSignature = (field: 'firma_farmacia_img' | 'firma_enfermeria_img', data: string) => {
        onUpdate({ ...custody, [field]: data });
    };

    return (
        <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">key</span>
                        Precinto Encontrado
                    </label>
                    <input
                        name="serial_apertura"
                        type="text"
                        value={custody.serial_apertura}
                        onChange={handleChange}
                        className={`p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-mono font-bold focus:ring-2 focus:ring-primary shadow-inner transition-all ${
                            misaligned ? 'text-red-600 bg-red-50 dark:bg-red-900/20' : 'text-slate-900 dark:text-slate-100'
                        }`}
                        title="Ingrese el serial del precinto encontrado"
                        placeholder="Ej: SANT-2026-X1"
                    />
                    {misaligned && (
                        <p className="text-[10px] text-red-500 font-bold flex items-center gap-1 mt-1">
                            <ShieldAlert size={12} /> DISCREPANCIA CON EL CIERRE ANTERIOR ({lastClosingSeal})
                        </p>
                    )}
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">lock</span>
                        Nuevo Precinto
                    </label>
                    <input
                        name="serial_cierre"
                        type="text"
                        value={custody.serial_cierre}
                        onChange={handleChange}
                        className="p-4 bg-emerald-50/50 dark:bg-emerald-900/10 border-none rounded-2xl text-sm font-mono font-bold text-emerald-700 dark:text-emerald-400 focus:ring-2 focus:ring-emerald-500 shadow-inner transition-all"
                        title="Ingrese el serial del nuevo precinto"
                        placeholder="Ej: SANT-2026-Y2"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">assignment_late</span>
                        Motivo Apertura
                    </label>
                    <select
                        name="motivo_apertura"
                        value={custody.motivo_apertura}
                        onChange={handleChange}
                        title="Seleccione el motivo de apertura"
                        className="p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary shadow-inner transition-all appearance-none"
                    >
                        <option value="Revisión Rutinaria">Revisión Rutinaria</option>
                        <option value="Emergencia/Código Azul">Emergencia/Código Azul</option>
                        <option value="Caducidad">Caducidad</option>
                    </select>
                </div>
            </div>

            {misaligned && (
                <div className="p-6 bg-red-50 dark:bg-red-900/10 border-2 border-red-200 dark:border-red-900/30 rounded-2xl animate-in zoom-in-95 duration-200">
                    <label className="text-xs font-black text-red-700 dark:text-red-400 uppercase tracking-widest block mb-3">Observación de Ruptura (Obligatorio)</label>
                    <textarea
                        name="observacion_discrepancia"
                        value={custody.observacion_discrepancia || ''}
                        onChange={handleChange}
                        rows={3}
                        className="w-full p-4 bg-white dark:bg-slate-900 border-none rounded-xl text-sm italic text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-red-500 shadow-sm"
                        title="Describa el hallazgo o motivo por el cual el precinto no coincide"
                        placeholder="Describa el hallazgo o motivo por el cual el precinto no coincide..."
                    />
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <SignaturePad
                    title="Firma Jefe de Farmacia"
                    onSave={(img) => handleSignature('firma_farmacia_img', img)}
                />
                <SignaturePad
                    title="Firma Responsable Servicio"
                    onSave={(img) => handleSignature('firma_enfermeria_img', img)}
                />
            </div>
        </div>
    );
};

