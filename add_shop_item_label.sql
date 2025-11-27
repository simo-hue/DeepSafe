-- Add label column to shop_items table
ALTER TABLE shop_items 
ADD COLUMN label text;

-- Add comment to explain usage
COMMENT ON COLUMN shop_items.label IS 'Optional label text like POPOLARE or BEST VALUE';
