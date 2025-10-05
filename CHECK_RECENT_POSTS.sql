-- Son eklenen yazıları kontrol et
SELECT 
    id,
    title,
    airtable_record_id,
    author_name,
    status,
    created_at,
    updated_at
FROM posts 
WHERE airtable_record_id IS NOT NULL
ORDER BY created_at DESC
LIMIT 5;
