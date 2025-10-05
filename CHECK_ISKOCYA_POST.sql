-- İskoçya yazısını kontrol et
SELECT 
    id,
    title,
    airtable_record_id,
    author_name,
    status,
    created_at,
    updated_at
FROM posts 
WHERE title ILIKE '%iskoçya%'
   OR title ILIKE '%scotland%'
ORDER BY updated_at DESC;
