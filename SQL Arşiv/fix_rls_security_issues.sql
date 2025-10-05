-- Supabase Advisors uyarılarını düzelt
-- "Database error granting user" hatası için

-- 1. writer_profiles tablosuna email kolonu ekle (eğer yoksa)
ALTER TABLE writer_profiles 
ADD COLUMN IF NOT EXISTS email TEXT;

-- 2. Mevcut kayıtlar için email bilgisini güncelle
UPDATE writer_profiles 
SET email = (
    SELECT email 
    FROM auth.users 
    WHERE auth.users.id = writer_profiles.user_id
)
WHERE email IS NULL;

-- 3. gulbahar.semra@hotmail.com için writer_profiles kaydı oluştur
INSERT INTO writer_profiles (user_id, name, email, is_featured)
SELECT 
    id,
    split_part(email, '@', 1) as name,
    email,
    true as is_featured
FROM auth.users 
WHERE email = 'gulbahar.semra@hotmail.com'
AND NOT EXISTS (
    SELECT 1 FROM writer_profiles 
    WHERE user_id = auth.users.id
);

-- 4. Tüm mevcut RLS politikalarını temizle
DROP POLICY IF EXISTS "writer_profiles_select_policy" ON writer_profiles;
DROP POLICY IF EXISTS "writer_profiles_insert_policy" ON writer_profiles;
DROP POLICY IF EXISTS "writer_profiles_update_policy" ON writer_profiles;
DROP POLICY IF EXISTS "posts_select_policy" ON posts;
DROP POLICY IF EXISTS "posts_insert_policy" ON posts;
DROP POLICY IF EXISTS "posts_update_policy" ON posts;
DROP POLICY IF EXISTS "Admins can update al..." ON posts;

-- 5. writer_profiles için güvenli RLS politikaları oluştur
CREATE POLICY "writer_profiles_select_policy" ON writer_profiles
    FOR SELECT 
    USING (true);

CREATE POLICY "writer_profiles_insert_policy" ON writer_profiles
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "writer_profiles_update_policy" ON writer_profiles
    FOR UPDATE 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 6. posts için güvenli RLS politikaları oluştur
CREATE POLICY "posts_select_policy" ON posts
    FOR SELECT 
    USING (true);

CREATE POLICY "posts_insert_policy" ON posts
    FOR INSERT 
    WITH CHECK (
        auth.uid() = author_id 
        AND EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND (raw_user_meta_data::jsonb)->>'role' IN ('editor', 'yazar', 'admin', 'supervisor')
        )
    );

CREATE POLICY "posts_update_policy" ON posts
    FOR UPDATE 
    USING (
        auth.uid() = author_id 
        OR EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND (raw_user_meta_data::jsonb)->>'role' = 'admin'
        )
    )
    WITH CHECK (
        auth.uid() = author_id 
        OR EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND (raw_user_meta_data::jsonb)->>'role' = 'admin'
        )
    );

-- 7. RLS'yi etkinleştir (Bu çok önemli!)
ALTER TABLE writer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- 8. Sonucu kontrol et
SELECT 
    'writer_profiles' as table_name,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'writer_profiles'
UNION ALL
SELECT 
    'posts' as table_name,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'posts';

-- 9. Kullanıcı durumunu kontrol et
SELECT 
    wp.user_id,
    wp.name,
    wp.email,
    wp.is_featured,
    au.email as auth_email,
    au.raw_user_meta_data->>'role' as user_role
FROM writer_profiles wp
JOIN auth.users au ON wp.user_id = au.id
WHERE wp.email = 'gulbahar.semra@hotmail.com';
