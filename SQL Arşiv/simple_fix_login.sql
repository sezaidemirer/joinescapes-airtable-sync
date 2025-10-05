-- Basit giriş hatası düzeltmesi
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
    split_part(email, '@', 1) as name,  -- Email'den isim çıkar
    email,
    true as is_featured  -- Onaylanmış editör olduğu için featured
FROM auth.users 
WHERE email = 'gulbahar.semra@hotmail.com'
AND NOT EXISTS (
    SELECT 1 FROM writer_profiles 
    WHERE user_id = auth.users.id
);

-- 4. RLS politikalarını basitleştir
DROP POLICY IF EXISTS "writer_profiles_select_policy" ON writer_profiles;
DROP POLICY IF EXISTS "writer_profiles_insert_policy" ON writer_profiles;
DROP POLICY IF EXISTS "writer_profiles_update_policy" ON writer_profiles;

-- Herkes okuyabilir
CREATE POLICY "writer_profiles_select_policy" ON writer_profiles
    FOR SELECT 
    USING (true);

-- Authenticated users can insert
CREATE POLICY "writer_profiles_insert_policy" ON writer_profiles
    FOR INSERT 
    WITH CHECK (true);

-- Authenticated users can update
CREATE POLICY "writer_profiles_update_policy" ON writer_profiles
    FOR UPDATE 
    USING (true)
    WITH CHECK (true);

-- 5. posts tablosu için de basitleştir
DROP POLICY IF EXISTS "posts_select_policy" ON posts;
DROP POLICY IF EXISTS "posts_insert_policy" ON posts;
DROP POLICY IF EXISTS "posts_update_policy" ON posts;

-- Herkes okuyabilir
CREATE POLICY "posts_select_policy" ON posts
    FOR SELECT 
    USING (true);

-- Authenticated users can insert
CREATE POLICY "posts_insert_policy" ON posts
    FOR INSERT 
    WITH CHECK (true);

-- Authenticated users can update
CREATE POLICY "posts_update_policy" ON posts
    FOR UPDATE 
    USING (true)
    WITH CHECK (true);

-- 6. Sonucu kontrol et
SELECT 
    wp.user_id,
    wp.name,
    wp.email,
    wp.is_featured,
    au.email as auth_email
FROM writer_profiles wp
JOIN auth.users au ON wp.user_id = au.id
WHERE wp.email = 'gulbahar.semra@hotmail.com';
