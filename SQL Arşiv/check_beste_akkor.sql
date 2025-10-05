-- Beste akkor yazarının verilerini kontrol et
-- Bu dosyayı Supabase SQL Editor'da çalıştırın

-- 1. writer_profiles tablosunda kontrol et
SELECT * FROM writer_profiles 
WHERE name ILIKE '%beste%' 
   OR name ILIKE '%akkor%'
   OR name ILIKE '%beste akkor%';

-- 2. posts tablosunda author_name ile kontrol et
SELECT DISTINCT author_name FROM posts 
WHERE author_name ILIKE '%beste%' 
   OR author_name ILIKE '%akkor%'
   OR author_name ILIKE '%beste akkor%';

-- 3. auth.users tablosunda kontrol et (user_metadata)
SELECT 
  id,
  email,
  raw_user_meta_data->>'first_name' as first_name,
  raw_user_meta_data->>'last_name' as last_name,
  raw_user_meta_data->>'full_name' as full_name,
  raw_user_meta_data->>'author_name' as author_name
FROM auth.users 
WHERE email ILIKE '%beste%' 
   OR raw_user_meta_data->>'first_name' ILIKE '%beste%'
   OR raw_user_meta_data->>'last_name' ILIKE '%akkor%'
   OR raw_user_meta_data->>'full_name' ILIKE '%beste akkor%';

-- 4. Tüm writer_profiles tablosunu listele
SELECT id, name, title, bio, location, profile_image, specialties, social_media 
FROM writer_profiles 
ORDER BY name;
