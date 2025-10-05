-- METADATA'YI KESİN ÇÖZÜM İLE DÜZELT
-- Frontend'e doğru rol bilgisini gönder

-- 1. Gulbahar Semra'nın mevcut metadata'sını kontrol et
SELECT 
    'MEVCUT METADATA' as test_type,
    au.email,
    au.raw_user_meta_data,
    au.raw_user_meta_data->>'role' as role_field,
    au.raw_user_meta_data->>'user_role' as user_role_field
FROM auth.users au
WHERE au.email = 'gulbahar.semra@hotmail.com';

-- 2. Metadata'yı TAMAMEN YENİDEN OLUŞTUR
UPDATE auth.users 
SET raw_user_meta_data = '{
    "role": "editor",
    "user_role": "editor",
    "editor_approved": "true",
    "is_approved": "true",
    "first_name": "Gulbahar",
    "last_name": "Semra",
    "full_name": "Gulbahar Semra",
    "author_name": "Gulbahar Semra",
    "bio": "",
    "location": "",
    "specialties": [],
    "social_media": {},
    "author_title": "Yazar",
    "profile_image": "",
    "email_confirmed": true
}'::jsonb
WHERE email = 'gulbahar.semra@hotmail.com';

-- 3. writer_profiles kaydını da güncelle
UPDATE writer_profiles 
SET 
    name = 'Gulbahar Semra',
    title = 'Yazar',
    is_featured = true
WHERE user_id = (
    SELECT id FROM auth.users 
    WHERE email = 'gulbahar.semra@hotmail.com'
);

-- 4. Eğer writer_profiles kaydı yoksa oluştur
INSERT INTO writer_profiles (user_id, name, email, title, is_featured)
SELECT 
    id,
    'Gulbahar Semra' as name,
    email,
    'Yazar' as title,
    true as is_featured
FROM auth.users 
WHERE email = 'gulbahar.semra@hotmail.com'
ON CONFLICT (user_id) DO UPDATE SET
    name = 'Gulbahar Semra',
    email = EXCLUDED.email,
    title = 'Yazar',
    is_featured = true;

-- 5. Düzeltilmiş durumu kontrol et
SELECT 
    'DÜZELTİLMİŞ METADATA' as test_type,
    au.email,
    au.raw_user_meta_data->>'role' as role_field,
    au.raw_user_meta_data->>'user_role' as user_role_field,
    au.raw_user_meta_data->>'editor_approved' as editor_approved,
    au.raw_user_meta_data->>'is_approved' as is_approved,
    au.raw_user_meta_data->>'first_name' as first_name,
    au.raw_user_meta_data->>'last_name' as last_name,
    wp.name as writer_name,
    wp.title as writer_title,
    wp.is_featured
FROM auth.users au
LEFT JOIN writer_profiles wp ON au.id = wp.user_id
WHERE au.email = 'gulbahar.semra@hotmail.com';

-- 6. TÜM YENİ KULLANICILAR İÇİN AYNI DÜZELTMELERİ YAP
-- Son 30 günde kayıt olan tüm editörleri bul ve düzelt
UPDATE auth.users 
SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{
    "role": "editor",
    "user_role": "editor",
    "editor_approved": "true",
    "is_approved": "true"
}'::jsonb
WHERE created_at >= NOW() - INTERVAL '30 days'
AND email != 'gulbahar.semra@hotmail.com'
AND (raw_user_meta_data->>'role' = 'editor' OR raw_user_meta_data->>'user_role' = 'editor');

-- 7. Son durumu kontrol et
SELECT 
    'SON DURUM' as test_type,
    COUNT(*) as total_editors,
    COUNT(CASE WHEN raw_user_meta_data->>'role' = 'editor' THEN 1 END) as role_editor_count,
    COUNT(CASE WHEN raw_user_meta_data->>'user_role' = 'editor' THEN 1 END) as user_role_editor_count
FROM auth.users 
WHERE raw_user_meta_data->>'role' = 'editor' 
OR raw_user_meta_data->>'user_role' = 'editor';
