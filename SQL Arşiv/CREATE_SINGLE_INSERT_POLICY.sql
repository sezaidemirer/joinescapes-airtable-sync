-- ============================================
-- CREATE_SINGLE_INSERT_POLICY.sql
-- TEK BİR INSERT POLİTİKASI OLUŞTUR
-- ============================================

-- ============================================
-- ÖNCE TÜM INSERT POLİTİKALARINI SİL
-- ============================================
DO $$ 
DECLARE 
  pol record;
BEGIN
  FOR pol IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'posts' AND cmd = 'INSERT'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.posts', pol.policyname);
    RAISE NOTICE 'Silindi: %', pol.policyname;
  END LOOP;
END $$;

-- ============================================
-- TEK BİR YENİ INSERT POLİTİKASI OLUŞTUR
-- ============================================
CREATE POLICY "allow_authenticated_insert_own_posts"
ON public.posts
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = author_id
);

-- ============================================
-- VERİFİKASYON
-- ============================================
SELECT 
  '✅ YENİ POLİTİKA OLUŞTURULDU' as status,
  policyname,
  cmd,
  roles,
  with_check
FROM pg_policies 
WHERE tablename = 'posts' 
  AND cmd = 'INSERT';

-- ============================================
-- TÜM POSTS POLİTİKALARINI GÖSTER
-- ============================================
SELECT 
  '📊 TÜM POSTS POLİTİKALARI:' as info,
  policyname,
  cmd
FROM pg_policies 
WHERE tablename = 'posts'
ORDER BY cmd, policyname;

