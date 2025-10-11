-- Supabase'de tüm fonksiyonları kontrol et

SELECT 
  proname as function_name,
  pg_catalog.pg_get_function_identity_arguments(p.oid) as arguments
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND proname LIKE '%sync%' OR proname LIKE '%update%' OR proname LIKE '%category%'
ORDER BY proname;

