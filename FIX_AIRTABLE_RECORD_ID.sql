-- Post 340'a airtable_record_id ekle

-- 1. Mevcut durum
SELECT id, title, author_name, airtable_record_id, status
FROM posts
WHERE id = 340;

-- 2. airtable_record_id ekle (test için)
UPDATE posts
SET airtable_record_id = 'recS3jceZJ4WX6ug3'
WHERE id = 340;

-- 3. Kontrol
SELECT id, title, author_name, airtable_record_id, status
FROM posts
WHERE id = 340;
