-- RLS & Policy Reset - Basit Versiyon (Deadlock Önleme)
-- Tek tek çalıştır

-- 1. RLS açık ve zorunlu
ALTER TABLE public.writer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.writer_profiles FORCE ROW LEVEL SECURITY;

-- 2. Mevcut policy'leri temizle
DROP POLICY IF EXISTS "wp select" ON public.writer_profiles;
DROP POLICY IF EXISTS "wp insert" ON public.writer_profiles;
DROP POLICY IF EXISTS "wp update" ON public.writer_profiles;

-- 3. Okuma politikası
CREATE POLICY "wp select"
ON public.writer_profiles FOR SELECT
TO anon, authenticated
USING (true);

-- 4. Insert politikası
CREATE POLICY "wp insert"
ON public.writer_profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 5. Update politikası
CREATE POLICY "wp update"
ON public.writer_profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 6. RLS durumunu kontrol et
SELECT 
    'writer_profiles RLS' as test_type,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'writer_profiles';
