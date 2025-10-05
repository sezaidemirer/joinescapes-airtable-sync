-- Eski şablon verilerini kontrol et ve temizle
-- Bu dosyayı Supabase SQL Editor'da çalıştırın

-- 1. writer_profiles tablosunda eski şablon verilerini kontrol et
SELECT id, name, title, bio, location, specialties, social_media 
FROM writer_profiles 
WHERE bio ILIKE '%sez%' 
   OR bio ILIKE '%geliyorum%'
   OR name ILIKE '%saykoarmes%'
   OR social_media::text ILIKE '%sezaidemirer%';

-- 2. auth.users tablosunda eski şablon verilerini kontrol et
SELECT 
  id,
  email,
  raw_user_meta_data->>'first_name' as first_name,
  raw_user_meta_data->>'last_name' as last_name,
  raw_user_meta_data->>'bio' as bio,
  raw_user_meta_data->>'author_title' as author_title,
  raw_user_meta_data->>'location' as location,
  raw_user_meta_data->>'social_media' as social_media
FROM auth.users 
WHERE raw_user_meta_data->>'bio' ILIKE '%sez%' 
   OR raw_user_meta_data->>'bio' ILIKE '%geliyorum%'
   OR raw_user_meta_data->>'social_media' ILIKE '%sezaidemirer%';

-- 3. Eski şablon verilerini temizle (writer_profiles)
UPDATE writer_profiles 
SET 
  bio = '',
  location = '',
  specialties = '{}',
  social_media = '{}'::jsonb,
  profile_image = ''
WHERE bio ILIKE '%sez%' 
   OR bio ILIKE '%geliyorum%'
   OR name ILIKE '%saykoarmes%'
   OR social_media::text ILIKE '%sezaidemirer%';

-- 4. Eski şablon verilerini temizle (auth.users)
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  jsonb_set(
    jsonb_set(
      jsonb_set(
        jsonb_set(
          raw_user_meta_data,
          '{bio}', '""'
        ),
        '{location}', '""'
      ),
      '{specialties}', '[]'
    ),
    '{social_media}', '{}'
  ),
  '{profile_image}', '""'
)
WHERE raw_user_meta_data->>'bio' ILIKE '%sez%' 
   OR raw_user_meta_data->>'bio' ILIKE '%geliyorum%'
   OR raw_user_meta_data->>'social_media' ILIKE '%sezaidemirer%';

-- 5. Sonuçları kontrol et
SELECT 'Temizleme tamamlandı!' as status;
