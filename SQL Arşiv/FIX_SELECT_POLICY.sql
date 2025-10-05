-- SELECT POLICY'Yİ DÜZELTELİM
-- Şu anda authenticated kullanıcılar kendi yazılarını bile göremiyorlar!

-- Mevcut SELECT policy'lerini kontrol et
SELECT 
    'Mevcut SELECT Policies' as test,
    policyname,
    cmd,
    roles,
    using_clause
FROM pg_policies
WHERE tablename = 'posts' AND schemaname = 'public' AND cmd = 'SELECT';

-- ESKİ SELECT POLICY'LERİNİ KALDIR
DROP POLICY IF EXISTS "posts_select_published_or_own" ON public.posts;
DROP POLICY IF EXISTS "posts_select_published_anon" ON public.posts;

-- YENİ, BASİT SELECT POLICY: Herkes her şeyi görebilir (geçici olarak test için)
CREATE POLICY "posts_select_all"
ON public.posts FOR SELECT
TO authenticated, anon
USING (true);

-- Kontrol et
SELECT 
    'Yeni SELECT Policy' as test,
    policyname,
    cmd,
    roles
FROM pg_policies
WHERE tablename = 'posts' AND schemaname = 'public' AND cmd = 'SELECT';

