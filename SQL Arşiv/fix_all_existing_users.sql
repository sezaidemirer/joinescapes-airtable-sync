-- TÜM MEVCUT KULLANICILARIN USER_METADATA'SINI DÜZELT
-- Bu script tüm editörlerin user_metadata'sını günceller

-- Önce mevcut durumu kontrol et
SELECT 
  'Mevcut Durum' as durum,
  COUNT(*) as toplam_editör,
  COUNT(CASE WHEN raw_user_meta_data->>'first_name' IS NOT NULL THEN 1 END) as first_name_var,
  COUNT(CASE WHEN raw_user_meta_data->>'last_name' IS NOT NULL THEN 1 END) as last_name_var
FROM auth.users 
WHERE raw_user_meta_data->>'user_role' IN ('editor', 'yazar', 'supervisor');

-- Tüm editörlerin user_metadata'sını güncelle
UPDATE auth.users 
SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object(
  'first_name', COALESCE(
    raw_user_meta_data->>'first_name',
    SPLIT_PART(email, '@', 1)
  ),
  'last_name', COALESCE(
    raw_user_meta_data->>'last_name',
    ''
  ),
  'full_name', COALESCE(
    raw_user_meta_data->>'full_name',
    SPLIT_PART(email, '@', 1)
  )
)
WHERE raw_user_meta_data->>'user_role' IN ('editor', 'yazar', 'supervisor')
  AND (raw_user_meta_data->>'first_name' IS NULL OR raw_user_meta_data->>'last_name' IS NULL);

-- Sonucu kontrol et
SELECT 
  'Sonuç' as durum,
  COUNT(*) as toplam_editör,
  COUNT(CASE WHEN raw_user_meta_data->>'first_name' IS NOT NULL THEN 1 END) as first_name_var,
  COUNT(CASE WHEN raw_user_meta_data->>'last_name' IS NOT NULL THEN 1 END) as last_name_var
FROM auth.users 
WHERE raw_user_meta_data->>'user_role' IN ('editor', 'yazar', 'supervisor');

-- Güncellenen kullanıcıları listele
SELECT 
  email,
  raw_user_meta_data->>'first_name' as first_name,
  raw_user_meta_data->>'last_name' as last_name,
  raw_user_meta_data->>'full_name' as full_name,
  raw_user_meta_data->>'user_role' as user_role
FROM auth.users 
WHERE raw_user_meta_data->>'user_role' IN ('editor', 'yazar', 'supervisor')
ORDER BY email;
