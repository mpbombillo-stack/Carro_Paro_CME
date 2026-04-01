-- 1. Elimina todos los datos actuales de la app como solicitaste
-- CUIDADO: Esto borrará el historial de auditorías, carros e ítems.
TRUNCATE TABLE audit_details, audit_headers, audit_custody CASCADE;
TRUNCATE TABLE cart_items_template, master_carts, master_items CASCADE;

-- 2. Agrega las nuevas columnas necesarias para guardar la configuración de los kits
ALTER TABLE cart_items_template 
ADD COLUMN IF NOT EXISTS lote text,
ADD COLUMN IF NOT EXISTS fecha_vencimiento_insumo text,
ADD COLUMN IF NOT EXISTS registro_sanitario text,
ADD COLUMN IF NOT EXISTS vencimiento_registro_sanitario text;
