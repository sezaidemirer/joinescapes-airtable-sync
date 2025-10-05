-- TÜM UPDATE POLICY'LERİNİ TEMİZLE VE YENİSİNİ OLUŞTUR

-- 1. Mevcut UPDATE policy'lerini listele
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual as "using_clause",
    with_check as "with_check_clause"
FROM pg_policies
WHERE tablename = 'posts' AND cmd = 'UPDATE';

-- 2. TÜM UPDATE POLICY'LERİNİ KALDIR
DROP POLICY IF EXISTS "Authors can update their own posts" ON posts;
DROP POLICY IF EXISTS "Authors and admins can update posts" ON posts;
DROP POLICY IF EXISTS "Admin can update all posts" ON posts;
DROP POLICY IF EXISTS "Authors and admin can update posts" ON posts;
DROP POLICY IF EXISTS "Admin and authors can update posts" ON posts;
DROP POLICY IF EXISTS "Admin can edit all posts including null authors" ON posts;

-- 3. YENİ BASIT POLICY OLUŞTUR
CREATE POLICY "Admin can edit everything" ON posts
    FOR UPDATE 
    USING (auth.email() = 'test@test.com')
    WITH CHECK (auth.email() = 'test@test.com');

-- 4. Kontrol: Yeni policy
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual as "using_clause",
    with_check as "with_check_clause"
FROM pg_policies
WHERE tablename = 'posts' AND cmd = 'UPDATE';

-- 5. Test: Admin'in düzenleyebileceği yazıları göster
SELECT 
    COUNT(*) as toplam_yazı,
    COUNT(CASE WHEN author_id IS NULL THEN 1 END) as null_author_yazı,
    COUNT(CASE WHEN author_id IS NOT NULL THEN 1 END) as normal_yazı
FROM posts;
