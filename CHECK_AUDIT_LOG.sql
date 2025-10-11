-- Supabase'de audit log var mı kontrol et
-- Eğer varsa, posts tablosundaki son değişiklikleri göster

-- 1. pg_stat_statements extension'ı var mı?
SELECT EXISTS (
  SELECT 1 FROM pg_extension WHERE extname = 'pg_stat_statements'
) as pg_stat_enabled;

-- 2. Son UPDATE query'lerini göster (eğer pg_stat_statements varsa)
-- SELECT 
--   query,
--   calls,
--   total_exec_time,
--   rows
-- FROM pg_stat_statements
-- WHERE query LIKE '%UPDATE%posts%category_id%'
-- ORDER BY last_exec_time DESC
-- LIMIT 10;

