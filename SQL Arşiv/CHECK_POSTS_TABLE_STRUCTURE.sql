-- ============================================
-- CHECK_POSTS_TABLE_STRUCTURE.sql
-- Posts tablosunun yapısını kontrol et
-- ============================================

-- ============================================
-- 1. POSTS TABLOSU KOLONLARINI LİSTELE
-- ============================================
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'posts'
ORDER BY ordinal_position;

-- ============================================
-- 2. AUTHOR_ID KOLONU DETAYLI KONTROL
-- ============================================
SELECT 
  '🔍 AUTHOR_ID KOLONU:' as info,
  column_name,
  data_type,
  is_nullable,
  column_default,
  udt_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'posts'
  AND column_name = 'author_id';

-- ============================================
-- 3. POSTS TABLOSU YAPISAL BİLGİLER
-- ============================================
SELECT 
  '📊 TABLO BİLGİLERİ:' as info,
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name = 'posts';

