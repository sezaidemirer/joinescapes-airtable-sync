-- saykoarmes22@gmail.com yazarını kontrol et
-- Bu dosyayı Supabase SQL Editor'da çalıştırın

-- 1. auth.users tablosunda saykoarmes22@gmail.com kullanıcısını ara
SELECT 'Auth Users:' as info;
SELECT id, email, raw_user_meta_data, created_at
FROM auth.users
WHERE email = 'saykoarmes22@gmail.com';

-- 2. writer_profiles tablosunda saykoarmes22 ile ilgili yazarları ara
SELECT 'Writer Profiles:' as info;
SELECT id, name, title, bio, location, profile_image, specialties, social_media, is_featured, user_id, created_at, updated_at
FROM writer_profiles
WHERE name ILIKE '%saykoarmes%' 
   OR name ILIKE '%sayko%'
   OR name ILIKE '%armes%';

-- 3. posts tablosunda saykoarmes22 yazarının yazılarını ara
SELECT 'Posts:' as info;
SELECT id, title, author_name, status, published_at
FROM posts
WHERE author_name ILIKE '%saykoarmes%'
   OR author_name ILIKE '%sayko%'
   OR author_name ILIKE '%armes%';

-- 4. Tüm yazarları listele (karşılaştırma için)
SELECT 'All Writers:' as info;
SELECT id, name, title, is_featured, created_at
FROM writer_profiles
ORDER BY created_at DESC
LIMIT 10;
