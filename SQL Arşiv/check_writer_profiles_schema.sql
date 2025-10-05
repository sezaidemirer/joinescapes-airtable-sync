-- Writer_profiles tablosu şemasını kontrol et
-- Bu dosyayı Supabase SQL Editor'da çalıştırın

-- 1. Writer_profiles tablosunun kolonlarını listele
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'writer_profiles'
ORDER BY ordinal_position;

-- 2. is_featured kolonu var mı kontrol et
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'writer_profiles' 
      AND column_name = 'is_featured'
    ) THEN 'is_featured kolonu VAR'
    ELSE 'is_featured kolonu YOK'
  END as is_featured_status;

-- 3. Mevcut yazarları listele
SELECT id, name, title, bio, is_featured, created_at
FROM writer_profiles
ORDER BY created_at DESC;

-- 4. Eğer is_featured kolonu yoksa ekle
ALTER TABLE writer_profiles 
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;

-- 5. Mevcut yazarları öne çıkan olarak işaretle (test için)
UPDATE writer_profiles 
SET is_featured = TRUE 
WHERE name IN ('Beste Akkor', 'Aleyna Gemi', 'Aleyna Rey Gemi');

-- 6. Sonuçları kontrol et
SELECT id, name, title, is_featured
FROM writer_profiles
ORDER BY is_featured DESC, created_at DESC;
