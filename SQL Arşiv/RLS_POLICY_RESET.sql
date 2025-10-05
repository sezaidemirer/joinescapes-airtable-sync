-- RLS & Policy Reset - Idempotent
-- Yeni kayıtlı kullanıcılar giriş sonrası "kullanıcı/profil çekemiyor" hatası için

-- RLS açık ve zorunlu
ALTER TABLE public.writer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.writer_profiles FORCE ROW LEVEL SECURITY;

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts FORCE ROW LEVEL SECURITY;

-- Mevcut policy'leri temizle
DROP POLICY IF EXISTS "wp select" ON public.writer_profiles;
DROP POLICY IF EXISTS "wp insert" ON public.writer_profiles;
DROP POLICY IF EXISTS "wp update" ON public.writer_profiles;

DROP POLICY IF EXISTS "posts select" ON public.posts;
DROP POLICY IF EXISTS "posts insert" ON public.posts;
DROP POLICY IF EXISTS "posts update" ON public.posts;

-- Okuma (public listeleme istiyorsak anon + authenticated)
CREATE POLICY "wp select"
ON public.writer_profiles FOR SELECT
TO anon, authenticated
USING (true);

-- Kendi profilini ekleyebilme/güncelleme
CREATE POLICY "wp insert"
ON public.writer_profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "wp update"
ON public.writer_profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Posts tarafı (anon da okuyabilsin istiyorsak)
CREATE POLICY "posts select"
ON public.posts FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "posts insert"
ON public.posts FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = author_id);

CREATE POLICY "posts update"
ON public.posts FOR UPDATE
TO authenticated
USING (auth.uid() = author_id)
WITH CHECK (auth.uid() = author_id);

-- RLS durumunu kontrol et
SELECT 
    'RLS DURUMU' as test_type,
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    hasrls
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('writer_profiles', 'posts')
ORDER BY tablename;

-- Policy'leri kontrol et
SELECT 
    'POLİTİKALAR' as test_type,
    schemaname,
    tablename,
    policyname,
    cmd,
    permissive,
    roles
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('writer_profiles', 'posts')
ORDER BY tablename, policyname;
