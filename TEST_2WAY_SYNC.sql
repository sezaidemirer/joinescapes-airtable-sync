-- Test: 2-way sync düzeltmesi
UPDATE posts 
SET title = '2-WAY SYNC TEST: ' || NOW()
WHERE id = (
    SELECT id FROM posts 
    WHERE airtable_record_id IS NOT NULL 
    LIMIT 1
);

-- Güncellenen post'u kontrol et
SELECT id, title, airtable_record_id, updated_at
FROM posts
WHERE title LIKE '2-WAY SYNC TEST%'
ORDER BY updated_at DESC
LIMIT 1;
