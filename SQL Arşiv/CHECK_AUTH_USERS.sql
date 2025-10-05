-- ============================================
-- CHECK_AUTH_USERS.sql
-- Kullanıcının auth.users'da olup olmadığını kontrol et
-- ============================================

-- ============================================
-- 1. MEVCUT KULLANICI ID'SİNİ AL
-- ============================================
SELECT 
  '👤 MEVCUT KULLANICI:' as info,
  auth.uid() as current_user_id,
  auth.role() as current_role;

-- ============================================
-- 2. BU KULLANICI AUTH.USERS'DA VAR MI?
-- ============================================
SELECT 
  '🔍 AUTH.USERS KONTROLÜ:' as info,
  id,
  email,
  raw_user_meta_data->>'full_name' as full_name,
  raw_user_meta_data->>'user_role' as user_role,
  created_at
FROM auth.users
WHERE id = auth.uid();

-- ============================================
-- 3. TÜM EDİTÖRLERİ LİSTELE
-- ============================================
SELECT 
  '📋 TÜM EDİTÖRLER:' as info,
  id,
  email,
  raw_user_meta_data->>'full_name' as full_name,
  raw_user_meta_data->>'user_role' as user_role
FROM auth.users
WHERE raw_user_meta_data->>'user_role' = 'editor'
ORDER BY created_at DESC
LIMIT 10;

