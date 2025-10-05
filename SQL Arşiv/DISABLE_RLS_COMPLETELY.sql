-- RLS'Yİ TAMAMEN DEVRE DIŞI BIRAK
-- "Database error granting user" hatası için

-- 1. TÜM RLS POLİTİKALARINI SİL
DROP POLICY IF EXISTS "writer_profiles_select_policy" ON writer_profiles;
DROP POLICY IF EXISTS "writer_profiles_insert_policy" ON writer_profiles;
DROP POLICY IF EXISTS "writer_profiles_update_policy" ON writer_profiles;
DROP POLICY IF EXISTS "posts_select_policy" ON posts;
DROP POLICY IF EXISTS "posts_insert_policy" ON posts;
DROP POLICY IF EXISTS "posts_update_policy" ON posts;
DROP POLICY IF EXISTS "Admins can update al..." ON posts;

-- 2. RLS'Yİ TAMAMEN DEVRE DIŞI BIRAK
ALTER TABLE writer_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE posts DISABLE ROW LEVEL SECURITY;

-- 3. Gulbahar Semra'nın metadata'sını düzelt
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

-- 4. Gulbahar Semra için writer_profiles kaydını oluştur/güncelle
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

-- 5. RLS DURUMUNU KONTROL ET
SELECT 
    'RLS DURUMU' as test_type,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('writer_profiles', 'posts')
ORDER BY tablename;

-- 6. Gulbahar Semra'nın durumunu kontrol et
SELECT 
    'GULBAHAR DURUMU' as test_type,
    au.email,
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
