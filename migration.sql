-- Migration for Kit Verification (Carro de Paro) - Clínica Santillana
-- Status: Production ISO ADT-SRF-FR-025

-- 0. Institutional Settings
CREATE TABLE IF NOT EXISTS ips_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT 'Clínica Santillana',
  logo_url TEXT,
  config JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1. Cabecera de Auditoría (AuditHeader)
CREATE TABLE IF NOT EXISTS audit_headers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha_hora_inicio TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_hora_fin TIMESTAMP WITH TIME ZONE,
  servicio_ubicacion TEXT NOT NULL,
  id_carro TEXT NOT NULL,
  responsable_usuario TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure columns exist if table was created previously
DO $$ 
BEGIN 
    -- audit_headers
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='audit_headers' AND column_name='id_carro') THEN
        ALTER TABLE audit_headers ADD COLUMN id_carro TEXT;
    END IF;

    -- audit_details
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='audit_details' AND column_name='audit_header_id') THEN
        ALTER TABLE audit_details ADD COLUMN audit_header_id UUID REFERENCES audit_headers(id) ON DELETE CASCADE;
    END IF;

    -- audit_custody
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='audit_custody' AND column_name='audit_header_id') THEN
        ALTER TABLE audit_custody ADD COLUMN audit_header_id UUID REFERENCES audit_headers(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 2. Master Table for Items (Medicaments/Supplies)
CREATE TABLE IF NOT EXISTS master_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description TEXT NOT NULL,
  presentation TEXT,
  invima_registry TEXT NOT NULL,
  invima_expiration DATE,
  standard_quantity INTEGER NOT NULL DEFAULT 1,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Master Table for Carts/Kits
CREATE TABLE IF NOT EXISTS master_carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  revision_month TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure revision_month exists if table was created previously
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='master_carts' AND column_name='revision_month') THEN
        ALTER TABLE master_carts ADD COLUMN revision_month TEXT;
    END IF;
END $$;

-- 4. Detalle del Ítem (AuditDetail)
CREATE TABLE IF NOT EXISTS audit_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_header_id UUID REFERENCES audit_headers(id) ON DELETE CASCADE,
  item_id UUID REFERENCES master_items(id),
  descripcion TEXT NOT NULL,
  cantidad_fisica INTEGER NOT NULL,
  lote TEXT NOT NULL,
  fecha_vencimiento_insumo DATE NOT NULL,
  registro_sanitario TEXT NOT NULL,
  vencimiento_registro_sanitario DATE NOT NULL,
  estado_conformidad BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Custodia y Seguridad (AuditCustody)
CREATE TABLE IF NOT EXISTS audit_custody (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_header_id UUID REFERENCES audit_headers(id) ON DELETE CASCADE,
  serial_apertura TEXT NOT NULL,
  serial_cierre TEXT NOT NULL,
  motivo_apertura TEXT NOT NULL CHECK (motivo_apertura IN ('Revisión Rutinaria', 'Emergencia/Código Azul', 'Caducidad')),
  observacion_discrepancia TEXT,
  firma_farmacia_img TEXT, 
  firma_enfermeria_img TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_audit_cart ON audit_headers(id_carro);
CREATE INDEX IF NOT EXISTS idx_audit_header ON audit_details(audit_header_id);
CREATE INDEX IF NOT EXISTS idx_master_items_desc ON master_items(description);

-- 6. Master Table for Users
CREATE TABLE IF NOT EXISTS master_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  job_title TEXT NOT NULL,
  password TEXT DEFAULT '1234',
  profile TEXT NOT NULL CHECK (profile IN ('Administrador', 'Auditor/Farmacia', 'Enfermería')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_master_users_name ON master_users(full_name);

-- 7. Plantillas de Composición de Carros (CartItemTemplate)
CREATE TABLE IF NOT EXISTS cart_items_template (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id UUID REFERENCES master_carts(id) ON DELETE CASCADE,
    master_item_id UUID REFERENCES master_items(id) ON DELETE CASCADE,
    standard_quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(cart_id, master_item_id)
);
CREATE INDEX IF NOT EXISTS idx_cart_template_cart ON cart_items_template(cart_id);
