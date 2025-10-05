-- Admin'in author_id = NULL olan Airtable yazılarını düzenlemesine izin ver

-- 1. Mevcut UPDATE RLS politikalarını kontrol et
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual as "using_clause",
    with_check as "with_check_clause"
FROM pg_policies
WHERE tablename = 'posts' AND cmd = 'UPDATE';

-- 2. Eski UPDATE politikalarını kaldır
DROP POLICY IF EXISTS "Authors can update their own posts" ON posts;
DROP POLICY IF EXISTS "Authors and admins can update posts" ON posts;
DROP POLICY IF EXISTS "Admin can update all posts" ON posts;
DROP POLICY IF EXISTS "Authors and admin can update posts" ON posts;
DROP POLICY IF EXISTS "Admin and authors can update posts" ON posts;

-- 3. YENİ POLİTİKA: Admin tüm yazıları düzenleyebilir (author_id NULL olsa bile!)
CREATE POLICY "Admin can edit all posts including null authors" ON posts
    FOR UPDATE 
    USING (
        auth.email() = 'test@test.com'
        OR auth.uid() = author_id
    )
    WITH CHECK (
        auth.email() = 'test@test.com'
        OR auth.uid() = author_id
    );

-- 4. Kontrol: Yeni politika
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual as "using_clause",
    with_check as "with_check_clause"
FROM pg_policies
WHERE tablename = 'posts' AND cmd = 'UPDATE';

-- 5. Airtable yazılarının durumu (NULL kalacak)
SELECT 
    COUNT(*) as airtable_posts,
    author_id::text,
    author_name
FROM posts
WHERE airtable_record_id IS NOT NULL
GROUP BY author_id, author_name;

