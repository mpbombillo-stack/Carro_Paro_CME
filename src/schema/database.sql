-- Schema for Kit Verification (Carro de Paro)
-- Clínica Santillana (ADT-SRF-FR-025)

-- AUDIT HEADER
CREATE TABLE audit_header (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fecha_hora_inicio TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_hora_cierre TIMESTAMP WITH TIME ZONE,
    servicio_ubicacion TEXT NOT NULL,
    id_carro TEXT NOT NULL,
    responsable_usuario TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AUDIT DETAIL (Pharmaceutical Validation)
CREATE TABLE audit_detail (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    audit_header_id UUID REFERENCES audit_header(id) ON DELETE CASCADE,
    descripcion TEXT NOT NULL, -- "Principio Activo + Concentración + Forma Farmacéutica"
    cantidad_fisica INTEGER NOT NULL,
    lote TEXT NOT NULL,
    fecha_vencimiento_insumo DATE NOT NULL,
    registro_sanitario TEXT NOT NULL, -- Format Validation: 20XXM-XXXXXX
    vencimiento_registro_sanitario DATE NOT NULL,
    estado_conformidad BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CUSTODY AND SECURITY
CREATE TABLE audit_custody (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    audit_header_id UUID REFERENCES audit_header(id) ON DELETE CASCADE,
    serial_apertura TEXT NOT NULL, -- Must match previous serial_cierre
    serial_cierre TEXT NOT NULL,   -- New seal
    motivo_apertura TEXT CHECK (motivo_apertura IN ('Revisión Rutinaria', 'Emergencia/Código Azul', 'Caducidad')),
    firma_farmacia_img TEXT, -- Base64 encoded or URL
    firma_enfermeria_img TEXT, -- Base64 encoded or URL
    observacion_ruptura TEXT, -- Required if serials don't match
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- View for Traffic Light System (Semaforización Logic)
-- Rosso: < 6 months
-- Amarillo: 6-12 months
-- Verde: > 12 months
-- This can be handled in the frontend for real-time alerts or as a virtual column.
