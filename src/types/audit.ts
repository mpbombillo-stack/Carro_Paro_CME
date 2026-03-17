export type AuditStatus = 'ROJO' | 'AMARILLO' | 'VERDE';

export interface AuditHeader {
    id: string;
    fecha_hora_inicio: string;
    servicio_ubicacion: string;
    id_carro: string;
    responsable_usuario: string;
}

export interface AuditDetail {
    id: string;
    audit_header_id: string;
    descripcion: string;
    cantidad_fisica: number;
    lote: string;
    fecha_vencimiento_insumo: string;
    registro_sanitario: string;
    vencimiento_registro_sanitario: string;
    estado_conformidad: boolean;
}

export interface AuditCustody {
    id: string;
    audit_header_id: string;
    serial_apertura: string;
    serial_cierre: string;
    motivo_apertura: 'Revisión Rutinaria' | 'Emergencia/Código Azul' | 'Caducidad';
    observacion_discrepancia?: string;
    firma_farmacia_img?: string;
    firma_enfermeria_img?: string;
}

export interface AuditVerificationData {
    header: AuditHeader;
    details: AuditDetail[];
    custody: AuditCustody;
}

// Master Data Types
export interface IPSSettings {
    id: string;
    name: string;
    logo_url?: string;
}

export interface MasterItem {
    id: string;
    description: string;
    presentation?: string;
    invima_registry: string;
    invima_expiration?: string;
    standard_quantity: number;
    category: string;
}

export interface MasterCart {
    id: string;
    name: string;
    location: string;
}
