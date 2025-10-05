-- Gerçek yazarları writer_profiles tablosuna ekle
-- Bu dosyayı Supabase SQL Editor'da çalıştırın

-- 1. Önce mevcut yazarları kontrol et
SELECT 'Mevcut yazarlar:' as info;
SELECT id, name, title, bio, is_featured FROM writer_profiles;

-- 2. Önce mevcut yazarları sil (test verisi hariç)
DELETE FROM writer_profiles WHERE name = 'Test Yazar';

-- 3. Gerçek yazarları ekle (ON CONFLICT olmadan)
INSERT INTO writer_profiles (name, title, bio, location, is_featured, created_at)
VALUES 
  ('Beste Akkor', 'Seyyah', 'Ben Beste Akkor. Gezmeyi ve yeni yerler keşfetmeyi seviyorum.', 'İstanbul', true, NOW()),
  ('Aleyna Gemi', 'Öğrenci', 'Ben komilerin komisi', 'Mersin', true, NOW()),
  ('Aleyna Rey Gemi', 'Editör', 'Editör ve seyahat yazarı', 'İstanbul', true, NOW()),
  ('saykoarmes22 de', 'Editör & Seyahat Yazarı', 'Ben Sez geliyorums', 'İstanbul', false, NOW());

-- 4. Sonuçları kontrol et
SELECT 'Eklenen yazarlar:' as info;
SELECT id, name, title, bio, is_featured, created_at 
FROM writer_profiles 
ORDER BY is_featured DESC, created_at DESC;

-- 5. Öne çıkan yazarları say
SELECT 'Öne çıkan yazar sayısı:' as info;
SELECT COUNT(*) as featured_count 
FROM writer_profiles 
WHERE is_featured = true;
