-- Airtable'dan gelen yazıların author_name'lerini kontrol et

-- 1. author_id = NULL olan tüm author_name'leri listele
SELECT DISTINCT
    author_name,
    COUNT(*) as yazı_sayisi
FROM posts
WHERE author_id IS NULL
GROUP BY author_name
ORDER BY COUNT(*) DESC;

-- 2. Tüm Airtable yazılarını detaylı göster
SELECT 
    id,
    title,
    author_name,
    author_id,
    airtable_record_id,
    status,
    created_at
FROM posts
WHERE author_id IS NULL
ORDER BY created_at DESC;

