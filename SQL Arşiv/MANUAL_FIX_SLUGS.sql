-- MANUEL SLUG DÜZELTMESİ (Fonksiyonsuz, direkt UPDATE)
-- Her yazarın slug'ını isim-soyisim formatına çevir

-- 1. Önce mevcut durumu göster
SELECT 
    id,
    name,
    slug,
    email
FROM writer_profiles
ORDER BY created_at DESC;

-- 2. Slug'ları manuel düzelt (isim-soyisim formatına çevir)

-- Sevim Günahkar (birsurvivorgeyigi → sevim-gunahkar)
UPDATE writer_profiles 
SET slug = 'sevim-gunahkar' 
WHERE name ILIKE '%sevim%';

-- Ozan Dogmus
UPDATE writer_profiles 
SET slug = 'ozan-dogmus' 
WHERE name ILIKE '%ozan%';

-- Sezai Demirer
UPDATE writer_profiles 
SET slug = 'sezai-demirer' 
WHERE name ILIKE '%sezai%' AND email = 'demirersezai@gmail.com';

-- Admin
UPDATE writer_profiles 
SET slug = 'admin' 
WHERE name = 'admin' OR email = 'admin@joinescapes.com';

-- 3. Kontrol: Yeni slug'ları göster
SELECT 
    id,
    name,
    slug,
    email,
    '✅ YENİ SLUG (isim-soyisim)' as durum
FROM writer_profiles
ORDER BY created_at DESC;

-- 4. URL test: Artık bu URL'ler çalışmalı
-- http://localhost:5173/yazar/sevim-gunahkar ✅
-- http://localhost:5173/yazar/ozan-dogmus ✅
-- http://localhost:5173/yazar/sezai-demirer ✅

