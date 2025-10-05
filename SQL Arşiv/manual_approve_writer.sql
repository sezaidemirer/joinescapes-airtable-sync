-- Manuel olarak saykoarmes22@gmail.com kullanıcısını onayla ve öne çıkan yap
-- Bu dosyayı Supabase SQL Editor'da çalıştırın

-- 1. Önce kullanıcıyı bul
SELECT 'Kullanıcı Bulundu:' as info;
SELECT id, email, raw_user_meta_data, created_at
FROM auth.users
WHERE email = 'saykoarmes22@gmail.com';

-- 2. Kullanıcının metadata'sını güncelle (onayla)
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  jsonb_set(
    jsonb_set(
      raw_user_meta_data,
      '{editor_approved}',
      'true'::jsonb
    ),
    '{is_approved}',
    'true'::jsonb
  ),
  '{approved_at}',
  ('"' || NOW()::text || '"')::jsonb
)
WHERE email = 'saykoarmes22@gmail.com';

-- 3. Writer profile oluştur veya güncelle
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
  COALESCE(au.raw_user_meta_data->>'first_name', '') || ' ' || 
  COALESCE(au.raw_user_meta_data->>'last_name', '') as name,
  'Editör & Seyahat Yazarı' as title,
  '' as bio,
  '' as location,
  true as is_featured,
  au.id as user_id,
  NOW() as created_at,
  NOW() as updated_at
FROM auth.users au
WHERE au.email = 'saykoarmes22@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET
  is_featured = true,
  updated_at = NOW();

-- 4. Sonuçları kontrol et
SELECT 'Güncelleme Sonrası:' as info;
SELECT 
  au.id,
  au.email,
  au.raw_user_meta_data->>'editor_approved' as editor_approved,
  au.raw_user_meta_data->>'is_approved' as is_approved,
  wp.name,
  wp.is_featured
FROM auth.users au
LEFT JOIN writer_profiles wp ON au.id = wp.user_id
WHERE au.email = 'saykoarmes22@gmail.com';

-- 5. Tüm öne çıkan yazarları listele
SELECT 'Tüm Öne Çıkan Yazarlar:' as info;
SELECT wp.id, wp.name, wp.title, wp.is_featured, au.email
FROM writer_profiles wp
JOIN auth.users au ON wp.user_id = au.id
WHERE wp.is_featured = true
ORDER BY wp.created_at DESC;
