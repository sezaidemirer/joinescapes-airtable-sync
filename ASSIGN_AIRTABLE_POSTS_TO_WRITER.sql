-- Airtable yazılarını joinprmarketing@gmail.com yazarına ata
-- Bu yazılar artık o yazara ait olacak ve düzenleyebilecek

-- 1. Önce yazarın ID'sini bul
SELECT 
    id as user_id,
    email,
    raw_user_meta_data->>'user_role' as role,
    raw_user_meta_data->>'full_name' as name
FROM auth.users
WHERE email = 'joinprmarketing@gmail.com';

-- 2. Writer profile'ını kontrol et
SELECT 
    id as profile_id,
    user_id,
    name,
    email,
    is_approved
FROM writer_profiles
WHERE email = 'joinprmarketing@gmail.com';

-- 3. Airtable'daki "Join PR" assignee'li yazıları bul
SELECT 
    id,
    title,
    author_id,
    author_name,
    airtable_record_id,
    status
FROM posts
WHERE author_name = 'Join PR'
   OR author_name ILIKE '%Join PR%'
   OR author_name ILIKE '%joinprmarketing%'
ORDER BY created_at DESC;

-- 4. Join PR yazılarını joinprmarketing@gmail.com kullanıcısına ata
UPDATE posts
SET 
    author_id = (SELECT id FROM auth.users WHERE email = 'joinprmarketing@gmail.com'),
    author_name = 'Join PR'
WHERE 
    (author_name = 'Join PR' OR author_name ILIKE '%Join PR%')
    AND author_id IS NULL;

-- 5. Kontrol: Kaç yazı güncellendi?
SELECT 
    '✅ Güncellenen yazılar:' as durum,
    COUNT(*) as sayi
FROM posts
WHERE author_id = (SELECT id FROM auth.users WHERE email = 'joinprmarketing@gmail.com');

-- 6. Güncellenmiş yazıları göster
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

