-- Migration for Kit Verification (Carro de Paro) - Clínica Santillana
-- Status: Draft ISO ADT-SRF-FR-025

-- 1. Cabecera de Auditoría (AuditHeader)
CREATE TABLE IF NOT EXISTS audit_headers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  start_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_at TIMESTAMP WITH TIME ZONE,
  service_location TEXT NOT NULL,
  cart_id TEXT NOT NULL,
  auditor_user TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Detalle del Ítem (AuditDetail) - Validación Farmacéutica
CREATE TABLE IF NOT EXISTS audit_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  header_id UUID REFERENCES audit_headers(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  lot TEXT NOT NULL,
  expiration_date DATE NOT NULL,
  invima_registry TEXT NOT NULL,
  invima_expiration DATE NOT NULL,
  is_conform BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Custodia y Seguridad (AuditCustody)
CREATE TABLE IF NOT EXISTS audit_custody (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  header_id UUID REFERENCES audit_headers(id) ON DELETE CASCADE,
  opening_seal TEXT NOT NULL,
  closing_seal TEXT NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN ('Revisión Rutinaria', 'Emergencia/Código Azul', 'Caducidad')),
  observation_mismatch TEXT,
  pharmacy_signature TEXT, -- Store as Base64 or URL if using Storage
  nursing_signature TEXT,   -- Store as Base64 or URL if using Storage
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for performance on searches by cart
CREATE INDEX IF NOT EXISTS idx_audit_cart ON audit_headers(cart_id);
CREATE INDEX IF NOT EXISTS idx_audit_header ON audit_details(header_id);
