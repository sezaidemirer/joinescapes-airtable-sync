-- Trigger'ı test et

-- 1. Test: Bir post'u güncelle (airtable_record_id olan)
UPDATE posts 
SET title = 'TEST: Trigger Test - ' || NOW()
WHERE airtable_record_id IS NOT NULL
LIMIT 1;

-- 2. Güncellenen post'u kontrol et
SELECT id, title, airtable_record_id, updated_at
FROM posts
WHERE title LIKE 'TEST: Trigger Test%'
ORDER BY updated_at DESC
LIMIT 1;
