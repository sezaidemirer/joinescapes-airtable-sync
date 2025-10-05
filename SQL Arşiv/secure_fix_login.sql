-- Güvenli giriş hatası düzeltmesi
-- "Database error granting user" hatası için
-- RLS güvenliği korunarak

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

-- 4. Güvenli RLS politikalarını yeniden oluştur
DROP POLICY IF EXISTS "writer_profiles_select_policy" ON writer_profiles;
DROP POLICY IF EXISTS "writer_profiles_insert_policy" ON writer_profiles;
DROP POLICY IF EXISTS "writer_profiles_update_policy" ON writer_profiles;

-- Herkes yazarları okuyabilir (public read)
CREATE POLICY "writer_profiles_select_policy" ON writer_profiles
    FOR SELECT 
    USING (true);

-- Sadece kendi profillerini oluşturabilir (authenticated users)
CREATE POLICY "writer_profiles_insert_policy" ON writer_profiles
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Sadece kendi profillerini güncelleyebilir (authenticated users)
CREATE POLICY "writer_profiles_update_policy" ON writer_profiles
    FOR UPDATE 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 5. Posts tablosu için güvenli politikalar
DROP POLICY IF EXISTS "posts_select_policy" ON posts;
DROP POLICY IF EXISTS "posts_insert_policy" ON posts;
DROP POLICY IF EXISTS "posts_update_policy" ON posts;

-- Herkes yazıları okuyabilir (public read)
CREATE POLICY "posts_select_policy" ON posts
    FOR SELECT 
    USING (true);

-- Sadece editörler yazı oluşturabilir (authenticated users)
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

-- Sadece yazı sahibi güncelleyebilir (authenticated users)
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

-- 6. RLS'yi etkinleştir
ALTER TABLE writer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- 7. Sonucu kontrol et
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
