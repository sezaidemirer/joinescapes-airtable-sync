-- Yazarların slug'larını basit yöntemle düzelt
-- Bu SQL'i Supabase SQL Editor'da çalıştırın

-- 1. Önce mevcut durumu göster
SELECT 
    id,
    name,
    slug,
    profile_image,
    CASE 
        WHEN slug IS NULL OR slug = '' THEN '❌ SLUG BOŞ'
        WHEN profile_image IS NOT NULL THEN '📸 FOTO VAR'
        ELSE '✅ NORMAL'
    END as durum
FROM writer_profiles
ORDER BY created_at DESC;

-- 2. Manuel olarak her yazarın slug'ını düzelt
-- Şu an sistemdeki yazarlar için:

UPDATE writer_profiles SET slug = 'ozan-dogmus' WHERE name = 'Ozan Dogmus' OR name ILIKE '%ozan%dogmus%';
UPDATE writer_profiles SET slug = 'sezai-demirer' WHERE name = 'Sezai Demirer' OR name ILIKE '%sezai%demirer%';
UPDATE writer_profiles SET slug = 'admin' WHERE name = 'admin' OR email = 'admin@joinescapes.com';
UPDATE writer_profiles SET slug = 'birsurvivorgeyigi' WHERE name = 'birsurvivorgeyigi' OR name ILIKE '%birsurvivor%';

-- Diğer olası isimler için (varsa):
UPDATE writer_profiles SET slug = 'semra-gulbahar' WHERE name = 'Semra Gülbahar' OR name ILIKE '%semra%';
UPDATE writer_profiles SET slug = 'murat-arkin' WHERE name = 'Murat Arkın' OR name ILIKE '%murat%';
UPDATE writer_profiles SET slug = 'aleyna-gemi' WHERE name = 'Aleyna Gemi' OR name ILIKE '%aleyna%';
UPDATE writer_profiles SET slug = 'beste-akkor' WHERE name = 'Beste Akkor' OR name ILIKE '%beste%';

-- 3. Kontrol: Güncellemeden sonra tüm slug'ları göster
SELECT 
    id,
    name,
    slug,
    profile_image IS NOT NULL as has_photo,
    CASE 
        WHEN slug IS NULL OR slug = '' THEN '❌ HALA BOŞ'
        ELSE '✅ SLUG TAMAM'
    END as sonuc
FROM writer_profiles
ORDER BY created_at DESC;

-- 4. Profil fotoğrafı olup slug'u olmayan varsa göster (olmamalı!)
SELECT 
    id,
    name,
    slug,
    profile_image,
    '⚠️ SORUN VAR!' as uyari
FROM writer_profiles
WHERE (slug IS NULL OR slug = '')
    AND profile_image IS NOT NULL
    AND profile_image != '';

