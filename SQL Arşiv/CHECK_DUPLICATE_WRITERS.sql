-- Duplicate (tekrarlayan) yazarları kontrol et
-- Aynı isimde birden fazla yazar var mı?

-- 1. Tüm yazarları ve slug'larını göster
SELECT 
    id,
    name,
    slug,
    email,
    profile_image IS NOT NULL as has_photo,
    created_at
FROM writer_profiles
ORDER BY name, created_at;

-- 2. Aynı isimde birden fazla yazar var mı?
SELECT 
    name,
    COUNT(*) as adet,
    array_agg(id) as ids,
    array_agg(email) as emails
FROM writer_profiles
GROUP BY name
HAVING COUNT(*) > 1;

-- 3. Aynı slug'a sahip birden fazla yazar var mı?
SELECT 
    slug,
    COUNT(*) as adet,
    array_agg(name) as names,
    array_agg(email) as emails
FROM writer_profiles
WHERE slug IS NOT NULL
GROUP BY slug
HAVING COUNT(*) > 1;

-- 4. NULL veya boş slug'ları göster
SELECT 
    id,
    name,
    slug,
    email,
    profile_image
FROM writer_profiles
WHERE slug IS NULL OR slug = ''
ORDER BY created_at DESC;

