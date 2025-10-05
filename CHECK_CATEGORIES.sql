-- Mevcut kategorileri kontrol et

SELECT 
    id,
    name,
    slug
FROM categories
ORDER BY id;

-- Destinasyon kategorisini bul
SELECT 
    id,
    name,
    slug
FROM categories
WHERE name ILIKE '%destinasyon%' 
   OR slug ILIKE '%destinasyon%';
