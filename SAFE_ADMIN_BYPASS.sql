-- GÜVENLİ ÇÖZÜM: Admin için RLS bypass (diğer kullanıcılar etkilenmez)

-- 1. Mevcut RLS durumu
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'posts';

-- 2. TÜM UPDATE policy'lerini kaldır
DROP POLICY IF EXISTS "Authors can update their own posts" ON posts;
DROP POLICY IF EXISTS "Authors and admins can update posts" ON posts;
DROP POLICY IF EXISTS "Admin can update all posts" ON posts;
DROP POLICY IF EXISTS "Authors and admin can update posts" ON posts;
DROP POLICY IF EXISTS "Admin and authors can update posts" ON posts;
DROP POLICY IF EXISTS "Admin can edit all posts including null authors" ON posts;
DROP POLICY IF EXISTS "Admin can edit everything" ON posts;

-- 3. YENİ POLICY: Admin her şeyi, yazarlar sadece kendi yazılarını
CREATE POLICY "Safe admin and author update" ON posts
    FOR UPDATE 
    USING (
        auth.email() = 'test@test.com'  -- Admin her şeyi düzenleyebilir
        OR 
        auth.uid() = author_id          -- Yazarlar sadece kendi yazılarını
    )
    WITH CHECK (
        auth.email() = 'test@test.com'  -- Admin her şeyi düzenleyebilir
        OR 
        auth.uid() = author_id          -- Yazarlar sadece kendi yazılarını
    );

-- 4. Kontrol: Yeni policy
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual as "using_clause"
FROM pg_policies
WHERE tablename = 'posts' AND cmd = 'UPDATE';

-- 5. Test: Admin'in düzenleyebileceği yazı sayısı
SELECT 
    'Admin test@test.com için:' as durum,
    COUNT(*) as düzenlenebilir_yazı_sayısı
FROM posts;
