-- Admin panelinde 'pending' statusundeki yazıların görünmesi için RLS politikasını düzelt
-- Bu SQL'i Supabase SQL Editor'da çalıştırın

-- 1. Mevcut SELECT policy'sini kaldır
DROP POLICY IF EXISTS "Published posts are viewable by everyone" ON posts;

-- 2. Yeni policy oluştur - pending yazılar da authenticated kullanıcılara görünsün
CREATE POLICY "Posts viewable by status" ON posts
    FOR SELECT USING (
        status = 'published' 
        OR auth.role() = 'authenticated'
    );

-- 3. Kontrol: Mevcut pending yazıları göster
SELECT 
    id,
    title,
    author_name,
    status,
    created_at
FROM posts
WHERE status = 'pending'
ORDER BY created_at DESC;

-- 4. Tüm posts policy'lerini göster
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'posts'
ORDER BY cmd, policyname;

