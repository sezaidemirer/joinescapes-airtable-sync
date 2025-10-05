-- Kullanıcı giriş hatası için düzeltme script'i
-- "Database error granting user" hatası çözümü

-- 1. writer_profiles tablosu için RLS politikalarını düzelt
DROP POLICY IF EXISTS "writer_profiles_select_policy" ON writer_profiles;
DROP POLICY IF EXISTS "writer_profiles_insert_policy" ON writer_profiles;
DROP POLICY IF EXISTS "writer_profiles_update_policy" ON writer_profiles;

-- Public read access - herkes okuyabilir
CREATE POLICY "writer_profiles_select_policy" ON writer_profiles
    FOR SELECT 
    USING (true);

-- Authenticated users can insert their own profile
CREATE POLICY "writer_profiles_insert_policy" ON writer_profiles
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Authenticated users can update their own profile
CREATE POLICY "writer_profiles_update_policy" ON writer_profiles
    FOR UPDATE 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 2. posts tablosu için RLS politikalarını kontrol et ve düzelt
DROP POLICY IF EXISTS "posts_select_policy" ON posts;
DROP POLICY IF EXISTS "posts_insert_policy" ON posts;
DROP POLICY IF EXISTS "posts_update_policy" ON posts;

-- Public read access - herkes okuyabilir
CREATE POLICY "posts_select_policy" ON posts
    FOR SELECT 
    USING (true);

-- Authenticated users can insert posts
CREATE POLICY "posts_insert_policy" ON posts
    FOR INSERT 
    WITH CHECK (auth.uid() = author_id);

-- Authors can update their own posts
CREATE POLICY "posts_update_policy" ON posts
    FOR UPDATE 
    USING (auth.uid() = author_id)
    WITH CHECK (auth.uid() = author_id);

-- 3. Eğer gulbahar.semra@hotmail.com için writer_profiles kaydı yoksa oluştur
INSERT INTO writer_profiles (user_id, name, email, is_featured)
SELECT 
    id,
    COALESCE(
        (raw_user_meta_data::jsonb)->>'first_name' || ' ' || (raw_user_meta_data::jsonb)->>'last_name',
        (raw_user_meta_data::jsonb)->>'full_name',
        split_part(email, '@', 1)
    ) as name,
    email,
    CASE 
        WHEN (raw_user_meta_data::jsonb)->>'editor_approved' = 'true' 
        AND (raw_user_meta_data::jsonb)->>'is_approved' = 'true' 
        THEN true 
        ELSE false 
    END as is_featured
FROM auth.users 
WHERE email = 'gulbahar.semra@hotmail.com'
AND NOT EXISTS (
    SELECT 1 FROM writer_profiles 
    WHERE user_id = auth.users.id
);

-- 4. Bu kullanıcının metadata'sını kontrol et ve düzelt
UPDATE auth.users 
SET raw_user_meta_data = (raw_user_meta_data::jsonb) || '{"role": "editor"}'::jsonb
WHERE email = 'gulbahar.semra@hotmail.com'
AND (raw_user_meta_data::jsonb)->>'role' IS NULL;

-- 5. RLS'yi writer_profiles için etkinleştir (eğer değilse)
ALTER TABLE writer_profiles ENABLE ROW LEVEL SECURITY;

-- 6. RLS'yi posts için etkinleştir (eğer değilse)
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
