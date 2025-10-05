-- Airtable yazısını bul ve test et

-- 1. Airtable yazısını bul
SELECT 
    id::text,
    title,
    author_name,
    airtable_record_id,
    status,
    created_at
FROM posts
WHERE airtable_record_id IS NOT NULL
ORDER BY created_at DESC
LIMIT 1;
