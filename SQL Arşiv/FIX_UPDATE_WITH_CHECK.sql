-- UPDATE policy'de WITH CHECK clause eksik olabilir!
-- Bu çok önemli bir detay - PostgreSQL RLS'de UPDATE için hem USING hem WITH CHECK gerekir

-- 1. Mevcut UPDATE policy'lerini kaldır
DROP POLICY IF EXISTS "Authors can update their own posts" ON posts;
DROP POLICY IF EXISTS "Authors and admins can update posts" ON posts;
DROP POLICY IF EXISTS "Admins can update all posts" ON posts;
DROP POLICY IF EXISTS "Admin can update all posts" ON posts;

-- 2. YENİ POLİCY - USING ve WITH CHECK AYRI AYRI!
CREATE POLICY "Admin and authors can update posts" ON posts
    FOR UPDATE 
    USING (
        -- Hangi satırları görebilir/seçebilir
        auth.uid() = author_id 
        OR auth.email() = 'test@test.com'
    )
    WITH CHECK (
        -- Hangi değişiklikleri yapabilir
        auth.uid() = author_id 
        OR auth.email() = 'test@test.com'
    );

-- 3. SELECT policy'yi de kontrol edelim
SELECT 
    policyname, 
    cmd, 
    permissive,
    qual::text as using_clause,
    with_check::text as with_check_clause
FROM pg_policies 
WHERE tablename = 'posts'
ORDER BY cmd, policyname;

-- 4. Test UPDATE (Supabase Dashboard'da manuel test)
-- UPDATE posts 
-- SET status = 'published', published_at = NOW() 
-- WHERE id = 319;

