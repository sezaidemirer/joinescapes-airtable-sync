-- ZORLA SELECT POLICY DÜZELTMESİ
-- TÜM POLİCY'LERİ SİL VE YENİDEN OLUŞTUR

-- TÜM SELECT policy'lerini zorla sil
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'posts' 
        AND schemaname = 'public' 
        AND cmd = 'SELECT'
    ) LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.posts CASCADE';
    END LOOP;
END$$;

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

