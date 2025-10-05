-- Herhangi bir Airtable yazısını bul

SELECT id, title, author_name, airtable_record_id, status
FROM posts
WHERE airtable_record_id IS NOT NULL
ORDER BY created_at DESC
LIMIT 3;
