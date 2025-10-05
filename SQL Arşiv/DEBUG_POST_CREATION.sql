-- ============================================
-- DEBUG_POST_CREATION.sql
-- Yazı oluşturma sorununu debug et
-- ============================================

-- ============================================
-- 1. RLS DURUMUNU KONTROL ET
-- ============================================
SELECT 
  '🔍 RLS DURUMU:' as info,
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'posts';

-- ============================================
-- 2. TÜM POSTS POLİTİKALARINI GÖSTER
-- ============================================
SELECT 
  '📋 TÜM POSTS POLİTİKALARI:' as info,
  policyname,
  cmd,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'posts'
ORDER BY cmd, policyname;

-- ============================================
-- 3. POSTS TABLOSU YAPISINI KONTROL ET
-- ============================================
SELECT 
  '📊 POSTS TABLOSU KOLONLARI:' as info,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'posts'
ORDER BY ordinal_position;

-- ============================================
-- 4. AUTHOR_ID KOLONU VAR MI?
-- ============================================
SELECT 
  '🔍 AUTHOR_ID KOLONU:' as info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'posts'
  AND column_name = 'author_id';

-- ============================================
-- 5. GEÇERLİ KULLANICININ ID'SİNİ AL
-- ============================================
SELECT 
  '👤 GEÇERLİ KULLANICI:' as info,
  auth.uid() as current_user_id,
  auth.role() as current_role;

-- ============================================
-- 6. TEST INSERT (DRY RUN)
-- ============================================
-- Bu sadece izinleri kontrol eder, gerçekten insert yapmaz
EXPLAIN (FORMAT JSON)
INSERT INTO public.posts (
  title,
  slug,
  content,
  author_id,
  status
) VALUES (
  'Test Yazı',
  'test-yazi',
  'Test içerik',
  auth.uid(),
  'draft'
);

