-- Post ID 336'yı kontrol et

-- 1. Post 336 var mı?
SELECT id, title, author_name, airtable_record_id, status, created_at
FROM posts
WHERE id = 336;

-- 2. Tüm Airtable yazılarını listele
SELECT id, title, author_name, airtable_record_id, status
FROM posts
WHERE airtable_record_id IS NOT NULL
ORDER BY created_at DESC;

-- 3. RLS durumu
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'posts';
