-- Sistemdeki tüm kullanıcıları ve rollerini listele
-- Bu SQL'i Supabase SQL Editor'da çalıştırın

-- 1. TÜM KULLANICILAR VE ROLLERİ (Detaylı)
SELECT 
    au.id as user_id,
    au.email,
    au.raw_user_meta_data->>'user_role' as user_role,
    au.raw_user_meta_data->>'firstName' as first_name,
    au.raw_user_meta_data->>'lastName' as last_name,
    au.email_confirmed_at,
    au.created_at,
    au.last_sign_in_at,
    CASE 
        WHEN wp.id IS NOT NULL THEN '✅ VAR'
        ELSE '❌ YOK'
    END as writer_profile_durumu
FROM auth.users au
LEFT JOIN writer_profiles wp ON au.id = wp.user_id
ORDER BY au.created_at DESC;

-- 2. ROL BAZINDA GRUPLA (Özet)
SELECT 
    au.raw_user_meta_data->>'user_role' as user_role,
    COUNT(*) as kullanici_sayisi,
    COUNT(wp.id) as writer_profile_sayisi
FROM auth.users au
LEFT JOIN writer_profiles wp ON au.id = wp.user_id
GROUP BY au.raw_user_meta_data->>'user_role'
ORDER BY kullanici_sayisi DESC;

-- 3. SADECE YAZARLAR (Writer Profile'ı olanlar)
SELECT 
    au.email,
    au.raw_user_meta_data->>'user_role' as user_role,
    wp.name as writer_name,
    wp.slug,
    wp.bio,
    wp.created_at as profile_created_at
FROM auth.users au
INNER JOIN writer_profiles wp ON au.id = wp.user_id
ORDER BY wp.created_at DESC;

-- 4. SADECE NORMAL KULLANICILAR (User role = 'user')
SELECT 
    au.email,
    au.raw_user_meta_data->>'firstName' as first_name,
    au.raw_user_meta_data->>'lastName' as last_name,
    au.created_at,
    au.last_sign_in_at
FROM auth.users au
WHERE au.raw_user_meta_data->>'user_role' = 'user'
ORDER BY au.created_at DESC;

-- 5. ADMIN HESAP (test@test.com)
SELECT 
    au.email,
    au.raw_user_meta_data->>'user_role' as user_role,
    au.created_at,
    au.last_sign_in_at,
    'ADMIN HESAP' as note
FROM auth.users au
WHERE au.email = 'test@test.com';

-- 6. SORUNLU DURUMLAR (Writer profile'ı olup user rolü olanlar - OLMAMALI!)
SELECT 
    au.email,
    au.raw_user_meta_data->>'user_role' as user_role,
    wp.name as writer_name,
    '⚠️ SORUNLU - User rolü ama writer profile var!' as problem
FROM auth.users au
INNER JOIN writer_profiles wp ON au.id = wp.user_id
WHERE au.raw_user_meta_data->>'user_role' = 'user';

-- 7. EMAIL DOĞRULAMA DURUMU
SELECT 
    au.raw_user_meta_data->>'user_role' as user_role,
    COUNT(*) as toplam,
    COUNT(CASE WHEN au.email_confirmed_at IS NOT NULL THEN 1 END) as email_dogrulanmis,
    COUNT(CASE WHEN au.email_confirmed_at IS NULL THEN 1 END) as email_dogrulanmamis
FROM auth.users au
GROUP BY au.raw_user_meta_data->>'user_role'
ORDER BY toplam DESC;

