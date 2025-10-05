-- ACİL SELECT POLICY DÜZELTMESİ
-- SİTE ÇÖKMESİNİ DÜZELTİYORUZ!

-- Mevcut SELECT policy'lerini kaldır
DROP POLICY IF EXISTS "posts_select_all" ON public.posts;
DROP POLICY IF EXISTS "posts_select_published_or_own" ON public.posts;
DROP POLICY IF EXISTS "posts_select_published_anon" ON public.posts;

-- YENİ SELECT POLICY'LER:

-- 1. ANONİM KULLANICILAR: Sadece published yazıları görebilir
CREATE POLICY "anon_can_select_published"
ON public.posts FOR SELECT
TO anon
USING (status = 'published');

-- 2. AUTHENTICATED KULLANICILAR: Published yazıları veya kendi yazılarını görebilir
CREATE POLICY "authenticated_can_select_published_or_own"
ON public.posts FOR SELECT
TO authenticated
USING (
  status = 'published' 
  OR auth.uid() = author_id
);

-- Kontrol et
SELECT 
    'SELECT Policies Oluşturuldu' as sonuc,
    policyname,
    cmd,
    roles
FROM pg_policies
WHERE tablename = 'posts' AND schemaname = 'public' AND cmd = 'SELECT'
ORDER BY policyname;

