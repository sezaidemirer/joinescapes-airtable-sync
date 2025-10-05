-- Tüm Airtable yazılarını kontrol et
SELECT 
    id,
    title,
    airtable_record_id,
    author_name,
    status,
    updated_at
FROM posts 
WHERE author_name = 'Join PR' 
   OR author_id IS NULL
ORDER BY updated_at DESC
LIMIT 10;
