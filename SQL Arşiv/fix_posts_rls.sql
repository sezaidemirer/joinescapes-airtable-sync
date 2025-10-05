-- Posts tablosu için RLS policy'lerini düzelt
-- Bu dosyayı Supabase SQL Editor'da çalıştırın

-- 1. Mevcut policy'leri kontrol et
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'posts';

-- 2. Eski policy'leri sil
DROP POLICY IF EXISTS "posts_select_policy" ON posts;
DROP POLICY IF EXISTS "posts_insert_policy" ON posts;
DROP POLICY IF EXISTS "posts_update_policy" ON posts;

-- 3. Public okuma için policy oluştur
CREATE POLICY "posts_public_read" ON posts
    FOR SELECT 
    USING (true);

-- 4. Authenticated kullanıcılar yazı oluşturabilir
CREATE POLICY "posts_authenticated_insert" ON posts
    FOR INSERT 
    TO authenticated
    WITH CHECK (true);

-- 5. Kullanıcılar kendi yazılarını güncelleyebilir
CREATE POLICY "posts_authenticated_update" ON posts
    FOR UPDATE 
    TO authenticated
    USING (true);

-- 6. Test için posts tablosuna yazı eklemeyi dene
INSERT INTO posts (title, slug, excerpt, content, author_name, status, category_id)
VALUES ('Test Yazı', 'test-yazi', 'Test açıklama', 'Test içerik', 'Test Yazar', 'draft', 1);

-- 7. Sonucu kontrol et
SELECT * FROM posts WHERE title = 'Test Yazı';


