import { useState } from 'react';
import { DashboardLayout } from '../layout/DashboardLayout';
import type { AuditVerificationData } from '../../types/audit';
import { AuditHeaderForm } from './AuditHeaderForm';
import { AuditDetailList } from './AuditDetailList';
import { CustodyForm } from './CustodyForm';
import { exportVerificationPDF } from '../../utils/pdf-generator';

interface DetailedAuditViewProps {
    data: AuditVerificationData;
    onUpdate: (data: AuditVerificationData) => void;
    onBack: () => void;
}

export function DetailedAuditView({ data, onUpdate, onBack }: DetailedAuditViewProps) {
    const [activeTab, setActiveTab] = useState<'info' | 'details' | 'custody'>('info');

    const handleHeaderUpdate = (header: any) => onUpdate({ ...data, header });
    const handleDetailsUpdate = (details: any) => onUpdate({ ...data, details });
    const handleCustodyUpdate = (custody: any) => onUpdate({ ...data, custody });

    const handleExport = async () => {
        try {
            await exportVerificationPDF(data);
        } catch (error) {
            console.error('Error exporting PDF:', error);
            alert('Error al exportar el PDF');
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
                    <button onClick={onBack} className="hover:text-primary transition-colors flex items-center gap-1">
                        <span className="material-symbols-outlined text-base">arrow_back</span>
                        Gestión de Carros
                    </button>
                    <span className="material-symbols-outlined text-base">chevron_right</span>
                    <span className="text-slate-900 dark:text-slate-100 font-medium whitespace-nowrap">Auditoría {data.header.id_carro}</span>
                </nav>

                {/* Page Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider">Auditoría en Progreso</span>
                            <span className="text-slate-400 dark:text-slate-500 text-xs font-medium">Iniciada: {new Date(data.header.fecha_hora_inicio).toLocaleString()}</span>
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Registro de Verificación</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Complete todos los pasos para finalizar el reporte ISO ADT-SRF-FR-025.</p>
                    </div>
                    <div className="flex gap-3 shrink-0">
                        <button 
                            onClick={handleExport}
                            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-lg hover:bg-slate-50 shadow-sm transition-all"
                        >
                            <span className="material-symbols-outlined text-xl">download</span>
                            Vista Previa
                        </button>
                        <button 
                            onClick={onBack}
                            className="flex items-center gap-2 px-6 py-2 bg-primary text-white font-bold rounded-lg hover:opacity-90 shadow-lg shadow-primary/20 transition-all"
                        >
                            <span className="material-symbols-outlined">check_circle</span>
                            Finalizar y Cerrar
                        </button>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="flex border-b border-slate-200 dark:border-slate-800 mb-8 overflow-x-auto scrollbar-hide">
                    <button 
                        onClick={() => setActiveTab('info')}
                        className={`px-6 py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                            activeTab === 'info' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <span className="material-symbols-outlined text-xl">info</span>
                        1. Información General
                    </button>
                    <button 
                        onClick={() => setActiveTab('details')}
                        className={`px-6 py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                            activeTab === 'details' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <span className="material-symbols-outlined text-xl">list_alt</span>
                        2. Verificación de Contenido
                        <span className="bg-primary/10 text-primary text-[10px] px-1.5 py-0.5 rounded-full ml-1">{data.details.length}</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('custody')}
                        className={`px-6 py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                            activeTab === 'custody' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <span className="material-symbols-outlined text-xl">verified_user</span>
                        3. Custodia y Firmas
                    </button>
                </div>

                {/* Tab Content */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden min-h-[500px]">
                    {activeTab === 'info' && (
                        <div className="p-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">edit_note</span>
                                Encabezado de la Auditoría
                            </h3>
                            <AuditHeaderForm header={data.header} onUpdate={handleHeaderUpdate} />
                            
                            <div className="mt-12 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                                <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-2 text-sm uppercase tracking-wider">
                                    <span className="material-symbols-outlined text-yellow-500">warning</span>
                                    Instrucciones de Verificación
                                </h4>
                                <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-2 list-disc ml-5">
                                    <li>Verifique que todos los sellos de seguridad estén intactos antes de registrar la apertura.</li>
                                    <li>Cualquier discrepancia en las cantidades debe ser justificada en las observaciones.</li>
                                    <li>Los medicamentos próximos a vencer (inferior a 6 meses) aparecerán resaltados en <span className="text-red-600 font-bold">ROJO</span>.</li>
                                </ul>
                            </div>
                        </div>
                    )}

                    {activeTab === 'details' && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex justify-between items-center">
                                <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">inventory</span>
                                    Inventario Detallado del Carro
                                </h3>
                                <div className="flex gap-2">
                                    <button className="p-2 text-slate-400 hover:text-primary transition-colors"><span className="material-symbols-outlined">filter_list</span></button>
                                    <button className="p-2 text-slate-400 hover:text-primary transition-colors"><span className="material-symbols-outlined">search</span></button>
                                </div>
                            </div>
                            <AuditDetailList details={data.details} onUpdate={handleDetailsUpdate} />
                        </div>
                    )}

                    {activeTab === 'custody' && (
                        <div className="p-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">shield</span>
                                Cierre de Auditoría y Custodia
                            </h3>
                            <CustodyForm custody={data.custody} onUpdate={handleCustodyUpdate} />
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}

