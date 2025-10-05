-- TÜM KULLANICILARIN DISPLAY_NAME'İNİ DÜZELT
-- Bu script tüm kullanıcıların display_name'ini first_name + last_name olarak ayarlar

-- Önce mevcut durumu kontrol et
SELECT 
  'MEVCUT DURUM' as durum,
  email,
  display_name,
  raw_user_meta_data->>'first_name' as first_name,
  raw_user_meta_data->>'last_name' as last_name
FROM auth.users 
WHERE raw_user_meta_data->>'user_role' IN ('editor', 'yazar', 'supervisor')
ORDER BY created_at DESC;

-- Tüm editörlerin display_name'ini düzelt
UPDATE auth.users 
SET display_name = TRIM(
  COALESCE(raw_user_meta_data->>'first_name', '') || ' ' || 
  COALESCE(raw_user_meta_data->>'last_name', '')
)
WHERE raw_user_meta_data->>'user_role' IN ('editor', 'yazar', 'supervisor')
  AND (raw_user_meta_data->>'first_name' IS NOT NULL 
       OR raw_user_meta_data->>'last_name' IS NOT NULL);

-- Sonucu kontrol et
SELECT 
  'SONUÇ' as durum,
  email,
  display_name,
  raw_user_meta_data->>'first_name' as first_name,
  raw_user_meta_data->>'last_name' as last_name
FROM auth.users 
WHERE raw_user_meta_data->>'user_role' IN ('editor', 'yazar', 'supervisor')
ORDER BY created_at DESC;
