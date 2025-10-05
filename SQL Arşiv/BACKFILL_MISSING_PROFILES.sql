-- Backfill – Eksik Profil'leri Tamamla (tek seferlik)
-- Mevcut kullanıcılar için writer_profiles kayıtları oluştur

-- 1. Eksik profilleri bul
SELECT 
    'EKSİK PROFİLLER' as test_type,
    u.id,
    u.email,
    u.created_at,
    u.raw_user_meta_data->>'role' as role_field,
    u.raw_user_meta_data->>'user_role' as user_role_field,
    u.raw_user_meta_data->>'full_name' as full_name,
    p.user_id IS NULL as missing_profile
FROM auth.users u
LEFT JOIN public.writer_profiles p ON p.user_id = u.id
WHERE p.user_id IS NULL
ORDER BY u.created_at DESC;

-- 2. Eksik profilleri oluştur
INSERT INTO public.writer_profiles (user_id, name, email, title, is_featured)
SELECT 
    u.id,
    COALESCE(
        NULLIF(u.raw_user_meta_data->>'full_name', ''),
        NULLIF(
            CONCAT(
                COALESCE(u.raw_user_meta_data->>'first_name', ''), 
                ' ', 
                COALESCE(u.raw_user_meta_data->>'last_name', '')
            ), 
            ' '
        ),
        split_part(u.email, '@', 1)
    ) as name,
    u.email,
    CASE 
        WHEN u.raw_user_meta_data->>'role' IN ('editor', 'yazar', 'supervisor') 
        OR u.raw_user_meta_data->>'user_role' IN ('editor', 'yazar', 'supervisor') THEN 'Yazar'
        ELSE 'Kullanıcı'
    END as title,
    CASE 
        WHEN u.raw_user_meta_data->>'role' IN ('editor', 'yazar', 'supervisor') 
        OR u.raw_user_meta_data->>'user_role' IN ('editor', 'yazar', 'supervisor') THEN true
        ELSE false
    END as is_featured
FROM auth.users u
LEFT JOIN public.writer_profiles p ON p.user_id = u.id
WHERE p.user_id IS NULL;

-- 3. Gulbahar Semra'yı özel olarak düzelt
UPDATE public.writer_profiles 
SET 
    name = 'Gulbahar Semra',
    title = 'Yazar',
    is_featured = true
WHERE user_id = (
    SELECT id FROM auth.users 
    WHERE email = 'gulbahar.semra@hotmail.com'
);

UPDATE auth.users 
SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{
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

-- 4. Son durumu kontrol et
SELECT 
    'BACKFILL SONUCU' as test_type,
    COUNT(*) as total_users,
    COUNT(p.user_id) as users_with_profiles,
    COUNT(*) - COUNT(p.user_id) as missing_profiles
FROM auth.users u
LEFT JOIN public.writer_profiles p ON p.user_id = u.id;

-- 5. Gulbahar Semra'nın durumunu kontrol et
SELECT 
    'GULBAHAR DURUMU' as test_type,
    u.email,
    u.raw_user_meta_data->>'role' as role_field,
    u.raw_user_meta_data->>'user_role' as user_role_field,
    u.raw_user_meta_data->>'first_name' as first_name,
    u.raw_user_meta_data->>'last_name' as last_name,
    u.raw_user_meta_data->>'full_name' as full_name,
    p.name as writer_name,
    p.title as writer_title,
    p.is_featured
FROM auth.users u
LEFT JOIN public.writer_profiles p ON p.user_id = u.id
WHERE u.email = 'gulbahar.semra@hotmail.com';
