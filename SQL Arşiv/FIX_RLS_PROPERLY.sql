-- RLS'Yİ DOĞRU ŞEKİLDE DÜZELT
-- "Database error granting user" hatası için KÖKLÜ ÇÖZÜM

-- 1. TÜM MEVCUT RLS POLİTİKALARINI SİL
DROP POLICY IF EXISTS "writer_profiles_select_policy" ON writer_profiles;
DROP POLICY IF EXISTS "writer_profiles_insert_policy" ON writer_profiles;
DROP POLICY IF EXISTS "writer_profiles_update_policy" ON writer_profiles;
DROP POLICY IF EXISTS "posts_select_policy" ON posts;
DROP POLICY IF EXISTS "posts_insert_policy" ON posts;
DROP POLICY IF EXISTS "posts_update_policy" ON posts;
DROP POLICY IF EXISTS "Admins can update al..." ON posts;

-- 2. writer_profiles tablosuna email kolonu ekle (eğer yoksa)
ALTER TABLE writer_profiles 
ADD COLUMN IF NOT EXISTS email TEXT;

-- 3. Mevcut kayıtlar için email bilgisini güncelle
UPDATE writer_profiles 
SET email = (
    SELECT email 
    FROM auth.users 
    WHERE auth.users.id = writer_profiles.user_id
)
WHERE email IS NULL;

-- 4. Gulbahar Semra için kayıt oluştur
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

-- 5. Gulbahar Semra'nın metadata'sını düzelt
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

-- 6. DOĞRU RLS POLİTİKALARI OLUŞTUR
-- writer_profiles için - HERKES OKUYABİLİR, AUTHENTICATED KULLANICILAR YAZABİLİR
CREATE POLICY "writer_profiles_select_policy" ON writer_profiles
    FOR SELECT 
    USING (true);

CREATE POLICY "writer_profiles_insert_policy" ON writer_profiles
    FOR INSERT 
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "writer_profiles_update_policy" ON writer_profiles
    FOR UPDATE 
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- posts için - HERKES OKUYABİLİR, AUTHENTICATED KULLANICILAR YAZABİLİR
CREATE POLICY "posts_select_policy" ON posts
    FOR SELECT 
    USING (true);

CREATE POLICY "posts_insert_policy" ON posts
    FOR INSERT 
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "posts_update_policy" ON posts
    FOR UPDATE 
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- 7. RLS'Yİ ETKİNLEŞTİR
ALTER TABLE writer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- 8. RLS DURUMUNU KONTROL ET
SELECT 
    'RLS DURUMU' as test_type,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('writer_profiles', 'posts')
ORDER BY tablename;

-- 9. RLS POLİTİKALARINI KONTROL ET
SELECT 
    'RLS POLİTİKALARI' as test_type,
    schemaname,
    tablename,
    policyname,
    cmd,
    permissive,
    roles
FROM pg_policies 
WHERE tablename IN ('writer_profiles', 'posts')
ORDER BY tablename, policyname;

-- 10. Gulbahar Semra'nın durumunu kontrol et
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
