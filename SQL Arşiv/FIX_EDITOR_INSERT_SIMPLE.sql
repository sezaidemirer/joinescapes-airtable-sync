-- ============================================
-- EDİTÖR YAZI OLUŞTURMA SORUNU - BASİT ÇÖZÜM
-- ============================================

-- 1. Mevcut INSERT policy'lerini temizle
DROP POLICY IF EXISTS "allow_authenticated_insert_own_posts" ON public.posts;
DROP POLICY IF EXISTS "editors_can_create_posts" ON public.posts;
DROP POLICY IF EXISTS "Authenticated can create posts" ON public.posts;
DROP POLICY IF EXISTS "allow_authenticated_users_insert_posts" ON public.posts;
DROP POLICY IF EXISTS "posts insert" ON public.posts;
DROP POLICY IF EXISTS "Authors can insert their own posts" ON public.posts;
DROP POLICY IF EXISTS "allow_editors_and_admins_to_insert_posts" ON public.posts;

-- 2. YENİ, BASİT INSERT POLICY: Authenticated kullanıcılar kendi author_id'leriyle yazı ekleyebilir
CREATE POLICY "authenticated_users_can_insert_own_posts"
ON public.posts FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = author_id);

-- 3. Kontrol et
SELECT 
    'INSERT Policy Oluşturuldu' as sonuc,
    policyname,
    cmd,
    with_check
FROM pg_policies 
WHERE tablename = 'posts' AND schemaname = 'public' AND cmd = 'INSERT';

