-- Kullanıcı giriş hatası debug script'i
-- "Database error granting user" hatası için

-- 1. Son onaylanan kullanıcıları kontrol et
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at,
    raw_user_meta_data->>'first_name' as first_name,
    raw_user_meta_data->>'last_name' as last_name,
    raw_user_meta_data->>'editor_approved' as editor_approved,
    raw_user_meta_data->>'is_approved' as is_approved,
    raw_user_meta_data->>'role' as role
FROM auth.users 
WHERE email = 'gulbahar.semra@hotmail.com'
ORDER BY created_at DESC;

-- 2. writer_profiles tablosunda bu kullanıcı var mı?
SELECT 
    user_id,
    name,
    email,
    is_featured,
    created_at
FROM writer_profiles 
WHERE email = 'gulbahar.semra@hotmail.com';

-- 3. RLS politikalarını kontrol et
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

-- 4. writer_profiles tablosunun RLS durumu
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'writer_profiles';

-- 5. Bu kullanıcının posts tablosunda yazısı var mı?
SELECT 
    id,
    title,
    author_id,
    author_name,
    status
FROM posts 
WHERE author_id = (SELECT id FROM auth.users WHERE email = 'gulbahar.semra@hotmail.com' LIMIT 1)
LIMIT 5;
