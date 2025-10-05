-- Posts Policy Reset - Ayrı Script (Deadlock Önleme)

-- 1. RLS açık ve zorunlu
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts FORCE ROW LEVEL SECURITY;

-- 2. Mevcut policy'leri temizle
DROP POLICY IF EXISTS "posts select" ON public.posts;
DROP POLICY IF EXISTS "posts insert" ON public.posts;
DROP POLICY IF EXISTS "posts update" ON public.posts;

-- 3. Okuma politikası
CREATE POLICY "posts select"
ON public.posts FOR SELECT
TO anon, authenticated
USING (true);

-- 4. Insert politikası
CREATE POLICY "posts insert"
ON public.posts FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = author_id);

-- 5. Update politikası
CREATE POLICY "posts update"
ON public.posts FOR UPDATE
TO authenticated
USING (auth.uid() = author_id)
WITH CHECK (auth.uid() = author_id);

-- 6. RLS durumunu kontrol et
SELECT 
    'posts RLS' as test_type,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'posts';
