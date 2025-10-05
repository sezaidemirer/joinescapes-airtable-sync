-- Eski vs yeni editörleri karşılaştır
-- demirersezai@gmail.com (çalışan) vs gulbahar.semra@hotmail.com (çalışmayan)

-- 1. demirersezai@gmail.com (ÇALIŞAN ESKİ EDITÖR) detayları
SELECT 
    'ÇALIŞAN ESKİ EDITÖR' as editor_type,
    au.id,
    au.email,
    au.created_at,
    au.email_confirmed_at,
    au.last_sign_in_at,
    au.raw_user_meta_data,
    au.raw_user_meta_data->>'role' as role_field,
    au.raw_user_meta_data->>'user_role' as user_role_field,
    au.raw_user_meta_data->>'editor_approved' as editor_approved,
    au.raw_user_meta_data->>'is_approved' as is_approved,
    wp.user_id IS NOT NULL as has_writer_profile,
    wp.name as writer_name,
    wp.title as writer_title,
    wp.is_featured
FROM auth.users au
LEFT JOIN writer_profiles wp ON au.id = wp.user_id
WHERE au.email = 'demirersezai@gmail.com';

-- 2. gulbahar.semra@hotmail.com (ÇALIŞMAYAN YENİ EDITÖR) detayları
SELECT 
    'ÇALIŞMAYAN YENİ EDITÖR' as editor_type,
    au.id,
    au.email,
    au.created_at,
    au.email_confirmed_at,
    au.last_sign_in_at,
    au.raw_user_meta_data,
    au.raw_user_meta_data->>'role' as role_field,
    au.raw_user_meta_data->>'user_role' as user_role_field,
    au.raw_user_meta_data->>'editor_approved' as editor_approved,
    au.raw_user_meta_data->>'is_approved' as is_approved,
    wp.user_id IS NOT NULL as has_writer_profile,
    wp.name as writer_name,
    wp.title as writer_title,
    wp.is_featured
FROM auth.users au
LEFT JOIN writer_profiles wp ON au.id = wp.user_id
WHERE au.email = 'gulbahar.semra@hotmail.com';

-- 3. Tüm editörleri tarihe göre listele
SELECT 
    au.email,
    au.created_at,
    CASE 
        WHEN au.created_at < '2024-10-01' THEN 'ESKİ EDITÖR'
        ELSE 'YENİ EDITÖR'
    END as editor_type,
    au.raw_user_meta_data->>'role' as role_field,
    au.raw_user_meta_data->>'user_role' as user_role_field,
    au.raw_user_meta_data->>'editor_approved' as editor_approved,
    au.raw_user_meta_data->>'is_approved' as is_approved,
    wp.user_id IS NOT NULL as has_writer_profile,
    au.last_sign_in_at IS NOT NULL as has_logged_in,
    CASE 
        WHEN au.last_sign_in_at IS NOT NULL THEN 'GİRİŞ YAPMIŞ'
        ELSE 'GİRİŞ YAPMAMIŞ'
    END as login_status
FROM auth.users au
LEFT JOIN writer_profiles wp ON au.id = wp.user_id
WHERE au.raw_user_meta_data->>'role' = 'editor' 
   OR au.raw_user_meta_data->>'user_role' = 'editor'
   OR au.email = 'demirersezai@gmail.com'
   OR au.email = 'gulbahar.semra@hotmail.com'
ORDER BY au.created_at DESC;

-- 4. gulbahar.semra@hotmail.com'u demirersezai@gmail.com ile aynı yap
UPDATE auth.users 
SET raw_user_meta_data = (
    SELECT raw_user_meta_data 
    FROM auth.users 
    WHERE email = 'demirersezai@gmail.com'
)
WHERE email = 'gulbahar.semra@hotmail.com';

-- 5. Gulbahar için writer_profiles kaydını demirersezai ile aynı yap
UPDATE writer_profiles 
SET 
    name = 'Gulbahar Semra',
    title = 'Yazar',
    is_featured = true
WHERE user_id = (
    SELECT id FROM auth.users 
    WHERE email = 'gulbahar.semra@hotmail.com'
);

-- 6. Eğer writer_profiles kaydı yoksa oluştur
INSERT INTO writer_profiles (user_id, name, email, title, is_featured)
SELECT 
    id,
    'Gulbahar Semra' as name,
    email,
    'Yazar' as title,
    true as is_featured
FROM auth.users 
WHERE email = 'gulbahar.semra@hotmail.com'
ON CONFLICT (user_id) DO UPDATE SET
    name = 'Gulbahar Semra',
    email = EXCLUDED.email,
    title = 'Yazar',
    is_featured = true;

-- 7. Düzeltilmiş durumu kontrol et
SELECT 
    'DÜZELTİLMİŞ GULBAHAR' as editor_type,
    au.email,
    au.created_at,
    au.raw_user_meta_data->>'role' as role_field,
    au.raw_user_meta_data->>'user_role' as user_role_field,
    au.raw_user_meta_data->>'editor_approved' as editor_approved,
    au.raw_user_meta_data->>'is_approved' as is_approved,
    wp.user_id IS NOT NULL as has_writer_profile,
    wp.name as writer_name,
    wp.title as writer_title,
    wp.is_featured
FROM auth.users au
LEFT JOIN writer_profiles wp ON au.id = wp.user_id
WHERE au.email = 'gulbahar.semra@hotmail.com';
