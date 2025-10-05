-- TÜM SEZAI DEMİRER'LERİ LİSTELE

-- 1. Writer profiles'daki tüm Sezai Demirer'ler
SELECT 
    id,
    name,
    email,
    title,
    bio,
    profile_image,
    user_id,
    is_featured,
    created_at
FROM writer_profiles
WHERE 
    name ILIKE '%sezai%'
ORDER BY created_at DESC;

-- 2. Auth.users'daki tüm Sezai hesapları
SELECT 
    id,
    email,
    raw_user_meta_data->>'full_name' as full_name,
    raw_user_meta_data->>'user_role' as user_role,
    created_at,
    last_sign_in_at
FROM auth.users
WHERE 
    email ILIKE '%sezai%'
    OR raw_user_meta_data->>'full_name' ILIKE '%sezai%'
ORDER BY created_at DESC;

-- 3. Posts'ta author olarak geçen tüm Sezai'ler
SELECT DISTINCT
    author_name,
    author_id,
    COUNT(*) as yazi_sayisi
FROM posts
WHERE 
    author_name ILIKE '%sezai%'
GROUP BY author_name, author_id
ORDER BY yazi_sayisi DESC;

-- 4. TÜM BİLGİLERİ BİRLEŞTİR
SELECT 
    wp.id as profile_id,
    wp.name as profile_name,
    wp.email as profile_email,
    wp.title,
    wp.profile_image,
    au.email as auth_email,
    au.id as user_id,
    COUNT(DISTINCT p.id) as yazi_sayisi
FROM writer_profiles wp
LEFT JOIN auth.users au ON wp.user_id = au.id
LEFT JOIN posts p ON p.author_name = wp.name
WHERE 
    wp.name ILIKE '%sezai%'
    OR au.email ILIKE '%sezai%'
GROUP BY wp.id, wp.name, wp.email, wp.title, wp.profile_image, au.email, au.id
ORDER BY yazi_sayisi DESC;

