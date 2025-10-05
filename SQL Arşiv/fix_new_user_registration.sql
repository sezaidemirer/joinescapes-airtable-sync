-- YENİ KULLANICI KAYIT SİSTEMİNİ DÜZELT
-- demirersezai@gmail.com yapısını baz al, ama yeni kullanıcıların kendi isimlerini kullan

-- 1. demirersezai@gmail.com'un yapısını kontrol et (BAZ ALINACAK YAPIS)
SELECT 
    'BAZ YAPIS (demirersezai)' as test_type,
    au.email,
    au.raw_user_meta_data,
    au.raw_user_meta_data->>'role' as role_field,
    au.raw_user_meta_data->>'user_role' as user_role_field,
    au.raw_user_meta_data->>'editor_approved' as editor_approved,
    au.raw_user_meta_data->>'is_approved' as is_approved,
    au.raw_user_meta_data->>'first_name' as first_name,
    au.raw_user_meta_data->>'last_name' as last_name,
    au.raw_user_meta_data->>'full_name' as full_name,
    au.raw_user_meta_data->>'author_name' as author_name,
    wp.user_id IS NOT NULL as has_writer_profile,
    wp.name as writer_name,
    wp.title as writer_title,
    wp.is_featured
FROM auth.users au
LEFT JOIN writer_profiles wp ON au.id = wp.user_id
WHERE au.email = 'demirersezai@gmail.com';

-- 2. Gulbahar Semra'yı düzelt (kendi ismini kullan)
UPDATE auth.users 
SET raw_user_meta_data = '{
    "role": "editor",
    "user_role": "editor", 
    "editor_approved": "true",
    "is_approved": "true",
    "first_name": "Gulbahar",
    "last_name": "Semra",
    "full_name": "Gulbahar Semra",
    "author_name": "Gulbahar Semra",
    "bio": "",
    "location": "",
    "specialties": [],
    "social_media": {},
    "author_title": "Yazar",
    "profile_image": "",
    "email_confirmed": true
}'::jsonb
WHERE email = 'gulbahar.semra@hotmail.com';

-- 3. Gulbahar için writer_profiles kaydını düzelt
UPDATE writer_profiles 
SET 
    name = 'Gulbahar Semra',
    title = 'Yazar',
    is_featured = true
WHERE user_id = (
    SELECT id FROM auth.users 
    WHERE email = 'gulbahar.semra@hotmail.com'
);

-- 4. TÜM YENİ KULLANICILAR İÇİN SİSTEM DÜZELTMESİ
-- Son 30 günde kayıt olan tüm editörleri bul ve düzelt
WITH new_editors AS (
    SELECT 
        au.id,
        au.email,
        (au.raw_user_meta_data::jsonb)->>'first_name' as first_name,
        (au.raw_user_meta_data::jsonb)->>'last_name' as last_name,
        COALESCE(
            CONCAT((au.raw_user_meta_data::jsonb)->>'first_name', ' ', (au.raw_user_meta_data::jsonb)->>'last_name'),
            (au.raw_user_meta_data::jsonb)->>'full_name',
            split_part(au.email, '@', 1)
        ) as full_name
    FROM auth.users au
    WHERE au.created_at >= NOW() - INTERVAL '30 days'
    AND au.email != 'gulbahar.semra@hotmail.com'
    AND ((au.raw_user_meta_data::jsonb)->>'role' = 'editor' OR (au.raw_user_meta_data::jsonb)->>'user_role' = 'editor')
)
UPDATE auth.users 
SET raw_user_meta_data = jsonb_build_object(
    'role', 'editor',
    'user_role', 'editor',
    'editor_approved', 'true',
    'is_approved', 'true',
    'first_name', COALESCE(new_editors.first_name, split_part(auth.users.email, '@', 1)),
    'last_name', COALESCE(new_editors.last_name, ''),
    'full_name', new_editors.full_name,
    'author_name', new_editors.full_name,
    'bio', '',
    'location', '',
    'specialties', '[]'::jsonb,
    'social_media', '{}'::jsonb,
    'author_title', 'Yazar',
    'profile_image', '',
    'email_confirmed', true
)
FROM new_editors
WHERE auth.users.id = new_editors.id;

-- 5. YENİ KULLANICILAR İÇİN writer_profiles KAYITLARINI OLUŞTUR
INSERT INTO writer_profiles (user_id, name, email, title, is_featured)
SELECT 
    au.id,
    COALESCE(
        CONCAT((au.raw_user_meta_data::jsonb)->>'first_name', ' ', (au.raw_user_meta_data::jsonb)->>'last_name'),
        (au.raw_user_meta_data::jsonb)->>'full_name',
        split_part(au.email, '@', 1)
    ) as name,
    au.email,
    'Yazar' as title,
    true as is_featured
FROM auth.users au
WHERE au.created_at >= NOW() - INTERVAL '30 days'
AND au.email != 'gulbahar.semra@hotmail.com'
AND ((au.raw_user_meta_data::jsonb)->>'role' = 'editor' OR (au.raw_user_meta_data::jsonb)->>'user_role' = 'editor')
AND NOT EXISTS (
    SELECT 1 FROM writer_profiles 
    WHERE user_id = au.id
)
ON CONFLICT (user_id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    title = 'Yazar',
    is_featured = true;

-- 6. Düzeltilmiş durumu kontrol et
SELECT 
    'DÜZELTİLMİŞ YENİ EDITÖRLER' as test_type,
    au.email,
    au.created_at,
    au.raw_user_meta_data->>'role' as role_field,
    au.raw_user_meta_data->>'user_role' as user_role_field,
    au.raw_user_meta_data->>'first_name' as first_name,
    au.raw_user_meta_data->>'last_name' as last_name,
    au.raw_user_meta_data->>'full_name' as full_name,
    au.raw_user_meta_data->>'author_name' as author_name,
    wp.name as writer_name,
    wp.title as writer_title,
    wp.is_featured
FROM auth.users au
LEFT JOIN writer_profiles wp ON au.id = wp.user_id
WHERE au.created_at >= NOW() - INTERVAL '30 days'
AND ((au.raw_user_meta_data::jsonb)->>'role' = 'editor' OR (au.raw_user_meta_data::jsonb)->>'user_role' = 'editor')
ORDER BY au.created_at DESC;

-- 7. Gulbahar'ın final durumunu kontrol et
SELECT 
    'GULBAHAR FINAL' as test_type,
    au.email,
    au.raw_user_meta_data->>'role' as role_field,
    au.raw_user_meta_data->>'first_name' as first_name,
    au.raw_user_meta_data->>'last_name' as last_name,
    au.raw_user_meta_data->>'full_name' as full_name,
    au.raw_user_meta_data->>'author_name' as author_name,
    wp.name as writer_name,
    wp.title as writer_title,
    wp.is_featured
FROM auth.users au
LEFT JOIN writer_profiles wp ON au.id = wp.user_id
WHERE au.email = 'gulbahar.semra@hotmail.com';
