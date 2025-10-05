-- Direkt auth testi
-- "Database error granting user" hatası için

-- 1. gulbahar.semra@hotmail.com kullanıcısının auth.users durumunu kontrol et
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at,
    updated_at,
    last_sign_in_at,
    raw_user_meta_data,
    raw_app_meta_data,
    aud,
    role,
    is_super_admin,
    confirmation_token,
    recovery_token,
    email_change_token,
    email_change,
    encrypted_password,
    CASE 
        WHEN email_confirmed_at IS NOT NULL THEN 'Email doğrulanmış'
        ELSE 'Email doğrulanmamış'
    END as email_status,
    CASE 
        WHEN last_sign_in_at IS NOT NULL THEN 'Daha önce giriş yapmış'
        ELSE 'Hiç giriş yapmamış'
    END as login_history
FROM auth.users 
WHERE email = 'gulbahar.semra@hotmail.com'
ORDER BY created_at DESC;

-- 2. Bu kullanıcının writer_profiles durumunu kontrol et
SELECT 
    wp.*,
    au.email as auth_email,
    au.email_confirmed_at,
    au.raw_user_meta_data->>'role' as user_role
FROM writer_profiles wp
JOIN auth.users au ON wp.user_id = au.id
WHERE au.email = 'gulbahar.semra@hotmail.com';

-- 3. RLS durumunu kontrol et
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    hasrls
FROM pg_tables 
WHERE tablename IN ('users', 'writer_profiles', 'posts')
ORDER BY tablename;

-- 4. Bu kullanıcının posts tablosunda yazısı var mı?
SELECT 
    id,
    title,
    author_id,
    author_name,
    status,
    created_at
FROM posts 
WHERE author_id = (
    SELECT id FROM auth.users 
    WHERE email = 'gulbahar.semra@hotmail.com' 
    LIMIT 1
)
ORDER BY created_at DESC
LIMIT 5;

-- 5. Bu kullanıcının auth.users'daki metadata'sını düzelt
UPDATE auth.users 
SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{
    "role": "editor",
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
    "author_title": "",
    "profile_image": ""
}'::jsonb
WHERE email = 'gulbahar.semra@hotmail.com';

-- 6. Bu kullanıcı için writer_profiles kaydını zorla oluştur
INSERT INTO writer_profiles (user_id, name, email, is_featured)
SELECT 
    id,
    'Gulbahar Semra' as name,
    email,
    true as is_featured
FROM auth.users 
WHERE email = 'gulbahar.semra@hotmail.com'
ON CONFLICT (user_id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    is_featured = EXCLUDED.is_featured;

-- 7. Son durumu kontrol et
SELECT 
    'auth.users' as table_name,
    id as user_id,
    email,
    email_confirmed_at IS NOT NULL as email_confirmed,
    raw_user_meta_data->>'role' as role,
    raw_user_meta_data->>'editor_approved' as editor_approved,
    raw_user_meta_data->>'is_approved' as is_approved
FROM auth.users 
WHERE email = 'gulbahar.semra@hotmail.com'
UNION ALL
SELECT 
    'writer_profiles' as table_name,
    user_id::text as user_id,
    email,
    is_featured as email_confirmed,
    name as role,
    'true' as editor_approved,
    'true' as is_approved
FROM writer_profiles 
WHERE email = 'gulbahar.semra@hotmail.com';
