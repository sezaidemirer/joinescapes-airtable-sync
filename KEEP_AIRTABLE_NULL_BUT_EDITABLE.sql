-- Airtable yazılarını NULL bırak, admin düzenleyebilsin

-- 1. Mevcut durum
SELECT 
    'ÖNCE:' as durum,
    COUNT(*) as airtable_yazı_sayısı,
    author_name
FROM posts
WHERE airtable_record_id IS NOT NULL
GROUP BY author_name;

-- 2. RLS politikasını kontrol et - admin tüm NULL yazıları düzenleyebilmeli
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'posts' AND cmd = 'UPDATE';

-- 3. Airtable yazılarını kontrol et
SELECT 
    id::text,
    title,
    author_id::text,
    author_name,
    airtable_record_id,
    status
FROM posts
WHERE airtable_record_id IS NOT NULL
ORDER BY created_at DESC
LIMIT 5;

