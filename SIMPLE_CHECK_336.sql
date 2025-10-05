-- Sadece Post ID 336'yı kontrol et

SELECT id, title, author_name, airtable_record_id, status
FROM posts
WHERE id = 336;
