-- Admin (test@test.com) tüm yazıları güncelleyebilsin
-- Airtable yazıları (author_id = NULL) dahil!

-- 1. Mevcut UPDATE policy'sini kontrol et
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
WHERE tablename = 'posts' AND cmd = 'UPDATE';

-- 2. Eski policy'leri sil
DROP POLICY IF EXISTS "Authors can update their own posts" ON posts;
DROP POLICY IF EXISTS "Authors and admins can update posts" ON posts;
DROP POLICY IF EXISTS "Admin can update all posts" ON posts;
DROP POLICY IF EXISTS "Admin and authors can update posts" ON posts;

-- 3. YENİ POLİCY: Admin HER ŞEYİ güncelleyebilir, yazarlar sadece kendi yazılarını
CREATE POLICY "Admin can update all posts, authors their own" ON posts
    FOR UPDATE 
    USING (
        auth.email() = 'test@test.com'  -- Admin her şeyi güncelleyebilir
        OR 
        auth.uid() = author_id           -- Yazarlar kendi yazılarını
    )
    WITH CHECK (
        auth.email() = 'test@test.com'  -- Admin her şeyi güncelleyebilir
        OR 
        auth.uid() = author_id           -- Yazarlar kendi yazılarını
    );

-- 4. Kontrol: Policy'i göster
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'posts' AND cmd = 'UPDATE';

-- 5. Şimdi admin olarak UPDATE yap!
UPDATE posts
SET 
    author_id = (SELECT id FROM auth.users WHERE email = 'joinprmarketing@gmail.com' LIMIT 1),
    author_name = 'Join PR',
    updated_at = NOW()
WHERE airtable_record_id IS NOT NULL;

-- 6. Kontrol: Kaç yazı güncellendi?
SELECT 
    'Join PR yazıları:' as durum,
    COUNT(*) as sayi
FROM posts
WHERE author_name = 'Join PR';

-- 7. Son kontrol: author_name'e göre dağılım
SELECT 
    author_name,
    COUNT(*) as sayi
FROM posts
WHERE airtable_record_id IS NOT NULL
GROUP BY author_name;

