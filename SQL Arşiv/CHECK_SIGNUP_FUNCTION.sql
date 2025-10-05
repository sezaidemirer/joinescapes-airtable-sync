-- create_writer_profile_on_signup fonksiyonunu kontrol et
-- Bu fonksiyon slug'ı nereden alıyor?

-- 1. Fonksiyonu göster
SELECT 
    p.proname as function_name,
    pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'create_writer_profile_on_signup';

