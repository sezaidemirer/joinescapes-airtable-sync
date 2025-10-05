-- Final test: Trigger + Edge Function

-- 1. Test: Bir post'u güncelle (airtable_record_id olan)
UPDATE posts 
SET title = 'FINAL TEST: Trigger + Edge Function - ' || NOW()
WHERE id = (
    SELECT id FROM posts 
    WHERE airtable_record_id IS NOT NULL 
    LIMIT 1
);

-- 2. Güncellenen post'u kontrol et
SELECT id, title, airtable_record_id, updated_at
FROM posts
WHERE title LIKE 'FINAL TEST%'
ORDER BY updated_at DESC
LIMIT 1;
