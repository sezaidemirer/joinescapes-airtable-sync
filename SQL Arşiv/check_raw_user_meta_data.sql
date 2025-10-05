-- raw_user_meta_data kolonunun içeriğini kontrol et
-- "Database error granting user" hatası için

-- 1. raw_user_meta_data kolonunun tipini kontrol et
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'auth'
AND column_name = 'raw_user_meta_data';

-- 2. gulbahar.semra@hotmail.com kullanıcısının raw_user_meta_data içeriğini kontrol et
SELECT 
    id,
    email,
    raw_user_meta_data,
    pg_typeof(raw_user_meta_data) as data_type
FROM auth.users 
WHERE email = 'gulbahar.semra@hotmail.com'
LIMIT 1;

-- 3. raw_user_meta_data'nın içeriği JSON formatında mı kontrol et
SELECT 
    id,
    email,
    CASE 
        WHEN raw_user_meta_data::text ~ '^[\s]*\{.*\}[\s]*$' THEN 'JSON format'
        ELSE 'Text format'
    END as format_type,
    LEFT(raw_user_meta_data::text, 100) as sample_content
FROM auth.users 
WHERE email = 'gulbahar.semra@hotmail.com'
LIMIT 1;

-- 4. Tüm kullanıcıların raw_user_meta_data formatını kontrol et
SELECT 
    CASE 
        WHEN raw_user_meta_data::text ~ '^[\s]*\{.*\}[\s]*$' THEN 'JSON format'
        ELSE 'Text format'
    END as format_type,
    COUNT(*) as user_count
FROM auth.users 
GROUP BY format_type;
