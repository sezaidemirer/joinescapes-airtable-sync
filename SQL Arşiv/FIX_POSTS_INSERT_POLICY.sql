-- ============================================
-- FIX_POSTS_INSERT_POLICY.sql
-- Editörlerin yazı oluşturmasına izin ver
-- ============================================

-- Mevcut INSERT politikasını kontrol edelim
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'posts' 
  AND cmd = 'INSERT';

-- ============================================
-- Eski INSERT politikalarını kaldır
-- ============================================
DROP POLICY IF EXISTS "posts_insert_policy" ON public.posts;
DROP POLICY IF EXISTS "Authenticated users can insert posts" ON public.posts;
DROP POLICY IF EXISTS "Users can insert their own posts" ON public.posts;
DROP POLICY IF EXISTS "Editors can insert posts" ON public.posts;

-- ============================================
-- YENİ INSERT POLİTİKASI
-- Kimliği doğrulanmış kullanıcılar 
-- KENDİ ID'leriyle yazı ekleyebilir
-- ============================================
CREATE POLICY "authenticated_users_can_insert_own_posts"
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
  '✅ Yeni INSERT politikası oluşturuldu' as status,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'posts' 
  AND cmd = 'INSERT';

