-- Prepare master_items table for UPSERT operations by adding unique constraint to description
ALTER TABLE master_items ADD CONSTRAINT master_items_description_key UNIQUE (description);
