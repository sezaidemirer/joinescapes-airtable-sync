-- Normal kullanıcıları (user_role = 'user') writer_profiles'dan temizle

-- 1. Önce kontrol et - kimleri sileceğiz?
SELECT 
    wp.id as profile_id,
    wp.name as yazar_adi,
    wp.email as email,
    au.raw_user_meta_data->>'user_role' as user_role
FROM writer_profiles wp
LEFT JOIN auth.users au ON wp.user_id = au.id
WHERE au.raw_user_meta_data->>'user_role' = 'user'
   OR (au.raw_user_meta_data->>'user_role' IS NULL AND wp.user_id IS NOT NULL);

-- 2. Normal kullanıcıları sil
DELETE FROM writer_profiles
WHERE user_id IN (
    SELECT id FROM auth.users 
    WHERE raw_user_meta_data->>'user_role' = 'user'
);

-- 3. Kontrol: Kalan yazarları göster (sadece editörler kalmalı)
SELECT 
    wp.id as profile_id,
    wp.name as yazar_adi,
    wp.email as email,
    au.raw_user_meta_data->>'user_role' as user_role,
    au.raw_user_meta_data->>'editor_approved' as onay_durumu
FROM writer_profiles wp
LEFT JOIN auth.users au ON wp.user_id = au.id
ORDER BY wp.created_at DESC;

