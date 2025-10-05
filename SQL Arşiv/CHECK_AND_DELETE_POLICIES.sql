-- ============================================
-- CHECK_AND_DELETE_POLICIES.sql
-- Önce kontrol et, sonra manuel sil
-- ============================================

-- ============================================
-- ADIM 1: TÜM POSTS POLİTİKALARINI LİSTELE
-- ============================================
SELECT 
  '📋 MEVCUT TÜM POSTS POLİTİKALARI:' as info,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'posts'
ORDER BY cmd, policyname;

-- ============================================
-- ADIM 2: INSERT POLİTİKALARINI GÖSTER
-- ============================================
SELECT 
  '🔍 INSERT POLİTİKALARI:' as info,
  policyname,
  cmd,
  with_check
FROM pg_policies 
WHERE tablename = 'posts' 
  AND cmd = 'INSERT';

