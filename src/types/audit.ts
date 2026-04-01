export type AuditStatus = 'ROJO' | 'AMARILLO' | 'VERDE';

export interface AuditHeader {
    id: string;
    fecha_hora_inicio: string;
    servicio_ubicacion: string;
    id_carro: string; // Name/Identifier for display
    cart_id?: string; // UUID for database relations
    responsable_usuario: string;
}

export interface AuditDetail {
    id: string; // Client-side temp ID
    audit_header_id: string;
    item_id?: string; // Reference to master_items.id
    descripcion: string;
    cantidad_estandar?: number; // Added for template reference
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
    revision_month?: string;
}

export interface CartItemTemplate {
    id: string;
    cart_id: string;
    master_item_id: string;
    standard_quantity: number;
    lote?: string;
    fecha_vencimiento_insumo?: string;
    registro_sanitario?: string;
    vencimiento_registro_sanitario?: string;
    master_item?: any;
}

export interface MasterUser {
    id: string;
    full_name: string;
    job_title: string;
    password?: string;
    profile: 'Administrador' | 'Auditor/Farmacia' | 'Enfermería';
    is_active?: boolean;
}
