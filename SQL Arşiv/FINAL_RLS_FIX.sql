-- SON RLS DÜZELTMESİ - ARTIK YETER!
-- "Database error granting user" hatası için KESİN ÇÖZÜM

-- 1. TÜM RLS POLİTİKALARINI SİL
DROP POLICY IF EXISTS "writer_profiles_select_policy" ON writer_profiles;
DROP POLICY IF EXISTS "writer_profiles_insert_policy" ON writer_profiles;
DROP POLICY IF EXISTS "writer_profiles_update_policy" ON writer_profiles;
DROP POLICY IF EXISTS "posts_select_policy" ON posts;
DROP POLICY IF EXISTS "posts_insert_policy" ON posts;
DROP POLICY IF EXISTS "posts_update_policy" ON posts;
DROP POLICY IF EXISTS "Admins can update al..." ON posts;

-- 2. writer_profiles TABLOSUNA EMAIL KOLONU EKLE
ALTER TABLE writer_profiles 
ADD COLUMN IF NOT EXISTS email TEXT;

-- 3. MEVCUT KAYITLAR İÇİN EMAIL BİLGİSİNİ GÜNCELLE
UPDATE writer_profiles 
SET email = (
    SELECT email 
    FROM auth.users 
    WHERE auth.users.id = writer_profiles.user_id
)
WHERE email IS NULL;

-- 4. gulbahar.semra@hotmail.com İÇİN KAYIT OLUŞTUR
INSERT INTO writer_profiles (user_id, name, email, title, is_featured)
SELECT 
    id,
    split_part(email, '@', 1) as name,
    email,
    'Yazar' as title,
    true as is_featured
FROM auth.users 
WHERE email = 'gulbahar.semra@hotmail.com'
ON CONFLICT (user_id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    title = EXCLUDED.title,
    is_featured = EXCLUDED.is_featured;

-- 5. BASİT VE ETKİLİ RLS POLİTİKALARI OLUŞTUR
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

-- 6. RLS'Yİ ETKİNLEŞTİR
ALTER TABLE writer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- 7. gulbahar.semra@hotmail.com KULLANICISININ METADATA'SINI DÜZELT
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

-- 8. SON DURUMU KONTROL ET
SELECT 
    'SUCCESS' as status,
    wp.user_id,
    wp.name,
    wp.email,
    wp.is_featured,
    au.email as auth_email,
    au.raw_user_meta_data->>'role' as user_role,
    au.email_confirmed_at IS NOT NULL as email_confirmed
FROM writer_profiles wp
JOIN auth.users au ON wp.user_id = au.id
WHERE wp.email = 'gulbahar.semra@hotmail.com';

-- 9. RLS DURUMUNU KONTROL ET
SELECT 
    'RLS STATUS' as info,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('writer_profiles', 'posts')
ORDER BY tablename;
