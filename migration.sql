-- Migration for Kit Verification (Carro de Paro) - Clínica Santillana
-- Status: Draft ISO ADT-SRF-FR-025

-- 0. Institutional Settings
CREATE TABLE IF NOT EXISTS ips_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT 'Clínica Santillana',
  logo_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

-- 2. Master Table for Items (Medicaments/Supplies)
CREATE TABLE IF NOT EXISTS master_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description TEXT NOT NULL,
  presentation TEXT, -- Ampolla x 1ml, etc.
  invima_registry TEXT NOT NULL,
  invima_expiration DATE, -- When the registry expires
  standard_quantity INTEGER NOT NULL DEFAULT 1,
  category TEXT, -- Medicamento, Dispositivo, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Master Table for Carts/Kits
CREATE TABLE IF NOT EXISTS master_carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, -- e.g. "Carro CP-082"
  location TEXT NOT NULL, -- e.g. "Urgencias"
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Detalle del Ítem (AuditDetail) - Validación Farmacéutica
CREATE TABLE IF NOT EXISTS audit_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  header_id UUID REFERENCES audit_headers(id) ON DELETE CASCADE,
  item_id UUID REFERENCES master_items(id), -- Link to master item
  description TEXT NOT NULL, -- Snapshot of description
  quantity INTEGER NOT NULL,
  lot TEXT NOT NULL,
  expiration_date DATE NOT NULL,
  invima_registry TEXT NOT NULL, -- Snapshot
  invima_expiration DATE NOT NULL,
  is_conform BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Custodia y Seguridad (AuditCustody)
CREATE TABLE IF NOT EXISTS audit_custody (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  header_id UUID REFERENCES audit_headers(id) ON DELETE CASCADE,
  opening_seal TEXT NOT NULL,
  closing_seal TEXT NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN ('Revisión Rutinaria', 'Emergencia/Código Azul', 'Caducidad')),
  observation_mismatch TEXT,
  pharmacy_signature TEXT, -- Store as Base64 or URL
  nursing_signature TEXT,   -- Store as Base64 or URL
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_audit_cart ON audit_headers(cart_id);
CREATE INDEX IF NOT EXISTS idx_audit_header ON audit_details(header_id);
CREATE INDEX IF NOT EXISTS idx_master_items_desc ON master_items(description);

-- 6. Master Table for Users
CREATE TABLE IF NOT EXISTS master_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  job_title TEXT NOT NULL, -- Cargo (Nurse, Pharmacist, etc)
  profile TEXT NOT NULL CHECK (profile IN ('Administrador', 'Auditor/Farmacia', 'Enfermería')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_master_users_name ON master_users(full_name);
