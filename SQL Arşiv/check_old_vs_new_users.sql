-- Eski vs yeni kullanıcıları karşılaştır
-- "Database error granting user" hatası için

-- 1. Tüm kullanıcıları tarihe göre listele
SELECT 
    id,
    email,
    created_at,
    email_confirmed_at,
    last_sign_in_at,
    raw_user_meta_data->>'role' as role,
    raw_user_meta_data->>'editor_approved' as editor_approved,
    raw_user_meta_data->>'is_approved' as is_approved,
    CASE 
        WHEN created_at < '2024-10-01' THEN 'ESKİ KULLANICI'
        ELSE 'YENİ KULLANICI'
    END as user_type,
    CASE 
        WHEN last_sign_in_at IS NOT NULL THEN 'GİRİŞ YAPMIŞ'
        ELSE 'GİRİŞ YAPMAMIŞ'
    END as login_status
FROM auth.users 
ORDER BY created_at DESC
LIMIT 20;

-- 2. Eski kullanıcıların writer_profiles durumu
SELECT 
    'ESKİ KULLANICILAR' as group_name,
    COUNT(*) as total_users,
    COUNT(wp.user_id) as has_writer_profile,
    COUNT(*) - COUNT(wp.user_id) as missing_writer_profile
FROM auth.users au
LEFT JOIN writer_profiles wp ON au.id = wp.user_id
WHERE au.created_at < '2024-10-01';

-- 3. Yeni kullanıcıların writer_profiles durumu
SELECT 
    'YENİ KULLANICILAR' as group_name,
    COUNT(*) as total_users,
    COUNT(wp.user_id) as has_writer_profile,
    COUNT(*) - COUNT(wp.user_id) as missing_writer_profile
FROM auth.users au
LEFT JOIN writer_profiles wp ON au.id = wp.user_id
WHERE au.created_at >= '2024-10-01';

-- 4. gulbahar.semra@hotmail.com kullanıcısının detaylı durumu
SELECT 
    'gulbahar.semra@hotmail.com' as email,
    au.created_at,
    au.email_confirmed_at,
    au.last_sign_in_at,
    au.raw_user_meta_data->>'role' as role,
    au.raw_user_meta_data->>'editor_approved' as editor_approved,
    au.raw_user_meta_data->>'is_approved' as is_approved,
    CASE 
        WHEN wp.user_id IS NOT NULL THEN 'VAR'
        ELSE 'YOK'
    END as writer_profile_exists,
    wp.is_featured
FROM auth.users au
LEFT JOIN writer_profiles wp ON au.id = wp.user_id
WHERE au.email = 'gulbahar.semra@hotmail.com';

-- 5. RLS politikalarının durumu
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('users', 'writer_profiles', 'posts')
ORDER BY tablename, policyname;

-- 6. RLS etkinlik durumu
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    hasrls
FROM pg_tables 
WHERE tablename IN ('users', 'writer_profiles', 'posts')
ORDER BY tablename;
