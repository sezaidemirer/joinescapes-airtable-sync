-- Bora Bora ve Hakkari yazılarını ara
SELECT 
    id,
    title,
    airtable_record_id,
    author_name,
    status,
    created_at
FROM posts 
WHERE title ILIKE '%bora bora%'
   OR title ILIKE '%hakkari%'
   OR content ILIKE '%bora bora%'
   OR content ILIKE '%hakkari%'
   OR excerpt ILIKE '%bora bora%'
   OR excerpt ILIKE '%hakkari%'
ORDER BY created_at DESC;
