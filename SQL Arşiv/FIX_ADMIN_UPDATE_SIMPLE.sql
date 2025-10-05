-- ADMİN ONAY SORUNU - BASİT ÇÖZÜM
-- test@test.com kullanıcısına özel yetki ver

-- 1. Önce test@test.com kullanıcısının bilgilerini kontrol et
SELECT 
    id,
    email,
    raw_user_meta_data,
    raw_user_meta_data->>'user_role' as user_role
FROM auth.users
WHERE email = 'test@test.com';

-- 2. Tüm mevcut UPDATE policy'lerini kaldır
DROP POLICY IF EXISTS "Authors can update their own posts" ON posts;
DROP POLICY IF EXISTS "Authors and admins can update posts" ON posts;
DROP POLICY IF EXISTS "Admins can update all posts" ON posts;

-- 3. ÇOK BASİT ÇÖZÜM: test@test.com TÜM YAZILARI GÜNCELLEYEBİLİR
CREATE POLICY "Admin can update all posts" ON posts
    FOR UPDATE USING (
        -- Kendi yazısını güncelleyebilir
        auth.uid() = author_id
        OR
        -- test@test.com tüm yazıları güncelleyebilir
        auth.email() = 'test@test.com'
    );

-- 4. Alternatif: Authenticated tüm kullanıcılar tüm yazıları güncelleyebilir (SADECE TEST İÇİN!)
-- DROP POLICY IF EXISTS "Admin can update all posts" ON posts;
-- CREATE POLICY "All authenticated users can update posts" ON posts
--     FOR UPDATE USING (auth.role() = 'authenticated');

-- 5. Policy'leri kontrol et
SELECT 
    policyname, 
    cmd, 
    qual::text as condition
FROM pg_policies 
WHERE tablename = 'posts' AND cmd = 'UPDATE'
ORDER BY policyname;

-- 6. Test: Şimdi bu UPDATE query'sini dene (admin olarak giriş yaptıktan sonra)
-- UPDATE posts SET status = 'published', published_at = NOW() WHERE id = 319;

