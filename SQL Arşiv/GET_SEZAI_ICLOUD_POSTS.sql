-- sezaidemirer@icloud.com hesabından yazılan yazıları göster

-- 1. Önce bu email'e ait user_id'yi bul
SELECT 
    id as user_id,
    email,
    raw_user_meta_data->>'full_name' as full_name,
    raw_user_meta_data->>'user_role' as user_role,
    created_at
FROM auth.users
WHERE email = 'sezaidemirer@icloud.com';

-- 2. Bu email'e ait writer profile'ı bul
SELECT 
    id,
    name,
    email,
    title,
    bio,
    profile_image,
    user_id,
    is_featured
FROM writer_profiles
WHERE email = 'sezaidemirer@icloud.com'
   OR user_id IN (SELECT id FROM auth.users WHERE email = 'sezaidemirer@icloud.com');

-- 3. Bu user_id ile yazılmış tüm yazıları göster
SELECT 
    p.id,
    p.title,
    p.slug,
    p.author_name,
    p.status,
    p.published_at,
    p.created_at,
    p.featured_image_url,
    c.name as category_name
FROM posts p
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.author_id IN (SELECT id FROM auth.users WHERE email = 'sezaidemirer@icloud.com')
ORDER BY p.created_at DESC;

-- 4. Veya author_name ile eşleştir
SELECT 
    p.id,
    p.title,
    p.slug,
    p.author_name,
    p.author_id,
    p.status,
    p.published_at,
    p.created_at,
    p.excerpt,
    c.name as category_name
FROM posts p
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.author_name IN (
    SELECT name FROM writer_profiles 
    WHERE email = 'sezaidemirer@icloud.com'
       OR user_id IN (SELECT id FROM auth.users WHERE email = 'sezaidemirer@icloud.com')
)
ORDER BY p.created_at DESC;

-- 5. TÜM DETAYLARI BİRLEŞTİR
SELECT 
    p.id,
    p.title,
    p.slug,
    p.author_name,
    p.status,
    p.published_at,
    p.excerpt,
    p.featured_image_url,
    c.name as category_name,
    au.email as author_email,
    wp.title as author_title
FROM posts p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN auth.users au ON p.author_id = au.id
LEFT JOIN writer_profiles wp ON wp.user_id = au.id
WHERE au.email = 'sezaidemirer@icloud.com'
   OR wp.email = 'sezaidemirer@icloud.com'
ORDER BY p.created_at DESC;

