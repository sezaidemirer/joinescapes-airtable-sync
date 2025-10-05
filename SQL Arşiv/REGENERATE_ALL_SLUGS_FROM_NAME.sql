-- TÜM SLUG'LARI İSİM-SOYİSİM'DEN YENİDEN OLUŞTUR
-- Mail username yerine name kullan!

-- 1. Önce mevcut durumu göster
SELECT 
    id,
    name,
    slug,
    email,
    '❌ ESKİ SLUG (mail username)' as durum
FROM writer_profiles
ORDER BY created_at DESC;

-- 2. slugify fonksiyonu var mı kontrol et
-- Eğer yoksa, önce ADD_SLUG_TO_WRITER_PROFILES.sql'i çalıştır!

-- 3. TÜM SLUG'LARI YENİDEN OLUŞTUR (name'den)
UPDATE writer_profiles
SET slug = slugify(name);

-- 4. Kontrol: Yeni slug'ları göster
SELECT 
    id,
    name,
    slug,
    email,
    '✅ YENİ SLUG (isim-soyisim)' as durum
FROM writer_profiles
ORDER BY created_at DESC;

-- 5. Özel kontrol: Sevim Günahkar
SELECT 
    id,
    name,
    slug,
    email,
    CASE 
        WHEN slug = 'sevim-gunahkar' THEN '✅ DOĞRU SLUG'
        ELSE '❌ YANLIŞ SLUG: ' || slug
    END as kontrol
FROM writer_profiles
WHERE name ILIKE '%sevim%'
ORDER BY created_at DESC;

