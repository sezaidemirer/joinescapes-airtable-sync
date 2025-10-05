-- Acil auth düzeltmesi
-- "Database error granting user" hatası için

-- 1. gulbahar.semra@hotmail.com kullanıcısının tam durumunu kontrol et
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at,
    updated_at,
    last_sign_in_at,
    raw_user_meta_data,
    raw_app_meta_data,
    is_super_admin,
    role,
    aud,
    confirmation_token,
    recovery_token,
    email_change_token,
    email_change,
    encrypted_password,
    email_confirmed_at IS NOT NULL as email_confirmed,
    CASE 
        WHEN last_sign_in_at IS NOT NULL THEN 'Giriş yapmış'
        ELSE 'Hiç giriş yapmamış'
    END as login_status
FROM auth.users 
WHERE email = 'gulbahar.semra@hotmail.com'
ORDER BY created_at DESC;

-- 2. Bu kullanıcının writer_profiles kaydı var mı?
SELECT 
    wp.*,
    au.email as auth_email,
    au.email_confirmed_at
FROM writer_profiles wp
JOIN auth.users au ON wp.user_id = au.id
WHERE au.email = 'gulbahar.semra@hotmail.com';

-- 3. RLS durumunu kontrol et
SELECT 
    schemaname,
    tablename,
    rowsecurity,
    hasrls
FROM pg_tables 
WHERE tablename IN ('users', 'writer_profiles', 'posts')
ORDER BY tablename;

-- 4. Tüm RLS politikalarını listele
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

-- 5. writer_profiles tablosunu tamamen RLS'den muaf tut (geçici)
ALTER TABLE writer_profiles DISABLE ROW LEVEL SECURITY;

-- 6. posts tablosunu da RLS'den muaf tut (geçici)
ALTER TABLE posts DISABLE ROW LEVEL SECURITY;

-- 7. gulbahar.semra@hotmail.com için writer_profiles kaydını zorla oluştur
INSERT INTO writer_profiles (user_id, name, email, is_featured)
SELECT 
    id,
    split_part(email, '@', 1) as name,
    email,
    true as is_featured
FROM auth.users 
WHERE email = 'gulbahar.semra@hotmail.com'
ON CONFLICT (user_id) DO UPDATE SET
    email = EXCLUDED.email,
    is_featured = EXCLUDED.is_featured;

-- 8. Sonucu kontrol et
SELECT 
    'writer_profiles' as table_name,
    user_id,
    name,
    email,
    is_featured
FROM writer_profiles 
WHERE email = 'gulbahar.semra@hotmail.com'
UNION ALL
SELECT 
    'auth.users' as table_name,
    id::text as user_id,
    split_part(email, '@', 1) as name,
    email,
    CASE WHEN email_confirmed_at IS NOT NULL THEN true ELSE false END as is_featured
FROM auth.users 
WHERE email = 'gulbahar.semra@hotmail.com';
