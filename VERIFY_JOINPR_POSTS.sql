-- Join PR kullanıcısının yazılarını kontrol et

-- 1. Join PR kullanıcısının ID'si
SELECT 
    id,
    email,
    raw_user_meta_data->>'full_name' as name
FROM auth.users
WHERE email = 'joinprmarketing@gmail.com';

-- 2. Join PR'a ait yazılar (author_id ile)
SELECT 
    COUNT(*) as toplam_yazi
FROM posts
WHERE author_id = (SELECT id FROM auth.users WHERE email = 'joinprmarketing@gmail.com');

-- 3. Join PR'a ait yazıları detaylı göster
SELECT 
    id,
    title,
    author_id,
    author_name,
    status,
    created_at
FROM posts
WHERE author_id = (SELECT id FROM auth.users WHERE email = 'joinprmarketing@gmail.com')
ORDER BY created_at DESC;

-- 4. Hala author_id = NULL olan yazı var mı?
SELECT 
    COUNT(*) as airtable_yazilari
FROM posts
WHERE author_id IS NULL;

-- 5. NULL olanları göster
SELECT 
    id,
    title,
    author_name,
    airtable_record_id
FROM posts
WHERE author_id IS NULL;

