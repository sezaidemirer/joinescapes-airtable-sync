-- Gulbahar Semra'nın rolünü düzelt
-- Normal kullanıcı yerine editör yap

-- 1. Gulbahar Semra'nın mevcut durumunu kontrol et
SELECT 
    'MEVCUT DURUM' as test_type,
    au.id,
    au.email,
    au.raw_user_meta_data->>'role' as role,
    au.raw_user_meta_data->>'editor_approved' as editor_approved,
    au.raw_user_meta_data->>'is_approved' as is_approved,
    au.raw_user_meta_data->>'first_name' as first_name,
    au.raw_user_meta_data->>'last_name' as last_name,
    wp.user_id IS NOT NULL as has_writer_profile,
    wp.is_featured
FROM auth.users au
LEFT JOIN writer_profiles wp ON au.id = wp.user_id
WHERE au.email = 'gulbahar.semra@hotmail.com';

-- 2. Gulbahar Semra'nın rolünü editör olarak düzelt
UPDATE auth.users 
SET raw_user_meta_data = '{
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
    "author_title": "Yazar",
    "profile_image": ""
}'::jsonb
WHERE email = 'gulbahar.semra@hotmail.com';

-- 3. Gulbahar Semra için writer_profiles kaydını oluştur/güncelle
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

-- 4. Düzeltilmiş durumu kontrol et
SELECT 
    'DÜZELTİLMİŞ DURUM' as test_type,
    au.id,
    au.email,
    au.raw_user_meta_data->>'role' as role,
    au.raw_user_meta_data->>'editor_approved' as editor_approved,
    au.raw_user_meta_data->>'is_approved' as is_approved,
    au.raw_user_meta_data->>'first_name' as first_name,
    au.raw_user_meta_data->>'last_name' as last_name,
    wp.user_id IS NOT NULL as has_writer_profile,
    wp.name as writer_name,
    wp.title as writer_title,
    wp.is_featured
FROM auth.users au
LEFT JOIN writer_profiles wp ON au.id = wp.user_id
WHERE au.email = 'gulbahar.semra@hotmail.com';

-- 5. RLS'yi tekrar etkinleştir (güvenli politikalar ile)
ALTER TABLE writer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- 6. Basit ve güvenli RLS politikaları oluştur
DROP POLICY IF EXISTS "writer_profiles_select_policy" ON writer_profiles;
DROP POLICY IF EXISTS "writer_profiles_insert_policy" ON writer_profiles;
DROP POLICY IF EXISTS "writer_profiles_update_policy" ON writer_profiles;
DROP POLICY IF EXISTS "posts_select_policy" ON posts;
DROP POLICY IF EXISTS "posts_insert_policy" ON posts;
DROP POLICY IF EXISTS "posts_update_policy" ON posts;

-- Herkes okuyabilir
CREATE POLICY "writer_profiles_select_policy" ON writer_profiles
    FOR SELECT 
    USING (true);

CREATE POLICY "posts_select_policy" ON posts
    FOR SELECT 
    USING (true);

-- Authenticated users can insert/update
CREATE POLICY "writer_profiles_insert_policy" ON writer_profiles
    FOR INSERT 
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "writer_profiles_update_policy" ON writer_profiles
    FOR UPDATE 
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "posts_insert_policy" ON posts
    FOR INSERT 
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "posts_update_policy" ON posts
    FOR UPDATE 
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- 7. Final durumu kontrol et
SELECT 
    'FINAL DURUM' as test_type,
    au.email,
    au.raw_user_meta_data->>'role' as role,
    au.raw_user_meta_data->>'editor_approved' as editor_approved,
    au.raw_user_meta_data->>'is_approved' as is_approved,
    wp.is_featured,
    'RLS ENABLED' as rls_status
FROM auth.users au
LEFT JOIN writer_profiles wp ON au.id = wp.user_id
WHERE au.email = 'gulbahar.semra@hotmail.com';
