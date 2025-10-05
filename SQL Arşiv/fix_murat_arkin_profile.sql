-- Murat Arkın yazar profilini düzelt
-- Bu dosyayı Supabase SQL Editor'da çalıştırın

-- 1. Murat Arkın'ın auth.users'taki bilgilerini kontrol et
SELECT 'Auth Users - Murat Arkın:' as info;
SELECT id, email, raw_user_meta_data, created_at
FROM auth.users
WHERE email = 'aleynagemi886@gmail.com';

-- 2. Murat Arkın'ın writer_profiles'taki bilgilerini kontrol et
SELECT 'Writer Profiles - Murat Arkın:' as info;
SELECT id, name, title, bio, location, profile_image, specialties, social_media, is_featured, user_id, created_at, updated_at
FROM writer_profiles
WHERE name ILIKE '%Murat Arkın%'
   OR name ILIKE '%murat%'
   OR name ILIKE '%arkın%'
   OR user_id = '5095901b-e9e7-4009-b727-145c1e20d22f';

-- 3. Murat Arkın için writer_profiles kaydı yoksa oluştur
INSERT INTO writer_profiles (
  name, 
  title, 
  bio, 
  location, 
  is_featured, 
  user_id, 
  created_at, 
  updated_at
)
SELECT 
  'Murat Arkın',
  'Seyahat Yazarı',
  'Seyahat tutkunu yazar',
  'İstanbul',
  true,
  '5095901b-e9e7-4009-b727-145c1e20d22f',
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM writer_profiles 
  WHERE user_id = '5095901b-e9e7-4009-b727-145c1e20d22f'
);

-- 4. Mevcut kayıt varsa güncelle
UPDATE writer_profiles
SET 
  name = 'Murat Arkın',
  title = 'Seyahat Yazarı',
  bio = COALESCE(bio, 'Seyahat tutkunu yazar'),
  location = COALESCE(location, 'İstanbul'),
  is_featured = true,
  updated_at = NOW()
WHERE user_id = '5095901b-e9e7-4009-b727-145c1e20d22f';

-- 5. Sonuçları kontrol et
SELECT 'Güncellenmiş Murat Arkın Profili:' as info;
SELECT id, name, title, bio, location, is_featured, user_id
FROM writer_profiles
WHERE user_id = '5095901b-e9e7-4009-b727-145c1e20d22f';

-- 6. RLS Policy'lerini kontrol et
SELECT 'Writer Profiles RLS Policies:' as info;
SELECT policyname, cmd, roles
FROM pg_policies
WHERE tablename = 'writer_profiles';
