export type AuditStatus = 'ROJO' | 'AMARILLO' | 'VERDE';

export type AuditHeader = {
    id: string;
    fecha_hora_inicio: string;
    fecha_hora_cierre?: string;
    servicio_ubicacion: string;
    id_carro: string;
    responsable_usuario: string;
};

export type AuditDetail = {
    id: string;
    audit_header_id: string;
    descripcion: string; // Principio Activo + Concentración + Forma Farmacéutica
    cantidad_fisica: number;
    lote: string;
    fecha_vencimiento_insumo: string;
    registro_sanitario: string; // 20XXM-XXXXXX
    vencimiento_registro_sanitario: string;
    estado_conformidad: boolean;
};

export type MotivoApertura = 'Revisión Rutinaria' | 'Emergencia/Código Azul' | 'Caducidad';

export type AuditCustody = {
    id: string;
    audit_header_id: string;
    serial_apertura: string;
    serial_cierre: string;
    motivo_apertura: MotivoApertura;
    firma_farmacia_img?: string; // Base64
    firma_enfermeria_img?: string; // Base64
    observacion_ruptura?: string;
};

export interface AuditVerificationData {
    header: AuditHeader;
    details: AuditDetail[];
    custody: AuditCustody;
}
