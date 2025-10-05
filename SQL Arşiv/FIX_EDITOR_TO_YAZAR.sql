-- Sistemdeki TÜM "editor" rollerini "yazar"a çevir
-- Bu SQL'i Supabase SQL Editor'da çalıştırın

-- 1. Önce kaç tane editor var kontrol et
SELECT 
    email,
    raw_user_meta_data->>'user_role' as current_role,
    raw_user_meta_data->>'firstName' as first_name,
    raw_user_meta_data->>'lastName' as last_name
FROM auth.users
WHERE raw_user_meta_data->>'user_role' = 'editor';

-- 2. TÜM editor'leri yazar'a çevir
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
    raw_user_meta_data::jsonb,
    '{user_role}',
    '"yazar"'
)
WHERE raw_user_meta_data->>'user_role' = 'editor';

-- 3. Kontrol: Artık editor kalmamalı
SELECT 
    email,
    raw_user_meta_data->>'user_role' as new_role,
    raw_user_meta_data->>'firstName' as first_name,
    raw_user_meta_data->>'lastName' as last_name
FROM auth.users
WHERE raw_user_meta_data->>'user_role' = 'yazar'
ORDER BY created_at DESC;

-- 4. Emin olmak için: Hala editor kaldı mı?
SELECT COUNT(*) as kalan_editor_sayisi
FROM auth.users
WHERE raw_user_meta_data->>'user_role' = 'editor';

