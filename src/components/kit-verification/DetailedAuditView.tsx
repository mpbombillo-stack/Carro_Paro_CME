import { useState, useEffect } from 'react';
import type { AuditVerificationData } from '../../types/audit';
import { AuditHeaderForm } from './AuditHeaderForm';
import { AuditDetailList } from './AuditDetailList';
import { CustodyForm } from './CustodyForm';
import { exportVerificationPDF } from '../../utils/pdf-generator';
import { supabase } from '../../lib/supabase';
import { CheckCircle, Download, ArrowLeft, Info, ListChecks, ShieldCheck, FileText, LayoutGrid, Search, Shield } from 'lucide-react';

interface DetailedAuditViewProps {
    data: AuditVerificationData;
    onUpdate: (data: AuditVerificationData) => void;
    onBack: () => void;
}

export function DetailedAuditView({ data, onUpdate, onBack }: DetailedAuditViewProps) {
    const [activeTab, setActiveTab] = useState<'info' | 'details' | 'custody'>('info');
    const [saving, setSaving] = useState(false);

    const handleHeaderUpdate = (header: any) => onUpdate({ ...data, header });
    const handleDetailsUpdate = (details: any) => onUpdate({ ...data, details });
    const handleCustodyUpdate = (custody: any) => onUpdate({ ...data, custody });
    
    // Auto-load template when cart is selected
    useEffect(() => {
        const loadTemplate = async () => {
            const cartUuid = data.header.cart_id;
            if (cartUuid && data.details.length === 0) {
                const { data: template, error } = await supabase
                    .from('cart_items_template')
                    .select('*, master_items(*)')
                    .eq('cart_id', cartUuid);
                
                if (error) {
                    console.warn('No se pudo cargar la plantilla (posible tabla inexistente):', error.message);
                    return;
                }
                
                if (template && template.length > 0) {
                    const initialDetails = template.map((t: any) => ({
                        id: Math.random().toString(36).substr(2, 9),
                        item_id: t.master_item_id,
                        descripcion: t.master_items.description,
                        cantidad_estandar: t.standard_quantity,
                        cantidad_fisica: 0,
                        lote: '',
                        fecha_vencimiento_insumo: '',
                        registro_sanitario: t.master_items.invima_registry,
                        vencimiento_registro_sanitario: '',
                        estado_conformidad: false
                    }));
                    handleDetailsUpdate(initialDetails);
                }
            }
        };

        loadTemplate();
    }, [data.header.id_carro, data.header.cart_id]);

    const handleExport = async () => {
        try {
            await exportVerificationPDF(data);
        } catch (error) {
            console.error('Error exporting PDF:', error);
            alert('Error al exportar el PDF');
        }
    };

    const handleFinish = async () => {
        setSaving(true);
        try {
            // 1. Save Header
            const { data: headerData, error: headerError } = await supabase
                .from('audit_headers')
                .insert([{
                    fecha_hora_inicio: data.header.fecha_hora_inicio,
                    fecha_hora_fin: new Date().toISOString(),
                    servicio_ubicacion: data.header.servicio_ubicacion,
                    id_carro: data.header.id_carro,
                    responsable_usuario: data.header.responsable_usuario
                }])
                .select()
                .single();

            if (headerError) throw headerError;

            const headerId = headerData.id;

            // 2. Save Details
            const detailsToInsert = data.details.map(d => ({
                audit_header_id: headerId,
                item_id: d.item_id,
                descripcion: d.descripcion,
                cantidad_fisica: d.cantidad_fisica,
                lote: d.lote || 'N/A',
                fecha_vencimiento_insumo: d.fecha_vencimiento_insumo || new Date().toISOString().split('T')[0],
                registro_sanitario: d.registro_sanitario,
                vencimiento_registro_sanitario: d.vencimiento_registro_sanitario || new Date().toISOString().split('T')[0],
                estado_conformidad: d.estado_conformidad
            }));

            const { error: detailsError } = await supabase
                .from('audit_details')
                .insert(detailsToInsert);

            if (detailsError) throw detailsError;

            // 3. Save Custody
            const { error: custodyError } = await supabase
                .from('audit_custody')
                .insert([{
                    audit_header_id: headerId,
                    serial_apertura: data.custody.serial_apertura,
                    serial_cierre: data.custody.serial_cierre,
                    motivo_apertura: data.custody.motivo_apertura,
                    observacion_discrepancia: data.custody.observacion_discrepancia,
                    firma_farmacia_img: data.custody.firma_farmacia_img,
                    firma_enfermeria_img: data.custody.firma_enfermeria_img
                }]);

            if (custodyError) throw custodyError;

            alert('Auditoría guardada exitosamente');
            onBack();
        } catch (error: any) {
            console.error('Error saving audit:', error);
            alert('Error al guardar la auditoría: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6 font-bold">
                <button onClick={onBack} className="hover:text-primary transition-colors flex items-center gap-1 uppercase tracking-widest text-[10px]" title="Volver al listado">
                    <ArrowLeft size={14} />
                    Gestión de Carros
                </button>
                <span className="text-slate-300">/</span>
                <span className="text-slate-900 dark:text-slate-100 font-black whitespace-nowrap uppercase tracking-widest text-[10px]">Auditoría {data.header.id_carro}</span>
            </nav>

            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider">Auditoría en Progreso</span>
                        <span className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-tighter">Iniciada: {new Date(data.header.fecha_hora_inicio).toLocaleString()}</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tighter">Registro de Verificación</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Protocolo ISO ADT-SRF-FR-025 - Gestión de Calidad Clínica.</p>
                </div>
                <div className="flex gap-3 shrink-0">
                    <button 
                        onClick={handleExport}
                        className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-slate-50 shadow-sm transition-all"
                        title="Exportar auditoría a PDF"
                    >
                        <Download size={18} />
                        VISTA PREVIA
                    </button>
                    <button 
                        onClick={handleFinish}
                        disabled={saving}
                        className="flex items-center gap-2 px-8 py-3 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:opacity-90 shadow-xl shadow-primary/20 transition-all disabled:opacity-50"
                        title="Confirmar y guardar auditoría"
                    >
                        <CheckCircle size={18} />
                        {saving ? 'GUARDANDO...' : 'FINALIZAR Y CERRAR'}
                    </button>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 mb-8 overflow-x-auto scrollbar-hide">
                <button 
                    onClick={() => setActiveTab('info')}
                    className={`px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 border-b-2 transition-all whitespace-nowrap ${
                        activeTab === 'info' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                    title="Información general"
                >
                    <Info size={18} />
                    1. Información
                </button>
                <button 
                    onClick={() => setActiveTab('details')}
                    className={`px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 border-b-2 transition-all whitespace-nowrap ${
                        activeTab === 'details' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                    title="Lista de verificación"
                >
                    <ListChecks size={18} />
                    2. Verificación
                    <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full ml-1">{data.details.length}</span>
                </button>
                <button 
                    onClick={() => setActiveTab('custody')}
                    className={`px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 border-b-2 transition-all whitespace-nowrap ${
                        activeTab === 'custody' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                    title="Custodia y sellos"
                >
                    <ShieldCheck size={18} />
                    3. Custodia
                </button>
            </div>


            {/* Tab Content */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden min-h-[500px]">
                {activeTab === 'info' && (
                    <div className="p-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
                            <FileText className="text-primary" size={20} />
                            Encabezado de la Auditoría
                        </h3>
                        <AuditHeaderForm header={data.header} onUpdate={handleHeaderUpdate} />
                        
                        <div className="mt-12 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                            <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-2 text-sm uppercase tracking-wider">
                                <Info className="text-yellow-500" size={18} />
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
                        <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex justify-between items-center">
                            <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                <LayoutGrid className="text-primary" size={20} />
                                Inventario Detallado del Carro
                            </h3>
                            <div className="flex gap-2">
                                <button className="p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-slate-400 hover:text-primary transition-all shadow-sm" title="Filtrar"><Search size={18} /></button>
                                <button className="p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-slate-400 hover:text-primary transition-all shadow-sm" title="Columnas"><LayoutGrid size={18} /></button>
                            </div>
                        </div>
                        <AuditDetailList details={data.details} onUpdate={handleDetailsUpdate} />
                    </div>
                )}

                {activeTab === 'custody' && (
                    <div className="p-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
                            <Shield className="text-primary" size={20} />
                            Cierre de Auditoría y Custodia
                        </h3>
                        <CustodyForm custody={data.custody} onUpdate={handleCustodyUpdate} />
                    </div>
                )}
            </div>
        </div>
    );
}

