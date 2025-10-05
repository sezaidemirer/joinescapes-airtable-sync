-- RLS'yi tekrar aktif et ve admin için özel politika oluştur

-- 1. RLS'yi aktif et
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- 2. Mevcut politikaları temizle
DROP POLICY IF EXISTS "Posts viewable by status" ON posts;
DROP POLICY IF EXISTS "Authors and admin can update posts" ON posts;
DROP POLICY IF EXISTS "Authors can insert their own posts" ON posts;

-- 3. Yeni SELECT politikası - Herkes published postları görebilir, authenticated kullanıcılar tümünü
CREATE POLICY "Posts select policy" ON posts
    FOR SELECT USING (
        status = 'published' 
        OR auth.role() = 'authenticated'
    );

-- 4. Yeni UPDATE politikası - Yazarlar kendi yazılarını, admin tüm yazıları güncelleyebilir
CREATE POLICY "Posts update policy" ON posts
    FOR UPDATE USING (
        auth.uid() = author_id 
        OR auth.email() = 'test@test.com'
    )
    WITH CHECK (
        auth.uid() = author_id 
        OR auth.email() = 'test@test.com'
    );

-- 5. Yeni INSERT politikası - Yazarlar yazı ekleyebilir
CREATE POLICY "Posts insert policy" ON posts
    FOR INSERT WITH CHECK (
        auth.uid() = author_id
    );

-- 6. Kontrol et
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'posts';
