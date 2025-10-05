-- Airtable yazılarını Join PR'a ata - DOĞRU ID ile

-- 1. Önce durum
SELECT 
    'ÖNCE:' as durum,
    COUNT(*) as sayı,
    author_name
FROM posts
WHERE airtable_record_id IS NOT NULL
GROUP BY author_name;

-- 2. UPDATE - DOĞRU ID!
UPDATE posts
SET 
    author_id = '3cacdef5-1bcf-4563-961f-94b270407d35',  -- Join Pr'ın DOĞRU user_id'si
    author_name = 'Join Pr',
    updated_at = NOW()
WHERE airtable_record_id IS NOT NULL;

-- 3. Sonra durum
SELECT 
    'SONRA:' as durum,
    COUNT(*) as sayı,
    author_name
FROM posts
WHERE airtable_record_id IS NOT NULL
GROUP BY author_name;

-- 4. İlk 5 yazıyı göster
SELECT 
    title,
    author_name,
    author_id::text,
    status,
    created_at
FROM posts
WHERE airtable_record_id IS NOT NULL
ORDER BY created_at DESC
LIMIT 5;

