-- Sezai Demirer'in email bilgisini getir

-- 1. Writer profiles'dan email bilgisini al
SELECT 
    id,
    name,
    email,
    title,
    user_id,
    created_at
FROM writer_profiles
WHERE 
    name ILIKE '%sezai%' 
    OR name ILIKE '%demirer%';

-- 2. Eğer writer_profiles'da email yoksa, user_id üzerinden auth.users'dan al
SELECT 
    wp.id,
    wp.name,
    wp.email as profile_email,
    au.email as auth_email,
    au.raw_user_meta_data->>'full_name' as full_name
FROM writer_profiles wp
LEFT JOIN auth.users au ON wp.user_id = au.id
WHERE 
    wp.name ILIKE '%sezai%' 
    OR wp.name ILIKE '%demirer%';

-- 3. Posts tablosunda author_name olarak geçiyorsa
SELECT DISTINCT
    author_name,
    author_id
FROM posts
WHERE 
    author_name ILIKE '%sezai%' 
    OR author_name ILIKE '%demirer%';

-- 4. Eğer author_id varsa, auth.users'dan email'i al
SELECT 
    au.id,
    au.email,
    au.raw_user_meta_data->>'full_name' as full_name,
    p.author_name
FROM posts p
JOIN auth.users au ON p.author_id = au.id
WHERE 
    p.author_name ILIKE '%sezai%' 
    OR p.author_name ILIKE '%demirer%'
LIMIT 1;

