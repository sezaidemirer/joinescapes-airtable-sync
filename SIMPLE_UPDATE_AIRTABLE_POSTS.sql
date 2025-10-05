-- Basit UPDATE - Airtable yazılarını Join PR'a ata

-- 1. Önce Join PR kullanıcısının ID'sini al
SELECT 
    id,
    email
FROM auth.users
WHERE email = 'joinprmarketing@gmail.com';

-- 2. Önce durum: Kaç Airtable yazısı var?
SELECT 
    'ÖNCE:' as durum,
    author_name,
    COUNT(*) as sayi
FROM posts
WHERE airtable_record_id IS NOT NULL
GROUP BY author_name;

-- 3. UPDATE YAP
UPDATE posts
SET 
    author_id = '3cacdef5-1bcf-4563-961f-94b270407d35',  -- Join PR user_id
    author_name = 'Join PR',
    updated_at = NOW()
WHERE airtable_record_id IS NOT NULL;

-- 4. Sonra durum: Kontrol
SELECT 
    'SONRA:' as durum,
    author_name,
    COUNT(*) as sayi
FROM posts
WHERE airtable_record_id IS NOT NULL
GROUP BY author_name;

-- 5. Join PR yazılarını göster
SELECT 
    id,
    title,
    author_name,
    author_id::text as author_id,
    status
FROM posts
WHERE airtable_record_id IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;

