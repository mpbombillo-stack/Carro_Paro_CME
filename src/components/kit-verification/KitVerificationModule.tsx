import React, { useState } from 'react';
import { GeneralRevisionView } from './GeneralRevisionView';
import { DetailedAuditView } from './DetailedAuditView';
import type { AuditVerificationData } from '../../types/audit';

export const KitVerificationModule: React.FC = () => {
    const [view, setView] = useState<'list' | 'detail'>('list');
    const [auditData, setAuditData] = useState<AuditVerificationData>({
        header: {
            id: 'AUD-TEMP',
            fecha_hora_inicio: new Date().toISOString(),
            servicio_ubicacion: 'Urgencias',
            id_carro: 'CP-082',
            responsable_usuario: 'Dr. Rodríguez'
        },
        details: [
            { id: '1', audit_header_id: '', descripcion: 'Adrenalina 1mg/ml - Ampolla x 1ml', cantidad_fisica: 10, lote: 'LOT-2023-A', fecha_vencimiento_insumo: '2023-09-15', registro_sanitario: 'INVIMA 2018M-0012', vencimiento_registro_sanitario: '2028-10-20', estado_conformidad: true },
            { id: '2', audit_header_id: '', descripcion: 'Amiodarona 150mg/3ml - Ampolla x 3ml', cantidad_fisica: 6, lote: 'XJ-99812', fecha_vencimiento_insumo: '2023-11-20', registro_sanitario: 'INVIMA 2015M-0082', vencimiento_registro_sanitario: '2025-05-12', estado_conformidad: false },
        ],
        custody: {
            id: 'CUST-TEMP',
            audit_header_id: '',
            serial_apertura: 'SANT-2026-X1',
            serial_cierre: '',
            motivo_apertura: 'Revisión Rutinaria'
        }
    });

    if (view === 'detail') {
        return (
            <DetailedAuditView 
                data={auditData} 
                onUpdate={setAuditData}
                onBack={() => setView('list')} 
            />
        );
    }

    return <GeneralRevisionView onNavigateToDetail={() => setView('detail')} />;
};

