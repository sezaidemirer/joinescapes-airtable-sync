-- Profil fotoğrafı olan yazarların slug'larını ve bilgilerini kontrol et
-- Slug NULL veya yanlış olanları bul

SELECT 
    id,
    name,
    slug,
    profile_image,
    email,
    created_at,
    CASE 
        WHEN slug IS NULL THEN '❌ SLUG YOK'
        WHEN profile_image IS NOT NULL AND profile_image != '' THEN '📸 FOTO VAR'
        ELSE '📷 FOTO YOK'
    END as durum
FROM writer_profiles
ORDER BY created_at DESC;

-- Profil fotoğrafı olup slug'u NULL olan yazarlar (SORUN BUNLAR!)
SELECT 
    id,
    name,
    slug,
    profile_image,
    email,
    '⚠️ SORUN: Foto var ama slug yok!' as problem
FROM writer_profiles
WHERE profile_image IS NOT NULL 
    AND profile_image != ''
    AND (slug IS NULL OR slug = '');

-- Tüm yazarların slug'larını güncelle (slugify fonksiyonunu kullan)
UPDATE writer_profiles
SET slug = slugify(name)
WHERE slug IS NULL OR slug = '';

-- Kontrol: Güncellemeden sonra durum
SELECT 
    id,
    name,
    slug,
    profile_image,
    CASE 
        WHEN slug IS NULL OR slug = '' THEN '❌ HALA BOŞ'
        ELSE '✅ SLUG TAMAM'
    END as sonuc
FROM writer_profiles
ORDER BY created_at DESC;

