-- Murat Arkın'ın writer_profiles'taki tam ismini kontrol et
-- Bu dosyayı Supabase SQL Editor'da çalıştırın

-- 1. Murat Arkın'ın writer_profiles'taki tam ismini kontrol et
SELECT 'Writer Profiles - Murat Arkın İsimleri:' as info;
SELECT id, name, title, user_id
FROM writer_profiles
WHERE user_id = '5095901b-e9e7-4009-b727-145c1e20d22f'
   OR name ILIKE '%murat%'
   OR name ILIKE '%arkın%'
   OR name ILIKE '%arkin%';

-- 2. Ana sayfadan gelen slug'ları test et
SELECT 'Slug Dönüşüm Testleri:' as info;
SELECT 
  'murat-arkin' as slug,
  'Murat Arkin' as slug_to_name_result,
  'Murat Arkın' as correct_name;

-- 3. Tüm yazarların isimlerini listele (karşılaştırma için)
SELECT 'Tüm Yazarların İsimleri:' as info;
SELECT id, name, title, is_featured
FROM writer_profiles
ORDER BY created_at DESC;
