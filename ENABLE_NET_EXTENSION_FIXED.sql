-- Supabase Net Extension'ı Aktifleştir
-- Bu extension HTTP istekleri yapmak için gerekli

-- 1. Net extension'ı aktifleştir
CREATE EXTENSION IF NOT EXISTS http WITH SCHEMA extensions;

-- 2. pg_net extension'ı da dene (Supabase'de bu kullanılıyor)
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- 3. Kontrol et
SELECT 
  extname as "Extension",
  nspname as "Schema"
FROM pg_extension e
JOIN pg_namespace n ON e.extnamespace = n.oid
WHERE extname IN ('http', 'pg_net');

-- ✅ Extension aktifleştirildi!

