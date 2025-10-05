-- Murat Arkın profilini public erişim için düzelt
-- Bu dosyayı Supabase SQL Editor'da çalıştırın

-- 1. Önce Murat Arkın'ın writer_profiles kaydını kontrol et
SELECT 'Murat Arkın Writer Profile:' as info;
SELECT id, name, title, bio, location, is_featured, user_id
FROM writer_profiles
WHERE user_id = '5095901b-e9e7-4009-b727-145c1e20d22f';

-- 2. Eğer kayıt yoksa oluştur
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

-- 3. Mevcut kayıt varsa güncelle
UPDATE writer_profiles
SET 
  name = 'Murat Arkın',
  title = 'Seyahat Yazarı',
  bio = COALESCE(bio, 'Seyahat tutkunu yazar'),
  location = COALESCE(location, 'İstanbul'),
  is_featured = true,
  updated_at = NOW()
WHERE user_id = '5095901b-e9e7-4009-b727-145c1e20d22f';

-- 4. RLS Policy'lerini güçlendir (public okuma için)
DROP POLICY IF EXISTS "writer_profiles_public_select" ON writer_profiles;

CREATE POLICY "Allow public read access to all writer_profiles"
ON writer_profiles FOR SELECT
USING (true);

-- 5. Sonuçları kontrol et
SELECT 'Güncellenmiş Murat Arkın Profili:' as info;
SELECT id, name, title, bio, location, is_featured, user_id
FROM writer_profiles
WHERE user_id = '5095901b-e9e7-4009-b727-145c1e20d22f';

-- 6. Public erişim testi
SELECT 'Public Erişim Testi:' as info;
SELECT COUNT(*) as accessible_profiles
FROM writer_profiles;
