-- ============================================
-- FIX_POSTS_INSERT_POLICY_V2.sql
-- Editörlerin yazı oluşturmasına izin ver (V2)
-- ============================================

-- ============================================
-- TÜM ESKİ INSERT POLİTİKALARINI KALDIR
-- ============================================
DROP POLICY IF EXISTS "posts_insert_policy" ON public.posts;
DROP POLICY IF EXISTS "Authenticated users can insert posts" ON public.posts;
DROP POLICY IF EXISTS "Users can insert their own posts" ON public.posts;
DROP POLICY IF EXISTS "Editors can insert posts" ON public.posts;
DROP POLICY IF EXISTS "authenticated_users_can_insert_own_posts" ON public.posts;
DROP POLICY IF EXISTS "Allow authenticated users to insert" ON public.posts;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.posts;

-- ============================================
-- MEVCUT DURUM KONTROLÜ
-- ============================================
SELECT 
  '📋 Mevcut INSERT politikaları (temizlenmeden önce):' as status,
  policyname,
  cmd
FROM pg_policies 
WHERE tablename = 'posts' 
  AND cmd = 'INSERT';

-- ============================================
-- YENİ INSERT POLİTİKASI OLUŞTUR
-- Kimliği doğrulanmış kullanıcılar 
-- KENDİ ID'leriyle yazı ekleyebilir
-- ============================================
CREATE POLICY "editors_can_create_posts"
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
  '✅ YENİ INSERT POLİTİKASI OLUŞTURULDU' as status,
  policyname,
  cmd,
  with_check
FROM pg_policies 
WHERE tablename = 'posts' 
  AND cmd = 'INSERT';

-- ============================================
-- TÜM POSTS POLİTİKALARINI GÖSTER
-- ============================================
SELECT 
  '📊 Tüm posts politikaları:' as info,
  policyname,
  cmd,
  roles,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'posts'
ORDER BY cmd, policyname;

