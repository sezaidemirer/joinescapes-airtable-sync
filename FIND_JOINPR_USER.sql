-- Join PR kullanıcısını bul

-- 1. auth.users'da Join PR'ı ara
SELECT 
    id::text as user_id,
    email,
    raw_user_meta_data->>'user_role' as user_role,
    created_at
FROM auth.users
WHERE email ILIKE '%joinpr%' OR email ILIKE '%marketing%'
ORDER BY created_at DESC;

-- 2. writer_profiles'da Join PR'ı ara
SELECT 
    id::text as profile_id,
    user_id::text,
    name,
    email,
    is_approved
FROM writer_profiles
WHERE email ILIKE '%joinpr%' OR email ILIKE '%marketing%' OR name ILIKE '%join%pr%'
ORDER BY created_at DESC;

-- 3. posts tablosunda mevcut author_id'leri göster (hangileri geçerli?)
SELECT DISTINCT
    author_id::text,
    author_name,
    COUNT(*) as yazı_sayısı
FROM posts
WHERE author_id IS NOT NULL
GROUP BY author_id, author_name
ORDER BY yazı_sayısı DESC;

-- 4. Airtable yazılarının durumu
SELECT 
    COUNT(*) as airtable_yazı_sayısı,
    author_name
FROM posts
WHERE airtable_record_id IS NOT NULL
GROUP BY author_name;

