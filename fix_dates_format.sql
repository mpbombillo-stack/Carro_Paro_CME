-- 1. Cambiar los tipos de columna de DATE a TEXT para permitir 'VIGENTE' y formatos DD/MM/AAAA
DO $$ 
BEGIN 
    -- audit_details
    ALTER TABLE audit_details ALTER COLUMN fecha_vencimiento_insumo TYPE TEXT;
    ALTER TABLE audit_details ALTER COLUMN vencimiento_registro_sanitario TYPE TEXT;
    
    -- cart_items_template
    ALTER TABLE cart_items_template ALTER COLUMN fecha_vencimiento_insumo TYPE TEXT;
    ALTER TABLE cart_items_template ALTER COLUMN vencimiento_registro_sanitario TYPE TEXT;
    
    -- master_items
    ALTER TABLE master_items ALTER COLUMN invima_expiration TYPE TEXT;
EXCEPTION WHEN OTHERS THEN 
    -- If some don't exist yet, just continue
END $$;

-- 2. Asegurar que las columnas del template existan como TEXT
ALTER TABLE cart_items_template 
DROP COLUMN IF EXISTS fecha_vencimiento_insumo CASCADE,
DROP COLUMN IF EXISTS vencimiento_registro_sanitario CASCADE;

ALTER TABLE cart_items_template 
ADD COLUMN fecha_vencimiento_insumo TEXT,
ADD COLUMN vencimiento_registro_sanitario TEXT;

-- 3. Limpieza opcional de tablas (solo si es necesario resetear todo)
-- TRUNCATE TABLE audit_details, audit_headers, audit_custody CASCADE;
-- TRUNCATE TABLE cart_items_template, master_carts, master_items CASCADE;
