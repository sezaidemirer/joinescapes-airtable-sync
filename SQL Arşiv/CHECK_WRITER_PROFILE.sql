-- Semra Gülbahar yazarının profil bilgilerini kontrol et

-- 1. Writer profiles tablosunda ara
SELECT 
    id,
    name,
    title,
    bio,
    user_id,
    profile_image,
    created_at
FROM writer_profiles
WHERE 
    name ILIKE '%semra%' 
    OR name ILIKE '%gulbahar%'
    OR name ILIKE '%gülbahar%';

-- 2. Posts tablosunda bu yazarın yazılarını kontrol et
SELECT 
    id,
    title,
    author_name,
    author_id,
    status,
    published_at
FROM posts
WHERE 
    author_name ILIKE '%semra%' 
    OR author_name ILIKE '%gulbahar%'
    OR author_name ILIKE '%gülbahar%'
ORDER BY published_at DESC
LIMIT 10;

-- 3. Tüm yazar isimlerini listele (unique)
SELECT DISTINCT author_name
FROM posts
WHERE author_name IS NOT NULL
ORDER BY author_name;

-- 4. Writer profiles'daki tüm yazarları listele
SELECT 
    id,
    name,
    title,
    created_at
FROM writer_profiles
ORDER BY name;

