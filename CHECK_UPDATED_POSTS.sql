-- Güncellenen yazıları kontrol et
SELECT 
    id,
    title,
    airtable_record_id,
    author_name,
    status,
    updated_at
FROM posts 
WHERE airtable_record_id IS NOT NULL
ORDER BY updated_at DESC
LIMIT 10;
