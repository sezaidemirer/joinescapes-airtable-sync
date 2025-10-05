-- Kullanıcı rolünü debug et
-- "Database error granting user" hatası için

-- 1. Gulbahar Semra'nın tam metadata'sını kontrol et
SELECT 
    'METADATA DEBUG' as test_type,
    au.id,
    au.email,
    au.raw_user_meta_data,
    au.raw_user_meta_data->>'role' as role_field,
    au.raw_user_meta_data->>'user_role' as user_role_field,
    au.raw_user_meta_data->>'editor_approved' as editor_approved,
    au.raw_user_meta_data->>'is_approved' as is_approved
FROM auth.users au
WHERE au.email = 'gulbahar.semra@hotmail.com';

-- 2. Frontend'in kontrol ettiği alanları simüle et
SELECT 
    'FRONTEND DEBUG' as test_type,
    au.email,
    CASE 
        WHEN au.raw_user_meta_data->>'role' = 'editor' THEN 'EDITOR (role field)'
        WHEN au.raw_user_meta_data->>'user_role' = 'editor' THEN 'EDITOR (user_role field)'
        WHEN au.raw_user_meta_data->>'role' = 'user' THEN 'USER (role field)'
        WHEN au.raw_user_meta_data->>'user_role' = 'user' THEN 'USER (user_role field)'
        ELSE 'UNKNOWN ROLE'
    END as detected_role,
    au.raw_user_meta_data->>'role' as role_value,
    au.raw_user_meta_data->>'user_role' as user_role_value
FROM auth.users au
WHERE au.email = 'gulbahar.semra@hotmail.com';

-- 3. Metadata'yı hem role hem user_role olarak ayarla
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
    "profile_image": ""
}'::jsonb
WHERE email = 'gulbahar.semra@hotmail.com';

-- 4. Güncellenmiş durumu kontrol et
SELECT 
    'UPDATED DEBUG' as test_type,
    au.email,
    au.raw_user_meta_data->>'role' as role_field,
    au.raw_user_meta_data->>'user_role' as user_role_field,
    au.raw_user_meta_data->>'editor_approved' as editor_approved,
    au.raw_user_meta_data->>'is_approved' as is_approved
FROM auth.users au
WHERE au.email = 'gulbahar.semra@hotmail.com';
