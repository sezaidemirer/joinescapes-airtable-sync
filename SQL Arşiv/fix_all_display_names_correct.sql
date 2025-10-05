-- TÜM KULLANICILARIN DISPLAY_NAME'İNİ DÜZELT
-- display_name kolonu yok, raw_user_meta_data içinde full_name olarak kaydediliyor

-- Önce mevcut durumu kontrol et
SELECT 
  'MEVCUT DURUM' as durum,
  email,
  raw_user_meta_data->>'full_name' as full_name,
  raw_user_meta_data->>'first_name' as first_name,
  raw_user_meta_data->>'last_name' as last_name
FROM auth.users 
WHERE raw_user_meta_data->>'user_role' IN ('editor', 'yazar', 'supervisor')
ORDER BY created_at DESC;

-- Tüm editörlerin full_name'ini düzelt
UPDATE auth.users 
SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object(
  'full_name', TRIM(
    COALESCE(raw_user_meta_data->>'first_name', '') || ' ' || 
    COALESCE(raw_user_meta_data->>'last_name', '')
  )
)
WHERE raw_user_meta_data->>'user_role' IN ('editor', 'yazar', 'supervisor')
  AND (raw_user_meta_data->>'first_name' IS NOT NULL 
       OR raw_user_meta_data->>'last_name' IS NOT NULL);

-- Sonucu kontrol et
SELECT 
  'SONUÇ' as durum,
  email,
  raw_user_meta_data->>'full_name' as full_name,
  raw_user_meta_data->>'first_name' as first_name,
  raw_user_meta_data->>'last_name' as last_name
FROM auth.users 
WHERE raw_user_meta_data->>'user_role' IN ('editor', 'yazar', 'supervisor')
ORDER BY created_at DESC;
